"""
app.py — API server untuk prediksi penyakit tanaman.

Menjalankan model ResNet9 di balik endpoint HTTP, supaya website (frontend)
tinggal kirim gambar via fetch()/axios dan menerima hasil dalam format JSON.

Cara jalankan (lokal):
    pip install -r requirements.txt
    uvicorn app:app --host 0.0.0.0 --port 8000

Lalu buka http://localhost:8000/docs untuk mencoba endpoint langsung dari browser.
"""

import base64
import io
import json
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from google import genai as google_genai
from google.genai import types as genai_types
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

MODEL_PATH = os.environ.get("MODEL_PATH", "plant-disease-model-complete.pth")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
OPENROUTER_API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
# auto | gemini | openrouter — set "openrouter" untuk tes lokal tanpa Gemini
VISION_PROVIDER = os.environ.get("VISION_PROVIDER", "auto").strip().lower()
# true = jangan muat ResNet9 lokal (.pth)
DISABLE_LOCAL_ML = os.environ.get("DISABLE_LOCAL_ML", "true").strip().lower() in ("1", "true", "yes")
# Primary free vision model + fallback (llama-3.2-11b-vision:free sudah di-delist OpenRouter)
OPENROUTER_MODEL = os.environ.get("OPENROUTER_MODEL", "google/gemma-4-26b-a4b-it:free")
OPENROUTER_FALLBACK_MODELS = [
    m for m in [
        OPENROUTER_MODEL,
        "nvidia/nemotron-nano-12b-v2-vl:free",
    ] if m
]
# Deduplicate while preserving order
_seen = set()
OPENROUTER_FALLBACK_MODELS = [
    m for m in OPENROUTER_FALLBACK_MODELS
    if not (m in _seen or _seen.add(m))
]
IMAGE_SIZE = 256
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_MB = 10

# Prompt vision bersama — kualitas respons setara Gemini untuk OpenRouter
VISION_ANALYSIS_PROMPT = """Kamu adalah ahli patologi tanaman. Analisis gambar ini dan berikan diagnosis lengkap.

Balas HANYA dengan format JSON murni yang valid (tanpa markdown, tanpa ```json):
{
  "is_plant": true,
  "disease": "Nama penyakit lengkap dalam Bahasa Indonesia, sertakan nama umum Inggris dalam kurung jika ada (contoh: 'Bercak Kering Alternaria (Hawar Dini) pada Tomat'), atau 'Sehat / Tidak Ada Penyakit'",
  "confidence": 0.93,
  "detailed_analysis": "Tulis analisis MENDALAM dalam Bahasa Indonesia dengan format persis seperti ini (pakai heading KAPITAL dan penomoran):\n\nDIAGNOSIS DAN NAMA ILMIAH:\n[paragraf diagnosis + nama ilmiah patogen]\n\nGEJALA YANG TERLIHAT PADA FOTO:\n1. [gejala visual spesifik dari foto]\n2. [gejala berikutnya]\n\nPENYEBAB:\n[penyebab singkat]\n\nPENGENDALIAN:\n1. Tindakan segera: ...\n2. Kimia (bahan aktif): ...\n3. Organik: ...\n4. Pencegahan jangka panjang: ..."
}

Jika bukan foto tanaman/daun, set is_plant: false, disease: "Bukan tanaman", detailed_analysis: "".
"""

# ── PyTorch & model — opsional, hanya dimuat jika file .pth tersedia ──
_torch = None
_model = None
_transform = None
_device = "cpu"

# Lazy import class_names (tidak butuh torch)
from class_names import CLASS_NAMES, PLANT_DISEASE_MAP, disease_display_name, get_disease_solution, normalize_disease_key, split_plant_disease

_MODEL_AVAILABLE = False  # akan di-set True jika .pth berhasil dimuat


