<div align="center">

# 🌾 TaniLink

### Platform Prediksi Panen, Smart Matching & Optimasi Distribusi Hasil Pertanian

*Menghubungkan petani mikro dengan pembeli institusional sejak tahap rencana tanam — bukan setelah panen*

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org)
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
| 🌤️ **Harvest Forecasting** | Prediksi panen (Holt's Double ES + Fourier + rain factor) per komoditas & wilayah | ✅ |
| 🤖 **Smart Matching** | Rekomendasi petani-pembeli berbobot (Haversine + volume + harga) per komoditas | ✅ |
| 📦 **Pre-Order (PO) Flow** | Kesepakatan sebelum panen, atomic transaction (CONFIRMED → COMPLETED) | ✅ |
| 💬 **Chat In-App + wa.me** | Chat modal persisted ke DB + link langsung ke WhatsApp (bukan Business API) | ✅ |
| 🗺️ **Route Optimization** | Algoritma Clarke-Wright + 2-opt untuk rute penjemputan multi-titik | ✅ |
| 📊 **Prediksi Harga** | Harga historis dari DB + prediksi 14 hari (moving average + tren linier) | ✅ |
| ⭐ **Rating & Review** | Ulasan dua arah setelah PO selesai | ✅ |
| 🗺️ **Peta Interaktif** | Leaflet.js dengan geolocation otomatis & pin adjustment via click | ✅ |
| 🔐 **Auth & RBAC** | Login/registrasi multi-role, user registry di PostgreSQL | ✅ |
| 📡 **Dashboard Publik** | Transparansi data pangan nasional tanpa login | ✅ |
| 👩‍🌾 **Dashboard PPL/BPP** | Monitoring wilayah binaan (read-only) | ✅ |
| 📈 **Dashboard Dinas** | Agregat regional, tren harga, potensi surplus/defisit | ✅ |

> **Roadmap (belum di MVP):** disease detection (TensorFlow.js), hash-chain ledger, WhatsApp Business API, AI Q&A publik, ekspor dataset, marketplace fallback.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript 5.8 |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Lucide React, Motion (Framer Motion) |
| **Database** | PostgreSQL 15 (via Docker) |
| **ORM** | Drizzle ORM |
| **Maps** | Leaflet.js + Nominatim |
| **Charts** | Recharts |
| **Route Algorithm** | Clarke-Wright Savings + 2-opt Local Search (custom, bukan Google Maps) |
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

> [!NOTE]
> Proses ini mungkin memerlukan waktu 1-3 menit tergantung koneksi internet.

### Langkah 3: Setup Environment Variables

Buat file `.env` di root project (sejajar dengan `package.json`):

```bash
# Copy template dan edit sesuai kebutuhan
cp .env.example .env
```

> Jika tidak ada `.env.example`, buat file `.env` baru dengan isi:

```env
DATABASE_URL=postgresql://admin:password123@127.0.0.1:5434/tanilink
```

### Langkah 4: Jalankan Database dengan Docker

```bash
# Start PostgreSQL container di background
docker compose up -d

# Verifikasi container sudah berjalan
docker ps
```

Tunggu sekitar 5-10 detik hingga PostgreSQL siap, lalu cek dengan:

```bash
# Harusnya muncul tabel-tabel TaniLink
docker exec -it tanilink_db psql -U admin -d tanilink -c "\dt"
```

### Langkah 5: Migrasi & Seed Database

```bash
# 1. Buat tabel-tabel database (migrasi schema)
npx drizzle-kit push

# 2. Isi data awal (users, panen, demand, harga pasar)
npx tsx src/db/seed.ts
```

Output yang diharapkan dari seed:
```
Seeding database...
Seeding users...
Seeding harvests...
Seeding demands...
Seeding matches...
Seeding pre-orders...
Seeding market prices...
Database seeded successfully!
```

### Langkah 6: Jalankan Development Server

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
tani-link-app/
│
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Halaman login & register
│   ├── (dashboard)/            # Halaman dashboard utama
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
│   │   └── conversations/      # Chat in-app
│   ├── layout.tsx
│   └── page.tsx                # Landing page redirect
│
├── src/
│   ├── components/             # React components per role
│   │   ├── FarmerView.tsx      # Dashboard Petani
│   │   ├── BuyerView.tsx       # Dashboard Pembeli
│   │   ├── KolektorView.tsx    # Dashboard Kolektor
│   │   ├── PPLView.tsx         # Dashboard PPL/BPP
│   │   ├── DinasView.tsx       # Dashboard Dinas
│   │   ├── AdminView.tsx       # Dashboard Admin
│   │   ├── PublicDashboard.tsx # Dashboard Publik
│   │   ├── InteractiveMap.tsx  # Peta Leaflet
│   │   ├── Navbar.tsx          # Navigasi global
│   │   ├── auth/               # Login & Register pages
│   │   ├── farmer/             # Sub-komponen petani
│   │   ├── buyer/              # Sub-komponen pembeli
│   │   └── modals/             # Modal dialogs
│   │
│   ├── context/
│   │   ├── DataContext.tsx     # State management global (harvests, demands, dll)
│   │   ├── AuthContext.tsx     # Auth state
│   │   └── UIContext.tsx       # Notifikasi & UI state
│   │
│   ├── db/
│   │   ├── index.ts            # Drizzle DB connection
│   │   ├── schema.ts           # Database schema
│   │   └── seed.ts             # Script seeding database
│   │
│   ├── services/               # API service layer (frontend → backend)
│   │   ├── harvestService.ts
│   │   ├── demandService.ts
│   │   ├── matchService.ts
│   │   ├── preOrderService.ts
│   │   └── ...
│   │
│   ├── utils/
│   │   ├── bmkg.ts             # BMKG weather risk engine
│   │   ├── matchingEngine.ts   # Smart Matching algoritma
│   │   ├── routeOptimizer.ts   # Clarke-Wright + 2-opt TSP
│   │   └── forecasting.ts      # Price prediction engine
│   │
│   ├── data/
│   │   ├── seed.ts             # Data dummy untuk seeding
│   │   └── users.ts            # Akun demo
│   │
│   ├── constants/
│   │   └── commodities.ts      # Data komoditas (durasi, harga, bobot)
│   │
│   └── types.ts                # TypeScript type definitions
│
├── docs/                       # Dokumentasi teknis lengkap
├── drizzle/                    # Drizzle migration files
├── docker-compose.yml          # PostgreSQL Docker setup
├── drizzle.config.ts           # Drizzle ORM config
├── next.config.mjs             # Next.js config
├── tsconfig.json               # TypeScript config
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
| `POST` | `/api/pre-orders/confirm` | Konfirmasi Pre-Order |
| `PATCH` | `/api/pre-orders/[id]/status` | Update status PO |
| `POST` | `/api/payments` | Upload bukti pembayaran |
| `POST` | `/api/reviews` | Beri rating & ulasan |
| `GET` | `/api/prices?commodity=X&region=Y` | Harga + prediksi 14 hari |
| `GET/POST` | `/api/harvest-batches` | Manajemen batch distribusi |

---

## 👥 Peran Pengguna

| Role | Yang Bisa Dilakukan |
|---|---|
| **Petani** | Input rencana tanam, lihat prediksi BMKG, terima rekomendasi match, buat batch panen, lihat & kelola PO, chat via WA |
| **Pembeli** | Publikasi kebutuhan (demand), lihat Smart Matching, setujui PO, konfirmasi pembayaran, lihat rute logistik |
| **PPL/BPP** | Monitoring data wilayah binaan (read-only), lihat konten edukasi |
| **Kolektor** | Lihat rekomendasi rute pengambilan, update status batch |
| **Dinas** | Lihat agregat regional, tren harga, peta sebaran panen |
| **Admin** | Semua akses + pemantauan performa bobot Smart Matching (read-only, tidak bisa diubah) |
| **Publik** | Dashboard transparansi pangan (tanpa login) |

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
