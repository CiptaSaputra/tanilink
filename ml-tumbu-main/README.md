# 🌿 PlantScan — Plant Disease Detection API

Sistem deteksi penyakit tanaman berbasis **Deep Learning (ResNet9)** dengan analisis mendalam dari **AI Generatif**. Dibangun menggunakan FastAPI sebagai backend dan antarmuka web responsif sebagai frontend.

---

## ✨ Fitur Utama

- **Deteksi 38 Kelas Penyakit** — mencakup 14 jenis tanaman umum (tomat, kentang, apel, jagung, anggur, dan lainnya)
- **Analisis Mendalam AI** — integrasi AI Generatif untuk diagnosis naratif yang terperinci, mencakup gejala, penyebab, dan panduan penanganan
- **Dual Mode** — AI Generatif sebagai analisis utama, model ML lokal sebagai fallback otomatis
- **REST API** — endpoint JSON/base64 dan multipart/form-data
- **Frontend Siap Pakai** — halaman web dark-mode modern (`example.html`) tanpa framework
- **Docker Ready** — siap deploy ke Railway, Render, Fly.io, atau VPS sendiri

---

## 🏗️ Struktur Proyek

```
├── app.py                          # Server API utama (FastAPI)
├── model.py                        # Arsitektur model ResNet9
├── class_names.py                  # 38 kelas penyakit + solusi penanganan
├── plant-disease-model-complete.pth  # Bobot model terlatih
├── example.html                    # Frontend web (buka langsung di browser)
├── requirements-api.txt            # Dependensi Python
├── Dockerfile                      # Konfigurasi Docker
├── .env.example                    # Template variabel lingkungan
└── DEPLOY.md                       # Panduan deployment lengkap
```

---

## ⚙️ Cara Menjalankan Lokal

### 1. Clone & Install

```bash
git clone https://github.com/username/plantscan.git
cd plantscan

pip install -r requirements-api.txt
```

### 2. Konfigurasi Environment

Salin file template dan isi variabel yang dibutuhkan:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY=your_api_key_here
```

> Dapatkan API key gratis di [Google AI Studio](https://aistudio.google.com/app/apikey).  
> Jika kosong, sistem otomatis menggunakan model ML lokal saja.

### 3. Jalankan Server

```bash
uvicorn app:app --host 0.0.0.0 --port 8000
```

Server berjalan di `http://localhost:8000`

### 4. Buka Frontend

Buka file `example.html` langsung di browser — tidak perlu web server tambahan.  
Atau akses dokumentasi API interaktif di `http://localhost:8000/docs`.

---

## 📡 API Endpoints

### `GET /health`
Cek status server dan model.

```json
{
  "status": "ok",
  "device": "cpu",
  "num_classes": 38,
  "gemini_active": true
}
```

---

### `POST /predict-base64`
Prediksi via JSON dengan gambar dalam format base64. **Direkomendasikan untuk frontend web.**

**Request Body:**
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQ...",
  "top": 3,
  "disease_only": true
}
```

**Response (AI Generatif aktif):**
```json
{
  "is_plant": true,
  "mode": "gemini_primary",
  "gemini_analysis": "Analisis mendalam dalam teks...",
  "predictions": [
    {
      "disease": "Late blight",
      "disease_key": "Late_blight",
      "confidence": 0.97,
      "solution": "..."
    }
  ]
}
```

**Response (Model ML lokal):**
```json
{
  "is_plant": true,
  "mode": "disease_only",
  "predictions": [
    {
      "disease": "Late blight",
      "disease_key": "Late_blight",
      "confidence": 0.923,
      "solution": "Segera isolasi dan musnahkan bagian tanaman..."
    }
  ]
}
```

---

### `POST /predict`
Prediksi via `multipart/form-data`. Cocok untuk integrasi backend-to-backend.

```bash
curl -X POST "http://localhost:8000/predict?top=3&disease_only=true" \
  -F "file=@foto_daun.jpg"
```

| Parameter | Default | Deskripsi |
|-----------|---------|-----------|
| `top` | `3` | Jumlah kandidat teratas (1–38) |
| `disease_only` | `false` | `true` = fokus ke jenis penyakit saja |

---

## 🐳 Deploy dengan Docker

```bash
# Build image
docker build -t plantscan-api .

# Jalankan container
docker run -d -p 8000:8000 --env-file .env plantscan-api
```

Untuk deployment ke platform cloud (Railway, Render, Fly.io), lihat panduan lengkap di [`DEPLOY.md`](DEPLOY.md).

---

## 🔒 Catatan Keamanan

- **Jangan commit file `.env`** — file ini sudah ditambahkan ke `.gitignore`
- Ganti `allow_origins=["*"]` di `app.py` dengan domain spesifik saat production
- File model `.pth` berukuran besar — pertimbangkan menggunakan Git LFS

---

## 🛠️ Tech Stack

- **Backend:** Python 3.11, FastAPI, PyTorch, Pillow
- **Model:** ResNet9 — dilatih pada dataset PlantVillage (38 kelas)
- **AI Generatif:** Google Gemini API
- **Frontend:** Vanilla HTML/CSS/JS (dark mode, tanpa framework)
- **Deployment:** Docker, Uvicorn

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi untuk keperluan pribadi maupun komersial.