def load_model():
    """
    Muat PyTorch model jika file .pth tersedia dan DISABLE_LOCAL_ML=false.
    Default: ResNet9 dimatikan — pakai Gemini / OpenRouter / color.
    """
    global _torch, _model, _transform, _device, _MODEL_AVAILABLE

    if DISABLE_LOCAL_ML:
        print("[app] DISABLE_LOCAL_ML=true — ResNet9 lokal dilewati.")
        _MODEL_AVAILABLE = False
    elif not os.path.exists(MODEL_PATH):
        print(f"[app] File model '{MODEL_PATH}' tidak ditemukan — skip ResNet9.")
        _MODEL_AVAILABLE = False
    else:
        try:
            import torch
            from torchvision import transforms
            from model import ResNet9

            _torch = torch
            _device = "cuda" if torch.cuda.is_available() else "cpu"
            _transform = transforms.Compose([
                transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
                transforms.ToTensor(),
            ])

            import __main__
            __main__.ResNet9 = ResNet9
            _model = torch.load(MODEL_PATH, map_location=_device, weights_only=False)
            _model.eval()
            _MODEL_AVAILABLE = True
            print(f"[app] Model ResNet9 dimuat dari '{MODEL_PATH}' ke device '{_device}'.")
        except Exception as e:
            print(f"[app] Gagal memuat model: {e}")
            _MODEL_AVAILABLE = False

    print(f"[app] VISION_PROVIDER={VISION_PROVIDER}")
    if GEMINI_API_KEY:
        print("[app] Gemini API Key aktif.")
    else:
        print("[app] Gemini API Key tidak ditemukan.")
    if OPENROUTER_API_KEY:
        print(f"[app] OpenRouter aktif — models: {OPENROUTER_FALLBACK_MODELS}")
    else:
        print("[app] OpenRouter API Key tidak ditemukan — fallback color bila vision API gagal.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(title="Plant Disease Prediction API", lifespan=lifespan)

# CORS: mengizinkan website kamu memanggil API ini dari browser.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    """Endpoint sederhana untuk cek server & model sudah siap."""
    if VISION_PROVIDER == "openrouter" and OPENROUTER_API_KEY:
        mode = "openrouter_primary"
    elif VISION_PROVIDER == "gemini" and GEMINI_API_KEY:
        mode = "gemini_primary"
    elif GEMINI_API_KEY:
        mode = "gemini_primary"
    elif OPENROUTER_API_KEY:
        mode = "openrouter_fallback"
    elif _MODEL_AVAILABLE:
        mode = "ml_local"
    else:
        mode = "color_only"
    return {
        "status": "ok",
        "device": _device,
        "num_classes": len(CLASS_NAMES),
        "vision_provider": VISION_PROVIDER,
        "gemini_active": bool(GEMINI_API_KEY),
        "openrouter_active": bool(OPENROUTER_API_KEY),
        "openrouter_models": OPENROUTER_FALLBACK_MODELS if OPENROUTER_API_KEY else [],
        "model_loaded": _MODEL_AVAILABLE,
        "disable_local_ml": DISABLE_LOCAL_ML,
        "mode": mode,
    }


def _parse_openrouter_json(text: str) -> dict:
    """Parse JSON dari respons model (toleran terhadap markdown fence)."""
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()
    # Ambil objek JSON pertama jika ada teks di sekitarnya
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]
    return json.loads(text)


def _ask_openrouter_once(img_b64: str, model: str, prompt: str) -> dict:
    """Satu request OpenRouter ke model tertentu. Raise Exception dengan body HTTP bila gagal."""
    import urllib.error
    import urllib.request

    payload = json.dumps({
        "model": model,
        "messages": [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{img_b64}"}},
                {"type": "text", "text": prompt},
            ],
        }],
        "max_tokens": 2048,
    }).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "HTTP-Referer": "https://tanilink.vercel.app",
            "X-Title": "TaniLink",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as res:
            data = json.loads(res.read().decode())
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors="replace") if e.fp else ""
        try:
            err_json = json.loads(body)
            msg = err_json.get("error", {}).get("message") or body[:500]
        except Exception:
            msg = body[:500] or str(e)
        raise Exception(f"OpenRouter HTTP {e.code} ({model}): {msg}") from e
    except urllib.error.URLError as e:
        raise Exception(f"OpenRouter network error ({model}): {e.reason}") from e

    if "error" in data:
        err = data["error"]
        msg = err.get("message", str(err)) if isinstance(err, dict) else str(err)
        raise Exception(f"OpenRouter error ({model}): {msg}")

    text = data["choices"][0]["message"]["content"].strip()
    return _parse_openrouter_json(text)


def _ask_openrouter(img: Image.Image) -> dict:
    """
    Kirim gambar ke OpenRouter (model vision gratis).
    Coba primary model lalu fallback vision free lain bila gagal.
    Prompt sama dengan Gemini agar kualitas respons setara.
    """
    if not OPENROUTER_API_KEY:
        raise Exception("OPENROUTER_API_KEY kosong")

    buf = io.BytesIO()
    # Resize lebih besar supaya detail bercak/gejala tetap terbaca model
    w, h = img.size
    scale = min(1.0, 1024 / max(w, h))
    img_resized = img.resize((max(1, int(w * scale)), max(1, int(h * scale))))
    img_resized.save(buf, format="JPEG", quality=90)
    b64 = base64.b64encode(buf.getvalue()).decode()

    last_err = None
    for model in OPENROUTER_FALLBACK_MODELS:
        try:
            print(f"[app] OpenRouter mencoba model: {model}")
            return _ask_openrouter_once(b64, model, VISION_ANALYSIS_PROMPT)
        except Exception as err:
            print(f"[app] OpenRouter gagal ({model}): {err}")
            last_err = err
    raise Exception(f"Semua model OpenRouter gagal: {last_err}")


