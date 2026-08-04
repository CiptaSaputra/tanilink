# Menyambungkan Model ke Website

Paket ini menjalankan model sebagai **API server** (backend). Websitemu
(frontend) tinggal mengirim gambar via `fetch()`/`axios` ke API ini, dan
menerima hasil prediksi dalam format JSON.

## Isi file

| File                     | Fungsi |
|--------------------------|--------|
| `app.py`                 | Server API (FastAPI) — endpoint utama |
| `model.py`                | Arsitektur ResNet9 |
| `class_names.py`          | Daftar 38 kelas + util pengelompokan penyakit |
| `plant-disease-model-complete.pth` | Bobot model kamu |
| `requirements-api.txt`   | Dependency Python untuk server |
| `Dockerfile`             | Untuk deploy pakai Docker (opsional) |
| `example.html`           | Contoh halaman web yang memanggil API ini |

## 1. Jalankan API secara lokal

```bash
pip install -r requirements-api.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

Buka `http://localhost:8000/docs` — otomatis muncul dokumentasi interaktif
(Swagger UI) tempat kamu bisa coba upload gambar langsung dari browser tanpa
menulis kode apa pun.

Tes cepat dari HTML: buka `example.html` langsung di browser (double click
filenya), pilih gambar, klik "Prediksi".

## 2. Endpoint yang tersedia

### `GET /health`
Cek server & model sudah siap.
```json
{"status": "ok", "device": "cpu", "num_classes": 38}
```

### `POST /predict-base64`
Alternatif dari `/predict` di atas — menerima gambar sebagai **JSON base64**,
bukan `multipart/form-data`. Gunakan ini kalau `/predict` gagal dengan error
seperti:
```
Failed to execute 'postMessage' on 'Window': FormData object could not be cloned.
```
Error itu muncul kalau halaman HTML-nya dibuka lewat preview ber-sandbox
(mis. preview HTML di dalam chat AI) yang meneruskan network request lewat
`postMessage` — dan `FormData`/`File` tidak bisa di-clone lewat `postMessage`,
sedangkan JSON biasa bisa. **Kalau kamu membuka HTML-nya langsung di tab
browser biasa (bukan di dalam preview chat), `/predict` versi FormData
sebenarnya tetap berfungsi normal.**

Body request (JSON):
```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg....",
  "top": 3,
  "disease_only": false
}
```
(`image_base64` boleh dengan atau tanpa prefix `data:image/...;base64,`)

Contoh dari JavaScript:
```javascript
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function predictPlantDisease(file) {
  const imageBase64 = await fileToBase64(file);
  const res = await fetch("https://api-kamu.com/predict-base64", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: imageBase64, top: 3, disease_only: false }),
  });
  return res.json();
}
```

### `POST /predict`
Kirim gambar sebagai `multipart/form-data`, field name **`file`**. Endpoint
ini cocok dipanggil dari backend lain (curl, Python `requests`, PHP, dll)
atau dari halaman web yang dibuka langsung di browser biasa.

Query parameter opsional:
- `top` (default 3) — jumlah kandidat teratas
- `disease_only` (default false) — `true` untuk fokus ke jenis penyakit saja

Contoh respons (`disease_only=false`):
```json
{
  "mode": "plant_and_disease",
  "predictions": [
    {"label": "Tomato___Late_blight", "confidence": 0.9231},
    {"label": "Tomato___Early_blight", "confidence": 0.0512},
    {"label": "Tomato___healthy", "confidence": 0.0104}
  ]
}
```

Contoh respons (`disease_only=true`):
```json
{
  "mode": "disease_only",
  "predictions": [
    {"disease": "Late blight", "disease_key": "Late_blight", "confidence": 0.8974, "most_likely_plant": "Tomato"},
    {"disease": "Early blight", "disease_key": "Early_blight", "confidence": 0.0611, "most_likely_plant": "Potato"}
  ]
}
```

## 3. Memanggil dari website (JavaScript)

```javascript
async function predictPlantDisease(file) {
  const formData = new FormData();
  formData.append("file", file); // file dari <input type="file">

  const res = await fetch("https://api-kamu.com/predict?top=3", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Prediksi gagal");
  }

  return res.json();
}
```

Kalau website kamu **bukan** berbasis JavaScript murni (misalnya PHP/Laravel,
Node/Express, dsb.), prinsipnya sama: server backend kamu tinggal melakukan
HTTP POST multipart ke URL API ini, lalu meneruskan hasil JSON-nya ke halaman.

## 4. Deploy ke internet (supaya bisa diakses dari website live)

Beberapa opsi termudah untuk pemula:

- **Railway / Render / Fly.io** — upload folder ini (dengan `Dockerfile`),
  mereka otomatis build & kasih kamu URL publik (`https://xxx.up.railway.app`).
- **VPS sendiri** (DigitalOcean, dsb.) — jalankan lewat Docker:
  ```bash
  docker build -t plant-disease-api .
  docker run -d -p 8000:8000 plant-disease-api
  ```
  lalu pasang Nginx/reverse proxy + SSL di depan port 8000.
- **Hugging Face Spaces** (gratis, cocok untuk demo) — perlu sedikit
  penyesuaian karena Spaces biasanya pakai Gradio/Streamlit, tapi FastAPI
  juga didukung lewat Docker Space.

## 5. Hal penting sebelum production

- **CORS**: di `app.py`, baris `allow_origins=["*"]` mengizinkan semua
  domain memanggil API-mu. Untuk produksi, ganti dengan domain websitemu saja:
  ```python
  allow_origins=["https://situskamu.com"]
  ```
- **Ukuran file**: dibatasi 10MB di `app.py` (`MAX_FILE_SIZE_MB`), sesuaikan
  kalau perlu.
- **Kecepatan**: model berjalan di CPU kalau servermu tidak punya GPU — untuk
  1 gambar biasanya masih cepat (<1 detik), tapi kalau traffic tinggi
  pertimbangkan GPU atau autoscaling.
- **Model hanya kenal 38 kelas** (14 jenis tanaman). Gambar di luar itu akan
  tetap "diprediksi" salah satu dari 38 kelas (model tidak tahu cara bilang
  "tidak dikenali") — pertimbangkan menambah threshold confidence minimum di
  frontend, misalnya tampilkan "tidak yakin" kalau confidence top-1 < 50%.
