# TaniLink — Platform Prediksi Panen, Pre-Order, dan Optimasi Distribusi Hasil Pertanian

> Platform web yang menghubungkan petani kecil-menengah dengan pembeli institusional **sejak tahap rencana tanam**, bukan hanya setelah panen.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)

---

## 📋 Daftar Isi

- [Masalah & Latar Belakang](#-masalah--latar-belakang)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Panduan Instalasi](#-panduan-instalasi)
- [Struktur Folder](#-struktur-folder)
- [Peran Pengguna](#-peran-pengguna)
- [Dokumentasi](#-dokumentasi)
- [Lisensi](#-lisensi)

---

## 🚨 Masalah & Latar Belakang

Indonesia kehilangan **23–48 juta ton makanan per tahun** (setara Rp213–551 triliun), sebagian besar terjadi di **hulu rantai pasok** — tahap produksi dan pascapanen — *sebelum* makanan sampai ke konsumen.

**5 akar masalah:**

1. Petani menanam tanpa kepastian pembeli
2. Ketergantungan pada tengkulak akibat minim akses informasi harga
3. Panen serentak tanpa koordinasi distribusi
4. Pengiriman tidak efisien dari titik lahan tersebar
5. Belum ada data prediktif (waktu panen, volume, harga)

**Target pengguna:** Petani kecil-menengah yang *belum* memiliki jaringan pembeli tetap. Petani yang sudah punya langganan pembeli dan distribusi sendiri **tidak perlu** menggunakan TaniLink.

---

## ✨ Fitur Utama

| Modul | Deskripsi | Status |
|-------|-----------|--------|
| **Harvest Forecasting** | Prediksi waktu & volume panen per wilayah (Holt-Winters + Fourier) | ✅ |
| **Price & Demand Prediction** | Proyeksi harga 1–4 minggu (volume-based) | 🟡 |
| **Smart Matching** | Rekomendasi pencocokan petani–pembeli (Haversine + volume + harga) dengan bobot per komoditas | ✅ |
| **Chat In-App** | Negosiasi langsung petani–pembeli dengan riwayat tersimpan | ✅ |
| **Pre-Order** | Kesepakatan sebelum panen selesai, dua jalur pengiriman | ✅ |
| **Distribution Priority** | Urutan prioritas berdasarkan umur simpan & cuaca | ✅ |
| **Route Optimization** | Rute rekomendasi first-mile (Clarke-Wright + 2-opt) | ✅ |
| **Payment (Opsional)** | Upload bukti bayar | ✅ |
| **Reviews & Ratings** | Ulasan 1–5 bintang setelah transaksi selesai | ✅ |
| **Dashboard PPL** | Monitoring read-only wilayah binaan | ✅ |
| **Dashboard Kolektor** | Lihat rute rekomendasi, update status batch | ✅ |
| **Dashboard Dinas** | Agregat regional, forecasting, optimasi rute | ✅ |
| **Admin Dashboard** | Monitoring bobot matching, dispute, distribusi | ✅ |
| **Peta Interaktif** | Leaflet.js dengan sebaran petani & pembeli | ✅ |

---

## 🛠 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | React 19 + Vite 6 |
| **Language** | TypeScript 5.8 (strict) |
| **Styling** | Tailwind CSS v4 (Natural Tones theme) |
| **Animation** | Motion (Framer Motion) |
| **Icons** | Lucide React |
| **Map** | Leaflet.js + Nominatim Geocoding |
| **State** | React Context + localStorage |
| **Forecasting** | Holt's Double ES + Fourier Seasonal |
| **Route Optimization** | Clarke-Wright Savings + 2-opt |

### Planned (Roadmap)

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js (App Router) |
| **Database** | Drizzle ORM + PostgreSQL |
| **Authentication** | Better Auth |
| **Deployment** | Vercel |

---

## 🚀 Panduan Instalasi

### Prerequisites

- Node.js 18+
- npm atau yarn

### Install & Run

```bash
# Clone
git clone https://github.com/linnoking/sistem-pengurangan-food-loss1.git
cd sistem-pengurangan-food-loss1

# Install dependencies
npm install

# Jalankan development server
npm run dev

# Buka di browser
open http://localhost:3000
```

### Build Production

```bash
npm run build
npm run preview
```

---

## 📁 Struktur Folder

```
├── docs/                  # Dokumentasi profesional
│   ├── PROJECT_OVERVIEW.md
│   ├── PRD.md
│   ├── IMPLEMENTATION_STATUS.md
│   ├── CODE_QUALITY.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   ├── CHANGELOG.md
│   └── TODO.md
├── src/
│   ├── components/        # 9 React components
│   │   ├── AdminView.tsx
│   │   ├── BuyerView.tsx
│   │   ├── ChatModal.tsx
│   │   ├── DinasView.tsx
│   │   ├── FarmerView.tsx
│   │   ├── InteractiveMap.tsx
│   │   ├── KolektorView.tsx
│   │   ├── Navbar.tsx
│   │   └── PPLView.tsx
│   ├── context/           # Global state (AppContext)
│   ├── utils/             # Pure utility functions
│   │   ├── forecasting.ts
│   │   └── routeOptimizer.ts
│   ├── types.ts           # Type definitions & constants
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Entry point
│   └── index.css          # Tailwind theme
├── CLAUDE.md              # Project instructions for Claude Code
├── README.md
└── package.json
```

---

## 👥 Peran Pengguna

| Role | Dashboard | Akses |
|------|-----------|-------|
| **Petani** | Input tanam, match, pre-order, batch, chat, review | Full |
| **Pembeli** | Demand, match, pre-order, chat, review | Full |
| **PPL/BPP** | Monitoring wilayah binaan | Read-only |
| **Kolektor** | Rute rekomendasi, update status batch | Terbatas |
| **Dinas Pertanian** | Agregat regional, forecasting, routing | Read-only |
| **Admin** | Monitoring matching, dispute, distribusi | Full |

---

## 📖 Dokumentasi

Dokumentasi lengkap tersedia di folder [`docs/`](docs/):

| Dokumen | Deskripsi |
|---------|-----------|
| [Project Overview](docs/PROJECT_OVERVIEW.md) | Latar belakang, masalah, tujuan, alur bisnis |
| [PRD](docs/PRD.md) | Product Requirements Document (24 fitur) |
| [Implementation Status](docs/IMPLEMENTATION_STATUS.md) | Status implementasi vs PRD |
| [Code Quality](docs/CODE_QUALITY.md) | Review kualitas kode & rekomendasi |
| [Architecture](docs/ARCHITECTURE.md) | Arsitektur, data flow, component hierarchy |
| [Roadmap](docs/ROADMAP.md) | Rencana pengembangan jangka pendek-menengah-panjang |
| [Changelog](docs/CHANGELOG.md) | Riwayat perubahan |
| [TODO](docs/TODO.md) | Daftar tugas prioritas |

---

## 🖼️ Screenshots

*TBD — akan ditambahkan setelah UI final.*

---

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur: `git checkout -b feat/fitur-anda`
3. Commit: `git commit -m 'feat: tambah fitur X'`
4. Push: `git push origin feat/fitur-anda`
5. Buat Pull Request

Mohon ikuti panduan di [CLAUDE.md](./CLAUDE.md) untuk coding standards.

---

## 📄 Lisensi

Apache License 2.0

---

<div align="center">
  <p>Dibuat untuk mengurangi food loss hortikultura Indonesia 🇮🇩</p>
  <p>📧 <a href="mailto:rizkycipta@gmail.com">rizkycipta@gmail.com</a></p>
</div>