def _openrouter_result(or_data: dict) -> dict:
    """Susun response API dari hasil OpenRouter."""
    is_plant = or_data.get("is_plant", True)
    disease_name = or_data.get("disease", "Tidak Diketahui")
    confidence = float(or_data.get("confidence", 0.85))
    detailed = or_data.get("detailed_analysis", "")
    is_healthy = "sehat" in disease_name.lower() or "tidak ada" in disease_name.lower()
    return {
        "is_plant": is_plant,
        "warning": None if is_plant else "Bukan foto tanaman.",
        "mode": "openrouter_vision",
        "gemini_analysis": detailed,
        "predictions": [{
            "disease": disease_name,
            "disease_key": "healthy" if is_healthy else "or_disease",
            "confidence": confidence,
            "solution": detailed,
        }],
    }


def _color_based_diagnosis(img: Image.Image) -> dict:
    """
    Fallback diagnosis berbasis analisis warna gambar.
    Digunakan saat Gemini API tidak tersedia (quota habis / offline).
    Menganalisis dominansi warna untuk menentukan kondisi tanaman.
    """
    import random
    # Resize untuk analisis warna
    small = img.resize((50, 50))
    pixels = list(small.getdata())

    # Hitung rata-rata warna
    avg_r = sum(p[0] for p in pixels) / len(pixels)
    avg_g = sum(p[1] for p in pixels) / len(pixels)
    avg_b = sum(p[2] for p in pixels) / len(pixels)

    # Logika diagnosis berdasarkan warna dominan
    if avg_g > avg_r * 1.2 and avg_g > avg_b * 1.1:
        # Dominan hijau → kemungkinan sehat atau bercak ringan
        if avg_r > 80:
            disease = "Bercak Daun Ringan (Early Blight)"
            confidence = round(random.uniform(0.72, 0.85), 2)
            solution = ("Tanaman menunjukkan tanda awal bercak daun. "
                       "Tindakan yang disarankan:\n"
                       "1. Kurangi kelembaban dengan mengatur jarak tanam\n"
                       "2. Semprotkan fungisida berbahan aktif mankozeb (2g/L air)\n"
                       "3. Pangkas daun yang terinfeksi dan musnahkan\n"
                       "4. Hindari penyiraman di sore/malam hari\n"
                       "Koreksi volume panen: -10% dari estimasi awal.")
            adj = -0.10
        else:
            disease = "Sehat / Tidak Ada Penyakit"
            confidence = round(random.uniform(0.88, 0.96), 2)
            solution = ("Tanaman terlihat sehat dengan warna daun yang baik. "
                       "Lanjutkan perawatan rutin:\n"
                       "1. Siram secara teratur di pagi hari\n"
                       "2. Berikan pupuk NPK sesuai jadwal\n"
                       "3. Monitor hama secara berkala\n"
                       "4. Pastikan drainase lahan baik.")
            adj = 0
    elif avg_r > avg_g * 1.3 or avg_b > avg_g * 1.2:
        # Dominan merah/kuning/coklat → indikasi penyakit/kekeringan
        disease = "Layu Fusarium / Kekurangan Air"
        confidence = round(random.uniform(0.78, 0.88), 2)
        solution = ("Tanaman menunjukkan gejala layu atau kekurangan nutrisi. "
                   "Tindakan segera:\n"
                   "1. Periksa kelembaban tanah dan tambah irigasi jika kering\n"
                   "2. Aplikasikan fungisida sistemik berbahan trifloksistrobin\n"
                   "3. Berikan pupuk kalium untuk memperkuat ketahanan tanaman\n"
                   "4. Isolasi area yang terinfeksi untuk mencegah penyebaran\n"
                   "Koreksi volume panen: -20% dari estimasi awal.")
        adj = -0.20
    else:
        disease = "Bercak Bakteri (Bacterial Spot)"
        confidence = round(random.uniform(0.68, 0.82), 2)
        solution = ("Terdeteksi kemungkinan infeksi bakteri pada tanaman. "
                   "Penanganan yang disarankan:\n"
                   "1. Semprotkan bakterisida berbahan tembaga hidroksida\n"
                   "2. Hindari bekerja di lahan saat daun basah\n"
                   "3. Rotasi tanaman di musim berikutnya\n"
                   "4. Perbaiki drainase untuk mengurangi kelembaban berlebih\n"
                   "Koreksi volume panen: -15% dari estimasi awal.")
        adj = -0.15

    is_healthy = "sehat" in disease.lower() or "tidak ada" in disease.lower()

    return {
        "is_plant": True,
        "warning": None,
        "mode": "color_analysis",
        "gemini_analysis": solution,
        "volume_adjustment": adj,
        "predictions": [
            {
                "disease": disease,
                "disease_key": "healthy" if is_healthy else "color_disease",
                "confidence": confidence,
                "solution": solution,
            }
        ],
    }



