<div align="center">

# 🌾 TaniLink

### Platform Sinergi Hulu-Hilir Pertanian — Menghubungkan Petani Mikro dengan Pembeli Institusional

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> Dibuat untuk **IT FEST IPB 2026** — subtema Smart Agroindustry and Logistic System

</div>

---

## 📋 Daftar Isi
- [Tentang TaniLink](#-tentang-tanilink)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#️-tech-stack)
- [Instalasi](#-instalasi)
- [Akun Demo](#-akun-demo)
- [Struktur Folder](#-struktur-folder)
- [API Endpoints](#-api-endpoints)

---

## 🌱 Tentang TaniLink

TaniLink mempertemukan petani skala kecil dengan pembeli institusional **sejak tahap rencana tanam** — bukan setelah panen selesai. Sistem membangun data suplai masa depan sehingga pembeli bisa mengunci hasil panen lebih awal lewat Purchase Order (PO).

**3 masalah utama yang diselesaikan:**
1. Petani menanam tanpa kepastian pembeli → bergantung tengkulak
2. Tidak ada alat bantu prediksi (cuaca, harga, penyakit) untuk petani kecil
3. Tidak ada data publik real-time sebaran komoditas untuk pemerintah/peneliti

---

## ✨ Fitur Utama

| Modul | Deskripsi | Status |
|---|---|---|
| 🌾 **Landing Page** | Hero video, timeline musim tanam, FAQ, CTA | ✅ |
| 🗺️ **Peta Interaktif** | Leaflet.js + snap info lahan terdekat + geolocation | ✅ |
| 🤖 **Smart Matching** | Rekomendasi petani-pembeli (Haversine + volume + harga) | ✅ |
| 📦 **PO Flow 2-Pihak** | Konfirmasi modal klausul (petani) → ACC Final (pembeli) | ✅ |
| 🔬 **Deteksi Penyakit AI** | Upload foto daun → Gemini API diagnosis Bahasa Indonesia | ✅ |
| 🔍 **QR Trace & Lacak Batch** | Modal 3-tab + halaman verifikasi publik `/public?trace=id` | ✅ |
| 💬 **Chat In-App + WA** | Chat modal persisted DB + link WhatsApp | ✅ |
| 📊 **Prediksi Harga** | Grafik historis + prediksi 14 hari per komoditas | ✅ |
| 🔗 **Hash-Chain Ledger** | Transaksi tamper-evident SHA-256 | ✅ |
| 🚛 **Route Optimization** | Clarke-Wright + 2-opt TSP, rute jalan aktual OSRM | ✅ |
| 🛒 **Marketplace Fallback** | Batch tak ter-match otomatis ke listing terbuka | ✅ |
| ⭐ **Rating Sekali Pakai** | Rating setelah PO selesai, tidak bisa ulang | ✅ |
| 📡 **Dashboard Publik** | Transparansi pangan nasional tanpa login (`/public`) | ✅ |
| 🔔 **Notifikasi Real-time** | Polling 3 detik + bell icon + badge unread | ✅ |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript 5.8 |
| **Styling** | Tailwind CSS v4, Framer Motion, GSAP |
| **Database** | PostgreSQL 15 (Docker) + Drizzle ORM |
| **Maps** | Leaflet.js (vanilla) + Nominatim + OSRM |
| **ML / AI** | FastAPI + Gemini API (deteksi penyakit tanaman) |
| **Cuaca** | Open-Meteo API (real-time, gratis) |
| **Charts** | Recharts |
| **QR Code** | qrcode.react |

---

## 🚀 Instalasi

### Prasyarat
- Node.js 18+, Docker Desktop, Git

### 1. Clone & Install
```bash
git clone https://github.com/RizkyCipta301105/tani-link-app.git
cd tani-link-app
npm install
```

### 2. Environment Variables
```bash
cp .env.example .env
```
Isi `.env`:
```env
DATABASE_URL=postgresql://admin:password123@127.0.0.1:5434/tanilink
ML_API_URL=http://localhost:8000
```

### 3. Database
```bash
docker compose up -d
npx drizzle-kit push
npx tsx src/db/seed.ts
```

### 4. Jalankan App
```bash
npm run dev
# Buka http://localhost:3001
```

### 5. ML Server (Opsional — Deteksi Penyakit)
```bash
cd ml-tumbu-main
python3.11 -m venv .venv
.venv/bin/pip install -r requirements-api.txt
.venv/bin/pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Buat .env di ml-tumbu-main/
echo "GEMINI_API_KEY=your_key_here" > .env

.venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
```
> API key Gemini gratis: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 👤 Akun Demo

Password semua akun: **`demo123`**

| Role | Email | Akses |
|---|---|---|
| 🌾 Petani | `petani@demo.com` | Input lahan, matching, PO, deteksi penyakit, chat |
| 🛒 Pembeli | `pembeli@demo.com` | Demand, matching, ACC PO, scanner QR, chat |
| 🚛 Kolektor | `kolektor@demo.com` | Rute penjemputan, update status batch |
| 👨‍🏫 PPL/BPP | `ppl@demo.com` | Monitoring wilayah, edukasi budidaya |
| 🏛️ Dinas | `dinas@demo.com` | Agregat regional (read-only) |
| ⚙️ Admin | `admin@demo.com` | Full access + reset data |

---

## 📁 Struktur Folder

```
tanilink/
├── app/                    # Next.js App Router
│   ├── api/                # REST API endpoints
│   │   ├── disease-detections/predict/  # Proxy ML Gemini
│   │   ├── trace/[id]/     # Verifikasi publik QR (tanpa auth)
│   │   └── ...
│   ├── page.tsx            # Landing page
│   └── layout.tsx
│
├── src/
│   ├── components/
│   │   ├── landing/        # Komponen landing page (15 komponen)
│   │   ├── farmer/         # DiseaseDetector, PriceChart
│   │   ├── modals/         # HarvestTraceModal, POConfirmModal, ChatModal, dll
│   │   ├── FarmerView.tsx
│   │   ├── BuyerView.tsx
│   │   ├── KolektorView.tsx
│   │   ├── PPLView.tsx
│   │   ├── DinasView.tsx
│   │   ├── AdminView.tsx
│   │   ├── PublicDashboard.tsx
│   │   ├── TracePublicView.tsx
│   │   └── InteractiveMap.tsx
│   ├── context/            # DataContext, AuthContext, ChatContext, dll
│   ├── db/                 # Schema Drizzle + seed
│   ├── services/           # API service layer
│   └── utils/              # disease.ts, osrm.ts, ledger.ts, dll
│
├── ml-tumbu-main/          # FastAPI ML server (Python)
│   ├── app.py              # Gemini-only mode bila tanpa .pth
│   └── requirements-api.txt
│
├── docs/                   # Dokumentasi lengkap (PRD, Rencana Pengerjaan)
├── dokumen/                # Proposal lomba
└── public/images/          # Aset landing page
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/auth/register` | Registrasi user baru |
| `GET/POST` | `/api/harvests` | Data panen |
| `GET/POST` | `/api/demands` | Data permintaan |
| `GET` | `/api/matches` | Smart Matching results |
| `POST` | `/api/pre-orders/confirm` | Konfirmasi PO (atomic) |
| `GET/POST` | `/api/harvest-batches` | Batch distribusi |
| `GET` | `/api/prices` | Harga + prediksi 14 hari |
| `POST` | `/api/disease-detections/predict` | **Proxy ML** → Gemini diagnosis |
| `GET` | `/api/trace/[id]` | **Verifikasi publik** QR lahan |
| `GET/POST` | `/api/conversations` | Chat in-app |
| `GET` | `/api/export` | Export CSV/JSON dataset |
| `GET/POST` | `/api/ledger` | Hash-chain ledger |

---

## 📄 Dokumentasi Lengkap

| Dokumen | Lokasi |
|---|---|
| PRD (Product Requirements) | [`docs/PRD-TaniLink.md`](docs/PRD-TaniLink.md) |
| Rencana Pengerjaan 25 Hari | [`docs/Rencana-Pengerjaan-TaniLink-25-Hari.md`](docs/Rencana-Pengerjaan-TaniLink-25-Hari.md) |
| Proposal Lomba | [`dokumen/Proposal TaniLink.docx`](dokumen/Proposal%20TaniLink.docx) |
| Changelog | [`CHANGELOG.md`](CHANGELOG.md) |

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk mengurangi Food Loss di Indonesia 🇮🇩</p>
  <p><strong>IT FEST IPB 2026</strong> — Tim 3 · PENS Teknologi Rekayasa Internet</p>
</div>
