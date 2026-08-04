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
IMAGE_SIZE = 256
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_FILE_SIZE_MB = 10

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
    Muat PyTorch model jika file .pth tersedia.
    Jika tidak ada, server tetap berjalan dalam GEMINI-ONLY mode.
    """
    global _torch, _model, _transform, _device, _MODEL_AVAILABLE

    if not os.path.exists(MODEL_PATH):
        if GEMINI_API_KEY:
            print(f"[app] File model '{MODEL_PATH}' tidak ditemukan.")
            print("[app] Berjalan dalam GEMINI-ONLY mode — Gemini API akan menangani semua request.")
        else:
            print(f"[app] PERINGATAN: File model '{MODEL_PATH}' tidak ditemukan DAN GEMINI_API_KEY kosong.")
            print("[app] Server berjalan tapi tidak bisa memproses gambar. Isi GEMINI_API_KEY di .env")
        return

    try:
        import torch
        import torch.nn.functional as F
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
        print("[app] Fallback ke GEMINI-ONLY mode.")

    if GEMINI_API_KEY:
        print("[app] Gemini API Key aktif — digunakan sebagai analisis utama.")
    else:
        print("[app] Gemini API Key tidak ditemukan — hanya model ML lokal yang aktif.")


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
    return {
        "status": "ok",
        "device": _device,
        "num_classes": len(CLASS_NAMES),
        "gemini_active": bool(GEMINI_API_KEY),
        "model_loaded": _MODEL_AVAILABLE,
        "mode": "gemini_primary" if GEMINI_API_KEY else ("ml_local" if _MODEL_AVAILABLE else "unavailable"),
    }


def _check_is_plant(img: Image.Image, top_confidence: float) -> tuple[bool, str | None]:
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

    prompt = """Kamu adalah ahli patologi tanaman. Analisis gambar ini dan berikan diagnosis lengkap.
    
Balas HANYA dengan format JSON murni yang valid (tanpa markdown, tanpa ```json):
{
  "is_plant": true,
  "disease": "Nama penyakit lengkap dalam Bahasa Indonesia (atau 'Sehat / Tidak Ada Penyakit')",
  "confidence": 0.95,
  "detailed_analysis": "Penjelasan mendalam dan lengkap dalam Bahasa Indonesia. Tulis diagnosis, nama ilmiah, ciri-ciri yang terlihat di foto, penyebab, dan cara pengendalian yang sangat detail mencakup: tindakan segera, pengendalian kimia (nama bahan aktif), pengendalian organik, dan pencegahan jangka panjang. Gunakan format yang mudah dibaca manusia dengan penomoran dan sub-poin."
}

Jika bukan foto tanaman/daun, set is_plant: false dan disease: "Bukan tanaman"."""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            genai_types.Part.from_bytes(data=img_bytes, mime_type="image/jpeg"),
            prompt,
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
    Gemini API (dari .env) adalah analisis UTAMA. Model ML lokal adalah FALLBACK.
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

    # 1. API Gemini (Analisis UTAMA) — diambil dari .env
    if GEMINI_API_KEY:
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
            print("Gemini API Error, fallback to ML:", e)
            # Lanjut ke ML fallback di bawah

    # 2. Local ML Model (FALLBACK jika Gemini gagal / key tidak ada)
    top = max(1, min(payload.top, len(CLASS_NAMES)))
    probs, img = _get_probs_and_image(image_bytes)
    res = _build_predictions(probs, top, payload.disease_only, img)

    if GEMINI_API_KEY:
        res["warning"] = "Gemini API error, beralih ke Model ML lokal."

    return res