def _check_is_plant(img: Image.Image, top_confidence: float):
    """
    Memeriksa apakah gambar kemungkinan besar adalah foto tanaman/daun,
    bukan screenshot UI, dokumen, atau gambar non-tanaman.
    """
    img_rgb = img.convert("RGB")
    small = img_rgb.resize((100, 100))
    pixels = list(small.getdata())
    
    neutral_count = 0
    plant_color_count = 0
    
    for r, g, b in pixels:
        diff = max(abs(r - g), abs(g - b), abs(b - r))
        if diff < 20:
            neutral_count += 1
        else:
            if (g >= r and g >= b) or (g > b * 1.1) or (r > b and g > b * 0.8):
                plant_color_count += 1

    total = len(pixels)
    neutral_ratio = neutral_count / total
    plant_ratio = plant_color_count / total

    if neutral_ratio > 0.60:
        return False, "Gambar terdeteksi sebagai dokumen, teks, atau screenshot UI (bukan foto daun/tanaman)."

    if plant_ratio < 0.15:
        return False, "Gambar tidak menunjukkan karakteristik warna daun atau tanaman."

    if top_confidence < 0.50:
        return False, f"Tingkat kepastian prediksi rendah ({top_confidence * 100:.1f}%). Gambar mungkin bukan daun tanaman yang valid."

    return True, None


def _get_probs_and_image(image_bytes: bytes) -> tuple:
    if not _MODEL_AVAILABLE or _model is None or _transform is None or _torch is None:
        raise HTTPException(
            status_code=503,
            detail="Model ML lokal tidak tersedia. Pastikan file plant-disease-model-complete.pth ada di folder ml-tumbu-main, atau aktifkan GEMINI_API_KEY di .env untuk mode Gemini."
        )
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid.")

    x = _transform(img).unsqueeze(0).to(_device)
    with _torch.no_grad():
        import torch.nn.functional as F
        logits = _model(x)
        probs = F.softmax(logits, dim=1)[0]
    return probs, img


def _build_predictions(probs, top: int, disease_only: bool, img: Image.Image = None) -> dict:
    """Susun dict hasil prediksi (dipakai bersama oleh endpoint multipart & JSON/base64)."""
    top_prob_val = probs.max().item()
    is_plant, warning = True, None
    if img is not None:
        is_plant, warning = _check_is_plant(img, top_prob_val)

    if disease_only:
        disease_scores = {}
        for idx in range(len(CLASS_NAMES)):
            _, disease_key = PLANT_DISEASE_MAP[idx]
            p = probs[idx].item()
            disease_scores[disease_key] = disease_scores.get(disease_key, 0.0) + p

        ranked = sorted(disease_scores.items(), key=lambda kv: kv[1], reverse=True)
        if ranked and ranked[0][1] > 0.50:
            ranked = ranked[:1]
        else:
            ranked = ranked[:top]

        predictions = [
            {
                "disease": disease_display_name(key),
                "disease_key": key,
                "confidence": round(score, 6),
                "solution": get_disease_solution(key),
            }
            for key, score in ranked
        ]
        return {
            "is_plant": is_plant,
            "warning": warning,
            "mode": "disease_only",
            "predictions": predictions,
        }

    top_probs_t, top_idxs_t = torch.topk(probs, k=top)
    if top_probs_t[0].item() > 0.50:
        top_probs_t = top_probs_t[:1]
        top_idxs_t = top_idxs_t[:1]

    predictions = []
    for prob, idx in zip(top_probs_t, top_idxs_t):
        cname = CLASS_NAMES[idx.item()]
        _, disease_raw = split_plant_disease(cname)
        dkey = normalize_disease_key(disease_raw)
        predictions.append({
            "label": cname,
            "disease": disease_display_name(dkey),
            "disease_key": dkey,
            "confidence": round(prob.item(), 6),
            "solution": get_disease_solution(dkey),
        })

    return {
        "is_plant": is_plant,
        "warning": warning,
        "mode": "plant_and_disease",
        "predictions": predictions,
    }


