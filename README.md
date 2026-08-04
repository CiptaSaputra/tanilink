<div align="center">

# 🌾 TaniLink

### Platform Prediksi Panen, Smart Matching & Optimasi Distribusi Hasil Pertanian

*Menghubungkan petani mikro dengan pembeli institusional sejak tahap rencana tanam — bukan setelah panen*

[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

</div>

---

## 📋 Daftar Isi

- [Latar Belakang](#-latar-belakang)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#️-tech-stack)
- [Panduan Instalasi Lengkap](#-panduan-instalasi-lengkap)
- [Akun Demo](#-akun-demo)
- [Struktur Folder](#-struktur-folder)
- [Peran Pengguna](#-peran-pengguna)
- [API Endpoints](#-api-endpoints)
- [Panduan Mencoba Fitur](#-panduan-mencoba-fitur)
- [Kontribusi](#-kontribusi)

---

## 🚨 Latar Belakang

Indonesia kehilangan **23–48 juta ton pangan per tahun** (setara Rp213–551 triliun), sebagian besar terjadi di **hulu rantai pasok** sebelum makanan sampai ke konsumen.

**5 akar masalah yang diselesaikan TaniLink:**

1. Petani menanam tanpa kepastian pembeli → rentan dipermainkan tengkulak
2. Volume panen tersebar di banyak petani kecil sulit memenuhi kebutuhan pembeli institusional
3. Petani tidak punya alat bantu prediksi cuaca, harga, & penyakit tanaman
4. Pengiriman tidak efisien dari titik lahan yang tersebar
5. Tidak ada data publik real-time untuk monitoring ketahanan pangan wilayah

---

## ✨ Fitur Utama

| Modul | Deskripsi | Status |
|---|---|---|
| 🌾 **Landing Page** | Hero video scroll-scrub, timeline musim tanam, sticky cards masalah, dashboard preview peta, FAQ, CTA split panel petani/pembeli | ✅ |
| 🤖 **Deteksi Penyakit AI** | Upload foto daun → Gemini AI diagnosis dalam Bahasa Indonesia, tampil confidence bar semua prediksi, riwayat deteksi, koreksi estimasi volume | ✅ |
| 🔍 **QR Trace & Lacak Batch** | Modal 3-tab: Info+QR code, Timeline batch READY→IN_TRANSIT→DELIVERED, Riwayat penyakit. Halaman verifikasi publik `/public?trace=id` tanpa login | ✅ |
| 🌤️ **Harvest Forecasting + Cuaca Real** | Prediksi panen (Holt's Double ES + Fourier) + risiko cuaca dari Open-Meteo real-time | ✅ |
| 🤖 **Smart Matching** | Rekomendasi petani-pembeli berbobot (Haversine + volume + harga) per komoditas | ✅ |
| 📦 **Pre-Order (PO) Flow** | Kesepakatan sebelum panen, atomic transaction (CONFIRMED → COMPLETED) | ✅ |
| 💬 **Chat In-App + wa.me** | Chat modal persisted ke DB + link langsung ke WhatsApp | ✅ |
| 🗺️ **Peta Rute Jalan Aktual (OSRM)** | Rute mengikuti jalan nyata (bukan garis lurus) di kolektor, dinas, & logistik pembeli | ✅ |
| 📊 **Prediksi Harga Petani** | Harga historis + prediksi 14 hari (grafik interaktif, pilih komoditas) | ✅ |
| 🔗 **Hash-Chain Ledger** | Riwayat transaksi tamper-evident (SHA-256), verifikasi rantai publik | ✅ |
| 🔔 **Notifikasi & Riwayat** | Bell icon + badge unread + panel riwayat (match, PO, batch, cuaca) | ✅ |
| 🛒 **Marketplace Fallback** | Batch panen tak ter-match otomatis masuk listing terbuka + beli langsung | ✅ |
| 🏫 **Konten Edukasi PPL + Moderasi** | PPL publikasi konten budidaya → admin moderasi → tampil ke petani | ✅ |
| 🤖 **AI Q&A (Rule-based)** | Jawab pertanyaan publik dari data agregat (tonase, harga, surplus wilayah) | ✅ |
| 📥 **Export Dataset** | Unduh CSV/JSON (transaksi, panen, permintaan) untuk peneliti | ✅ |
| ⭐ **Rating & Review** | Rating penjual 1-5 + distribusi bintang + detail ulasan | ✅ |
| 🗺️ **Peta Interaktif** | Leaflet.js dengan geolocation otomatis & pin adjustment | ✅ |
| 🔐 **Auth & RBAC** | Login/registrasi multi-role, user registry di PostgreSQL | ✅ |
| 📡 **Dashboard Publik** | Transparansi data pangan nasional **tanpa login** (`/public`) | ✅ |
| 👩‍🌾 **Dashboard PPL/BPP** | Monitoring wilayah binaan + publikasi konten edukasi | ✅ |
| 📈 **Dashboard Dinas** | Agregat regional, tren harga, potensi surplus/defisit | ✅ |
| 📱 **Mobile-Friendly** | Responsif di HP (viewport, navbar adaptif, tabel scroll, modal via portal) | ✅ |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 16.2 (App Router, Turbopack) |
| **Language** | TypeScript 5.8 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Lucide React, Motion (Framer Motion), GSAP |
| **Database** | PostgreSQL 15 (via Docker) |
| **ORM** | Drizzle ORM |
| **Maps** | Leaflet.js (vanilla) + Nominatim + OSRM (rute jalan aktual) |
| **Cuaca** | Open-Meteo API (gratis, tanpa key) |
| **Charts** | Recharts |
| **ML / AI** | FastAPI + ResNet9 (lokal) + Gemini API (deteksi penyakit tanaman) |
| **QR Code** | qrcode.react |
| **Route Algorithm** | Clarke-Wright Savings + 2-opt Local Search (custom) |
| **Deployment** | Vercel (app) + Docker (database) |

---

## 🚀 Panduan Instalasi Lengkap

> [!IMPORTANT]
> Pastikan kamu sudah menginstall semua prasyarat sebelum mulai.

### Prasyarat

| Software | Versi Minimum | Cek Versi | Download |
|---|---|---|---|
| **Node.js** | 18+ | `node -v` | [nodejs.org](https://nodejs.org) |
| **npm** | 9+ | `npm -v` | Sudah termasuk di Node.js |
| **Docker Desktop** | Terbaru | `docker -v` | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) |
| **Git** | Terbaru | `git -v` | [git-scm.com](https://git-scm.com) |

---

### Langkah 1: Clone Repository

```bash
git clone https://github.com/RizkyCipta301105/tani-link-app.git
cd tani-link-app
```

### Langkah 2: Install Dependencies

```bash
npm install
```

### Langkah 3: Setup Environment Variables

```bash
cp .env.example .env
```

Isi `.env`:

```env
DATABASE_URL=postgresql://admin:password123@127.0.0.1:5434/tanilink
ML_API_URL=http://localhost:8000
```

### Langkah 4: Jalankan Database dengan Docker

```bash
docker compose up -d
```

### Langkah 5: Migrasi & Seed Database

```bash
npx drizzle-kit push
npx tsx src/db/seed.ts
```

### Langkah 6: Jalankan ML Server (Opsional — untuk Deteksi Penyakit)

```bash
cd ml-tumbu-main
python3.11 -m venv .venv
.venv/bin/pip install -r requirements-api.txt
.venv/bin/pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
```

Buat `.env` di folder `ml-tumbu-main/`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

> Dapatkan API key gratis di [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

```bash
.venv/bin/uvicorn app:app --host 0.0.0.0 --port 8000
```

### Langkah 7: Jalankan Development Server

```bash
npm run dev
```

Buka browser ke: **http://localhost:3001**

---

### ✅ Checklist Verifikasi

Pastikan semua langkah berhasil dengan cara:

- [ ] `http://localhost:3001` terbuka tanpa error
- [ ] `http://localhost:3001/login` tampil halaman login (bukan blank putih)
- [ ] Login dengan `petani@demo.com` / `demo123` berhasil masuk dashboard
- [ ] Dashboard menampilkan data panen (bukan tabel kosong)
- [ ] Grafik harga tampil di panel "Prediksi Harga Pasar"

---

### 🔧 Troubleshooting

**❌ Error: `ECONNREFUSED` atau `database connection failed`**
```bash
# Pastikan Docker Desktop sedang berjalan, lalu:
docker compose up -d
# Tunggu 10 detik, coba lagi
```

**❌ Error: `relation "users" does not exist`**
```bash
# Tabel belum dibuat, jalankan migrasi:
npx drizzle-kit push
npx tsx src/db/seed.ts
```

**❌ Error: `Module not found` atau `Cannot find module`**
```bash
# Ulangi install dependencies:
rm -rf node_modules package-lock.json
npm install
```

**❌ Port 3001 sudah dipakai**
```bash
# Kill proses yang pakai port 3001:
lsof -ti:3001 | xargs kill -9
# Atau jalankan di port lain:
npm run dev -- --port 3002
```

**❌ Docker container gagal start**
```bash
# Cek apakah port 5434 sudah dipakai:
lsof -i :5434
# Hentikan container lama dan mulai ulang:
docker compose down && docker compose up -d
```

**❌ Tabel kosong / data tidak muncul**
```bash
# Reset dan seed ulang database:
docker compose down -v   # hapus data lama
docker compose up -d     # start ulang
npx drizzle-kit push     # buat tabel
npx tsx src/db/seed.ts   # isi data
```

---

## 👤 Akun Demo

Semua akun menggunakan password: **`demo123`**

| Role | Email | Nama | Akses |
|---|---|---|---|
| 🌾 **Petani** | `petani@demo.com` | Pak Joko Widodo | Input lahan, matching, PO, chat |
| 🛒 **Pembeli** | `pembeli@demo.com` | Koperasi Jaya Tani | Demand, smart matching, PO, rute logistik |
| 📋 **PPL/BPP** | `ppl@demo.com` | Budi Santoso, S.P. | Monitoring wilayah (read-only) |
| 🚛 **Kolektor** | `kolektor@demo.com` | Rudi Angkut | Rute penjemputan, update status batch |
| 🏛️ **Dinas** | `dinas@demo.com` | Ir. Siti Rahayu, M.Sc. | Agregat regional (read-only) |
| ⚙️ **Admin** | `admin@demo.com` | Administrator TaniLink | Full access |
| 🌐 **Publik** | *(tanpa login)* | — | Dashboard publik saja |

---

## 📁 Struktur Folder

```
tanilink/
│
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Halaman login & register
│   ├── (dashboard)/            # Halaman dashboard utama
│   ├── public/                 # Dashboard publik (/public)
│   ├── api/                    # REST API endpoints
│   │   ├── auth/               # Login & Register
│   │   ├── harvests/           # CRUD data panen
│   │   ├── demands/            # CRUD data permintaan
│   │   ├── matches/            # Smart Matching results
│   │   ├── pre-orders/         # PO management
│   │   ├── payments/           # Konfirmasi pembayaran
│   │   ├── reviews/            # Rating & review
│   │   ├── harvest-batches/    # Batch distribusi panen
│   │   ├── prices/             # Harga pasar + prediksi
│   │   ├── conversations/      # Chat in-app
│   │   ├── disease-detections/ # Riwayat deteksi penyakit
│   │   │   └── predict/        # ← Proxy ke ML server (Gemini/ResNet9)
│   │   └── trace/[id]/         # ← Verifikasi publik lahan (tanpa auth)
│   ├── layout.tsx              # Font Instrument Serif + IBM Plex Mono
│   └── page.tsx                # Landing page (route /)
│
├── src/
│   ├── components/
│   │   ├── landing/            # ← Komponen landing page
│   │   │   ├── LandingPage.tsx
│   │   │   └── ui/             # Hero, FAQ, Timeline, Map, Cards (15 komponen)
│   │   ├── FarmerView.tsx      # Dashboard Petani
│   │   ├── BuyerView.tsx       # Dashboard Pembeli
│   │   ├── KolektorView.tsx    # Dashboard Kolektor
│   │   ├── PPLView.tsx         # Dashboard PPL/BPP
│   │   ├── DinasView.tsx       # Dashboard Dinas
│   │   ├── AdminView.tsx       # Dashboard Admin
│   │   ├── PublicDashboard.tsx # Dashboard Publik + handle ?trace=id
│   │   ├── TracePublicView.tsx # ← Halaman verifikasi publik QR
│   │   ├── InteractiveMap.tsx  # Peta Leaflet
│   │   ├── Navbar.tsx
│   │   ├── auth/               # Login & Register pages
│   │   ├── farmer/
│   │   │   └── DiseaseDetector.tsx  # ← Upload foto + AI diagnosis
│   │   ├── modals/
│   │   │   ├── HarvestTraceModal.tsx # ← Modal 3-tab QR + Lacak Batch
│   │   │   ├── RouteMapModal.tsx
│   │   │   ├── PaymentModal.tsx
│   │   │   └── ...
│   │   └── shared/
│   │
│   ├── context/
│   │   ├── DataContext.tsx
│   │   ├── AuthContext.tsx
│   │   ├── UIContext.tsx
│   │   └── ...
│   │
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema.ts
│   │   └── seed.ts
│   │
│   ├── services/
│   │   ├── diseaseService.ts   # ← Simpan/ambil riwayat deteksi penyakit
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── disease.ts          # ← Client ML (via proxy /api/disease-detections/predict)
│   │   ├── bmkg.ts
│   │   ├── osrm.ts
│   │   ├── ledger.ts
│   │   └── ...
│   │
│   ├── lib/
│   │   └── utils.ts            # ← cn() helper (Tailwind merge)
│   │
│   └── types.ts
│
├── ml-tumbu-main/              # FastAPI ML server (Python)
│   ├── app.py                  # Server utama (Gemini-only mode bila tanpa .pth)
│   ├── model.py                # Arsitektur ResNet9
│   ├── class_names.py          # 38 kelas penyakit tanaman
│   ├── requirements-api.txt
│   ├── .env.example            # GEMINI_API_KEY template
│   └── Dockerfile
│
├── public/
│   └── images/                 # Aset landing page
│
├── drizzle/                    # Migration files
├── docker-compose.yml
├── drizzle.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## 📡 API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| `POST` | `/api/auth/login` | Login user |
| `POST` | `/api/auth/register` | Registrasi user baru |
| `GET/POST` | `/api/harvests` | Daftar & tambah data panen |
| `GET/PATCH` | `/api/harvests/[id]` | Detail & update panen |
| `GET/POST` | `/api/demands` | Daftar & tambah permintaan |
| `GET` | `/api/matches` | Hasil Smart Matching |
| `POST` | `/api/pre-orders/confirm` | Konfirmasi Pre-Order (atomic transaction) |
| `PATCH` | `/api/pre-orders/[id]/status` | Update status PO |
| `POST` | `/api/payments` | Upload bukti pembayaran |
| `POST` | `/api/reviews` | Beri rating & ulasan |
| `GET` | `/api/prices?commodity=X&region=Y` | Harga + prediksi 14 hari |
| `GET/POST` | `/api/harvest-batches` | Manajemen batch distribusi |
| `GET/POST` | `/api/marketplace` | Listing marketplace terbuka |
| `POST` | `/api/marketplace/auto` | Auto-fallback batch tak ter-match |
| `GET/POST` | `/api/notifications` | Notifikasi & riwayat per user |
| `GET/POST` | `/api/ledger` | Hash-chain ledger transaksi |
| `GET/POST` | `/api/educational-contents` | Konten edukasi PPL |
| `POST` | `/api/qa` | AI Q&A (rule-based) |
| `GET` | `/api/export?format=csv\|json` | Export dataset |
| `GET/POST` | `/api/conversations` | Chat conversation |
| `GET/POST` | `/api/messages` | Pesan chat |
| `GET/POST` | `/api/disease-detections` | Riwayat deteksi penyakit |
| `POST` | `/api/disease-detections/predict` | **Proxy ML** — kirim foto base64 → Gemini/ResNet9 |
| `GET` | `/api/trace/[id]` | **Verifikasi publik** — data lahan + batch + penyakit (tanpa auth) |

---

## 👥 Peran Pengguna

| Role | Yang Bisa Dilakukan |
|---|---|
| **Petani** | Input rencana tanam, prediksi harga per komoditas, risiko cuaca, terima match, buat batch, kelola PO, jual ke marketplace, lihat rating & edukasi, chat via WA |
| **Pembeli** | Publikasi demand, Smart Matching, setujui PO, konfirmasi bayar, rute logistik + peta OSRM, beli dari marketplace, beri rating |
| **PPL/BPP** | Monitoring wilayah (read-only) + publikasi konten edukasi budidaya |
| **Kolektor** | Rekomendasi rute penjemputan + peta jalan aktual, update status batch |
| **Dinas** | Agregat regional, tren harga, surplus/defisit, optimasi rute VRP |
| **Admin** | Pemantauan bobot matching, moderasi konten edukasi, prioritas distribusi, dispute |
| **Publik** | Dashboard transparansi pangan tanpa login, AI Q&A, export dataset, verifikasi ledger |

---

## 🧪 Panduan Mencoba Fitur

Lihat **[`docs/CARA_MENCOBA.md`](docs/CARA_MENCOBA.md)** — panduan lengkap mengetes semua fitur: akun demo, alur petani→pembeli→PO→pembayaran→kolektor, dashboard per role, AI Q&A, marketplace, dan troubleshooting.

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feat/nama-fitur`
5. Buat Pull Request ke `main`

---

## 📄 Lisensi

Apache License 2.0 — lihat [LICENSE](LICENSE) untuk detail.

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk mengurangi Food Loss di Indonesia 🇮🇩</p>
  <p>IT FEST IPB 2026</p>
</div>