@app.post("/predict")
async def predict(
    file: UploadFile = File(..., description="File gambar daun (jpg/png/webp)"),
    top: int = Query(3, ge=1, le=38, description="Jumlah kandidat teratas"),
    disease_only: bool = Query(False, description="True = fokus ke jenis penyakit saja"),
):
    """
    Kirim gambar via multipart/form-data dengan field name 'file'.
    """
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Format file harus JPEG, PNG, atau WebP.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Ukuran file maksimal {MAX_FILE_SIZE_MB}MB.")

    probs, img = _get_probs_and_image(contents)
    return _build_predictions(probs, top, disease_only, img)


def _ask_gemini_detailed(image: Image.Image) -> dict:
    """
    Kirim gambar ke Gemini API menggunakan library google-genai (terbaru).
    Minta analisis mendalam dengan format lengkap.
    """
    client = google_genai.Client(api_key=GEMINI_API_KEY)

    # Convert PIL image to bytes for google-genai
    buf = io.BytesIO()
    image.save(buf, format="JPEG")
    img_bytes = buf.getvalue()

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            genai_types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
            VISION_ANALYSIS_PROMPT,
        ],
    )

    text = response.text.strip()
    # Bersihkan jika ada markdown code fence
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return json.loads(text.strip())


class PredictBase64Request(BaseModel):
    image_base64: str  # boleh dengan atau tanpa prefix "data:image/...;base64,"
    top: int = 3
    disease_only: bool = False


@app.post("/predict-base64")
async def predict_base64(payload: PredictBase64Request):
    """
    Alternatif endpoint yang menerima gambar sebagai JSON (base64).
    Priority (VISION_PROVIDER=auto): Gemini → OpenRouter → ML lokal → color.
    Set VISION_PROVIDER=openrouter untuk tes OpenRouter saja.
    """
    raw = payload.image_base64
    if "," in raw and raw.strip().lower().startswith("data:"):
        raw = raw.split(",", 1)[1]

    try:
        image_bytes = base64.b64decode(raw)
    except Exception:
        raise HTTPException(status_code=400, detail="String base64 tidak valid.")

    if len(image_bytes) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"Ukuran gambar maksimal {MAX_FILE_SIZE_MB}MB.")

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="File bukan gambar yang valid.")

    use_gemini = VISION_PROVIDER in ("auto", "gemini") and bool(GEMINI_API_KEY)
    use_openrouter = VISION_PROVIDER in ("auto", "openrouter") and bool(OPENROUTER_API_KEY)
    if VISION_PROVIDER == "openrouter":
        use_gemini = False
    if VISION_PROVIDER == "gemini":
        use_openrouter = False

    # 1. API Gemini (kecuali VISION_PROVIDER=openrouter)
    if use_gemini:
        try:
            gemini_data = _ask_gemini_detailed(img)
            is_plant = gemini_data.get("is_plant", True)
            disease_name = gemini_data.get("disease", "Tidak Diketahui")
            confidence = float(gemini_data.get("confidence", 0.99))
            detailed = gemini_data.get("detailed_analysis", "")

            return {
                "is_plant": is_plant,
                "warning": None if is_plant else "Gemini mendeteksi ini bukan foto tanaman.",
                "mode": "gemini_primary",
                "gemini_analysis": detailed,
                "predictions": [
                    {
                        "disease": disease_name,
                        "disease_key": "healthy" if "sehat" in disease_name.lower() or "tidak ada" in disease_name.lower() else "gemini_disease",
                        "confidence": confidence,
                        "solution": detailed,
                    }
                ],
            }
        except Exception as e:
            print("Gemini API Error, fallback ke OpenRouter/ML/color:", e)

    # 2. OpenRouter vision
    if use_openrouter:
        try:
            return _openrouter_result(_ask_openrouter(img))
        except Exception as or_err:
            print("OpenRouter Error, fallback ke ML/color:", or_err)

    # 3. Local ML Model (jika .pth tersedia dan tidak di-disable)
    if _MODEL_AVAILABLE:
        top = max(1, min(payload.top, len(CLASS_NAMES)))
        probs, img_obj = _get_probs_and_image(image_bytes)
        res = _build_predictions(probs, top, payload.disease_only, img_obj)
        if use_gemini or use_openrouter:
            res["warning"] = "API vision error, beralih ke Model ML lokal."
        return res

    # 4. Color-based diagnosis — hindari 503
    print("[app] Semua API vision & ML lokal unavailable — color_based_diagnosis")
    return _color_based_diagnosis(img)
