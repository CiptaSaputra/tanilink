#  TaniLink — Sistem Pengurangan Food Loss Hortikultura

> Platform web cerdas yang menghubungkan petani dan pembeli institusional sejak tahap **rencana tanam**, bukan hanya setelah panen selesai.

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-4.x-FF6F00?logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)

---

## 🚨 Masalah yang Diselesaikan

Indonesia kehilangan **hingga 30–40% hasil panen hortikultura** setiap tahun akibat:
- Petani menanam tanpa kepastian pembeli → surplus tak terserap
- Ketergantungan pada tengkulak karena minimnya akses informasi harga
- Panen serentak tanpa perencanaan distribusi → komoditas rusak di jalan
- Tidak semua petani mampu mengoperasikan sistem digital secara mandiri

---

## ✨ Fitur Utama

### 1. 🤝 Smart Matching & Pre-Order Engine
Mencocokkan demand pembeli dengan rencana tanam petani menggunakan **skor gabungan**:
- **Haversine Distance** → kedekatan lokasi (bobot w1)
- **Volume Match Score** → kesesuaian volume (bobot w2)
- **Price Match Score** → kesesuaian harga (bobot w3)

Bobot w1/w2/w3 dapat diatur Admin secara real-time. Hasil matching dapat langsung dijadikan **Pre-Order** sebelum panen selesai.

### 2. 📈 Harvest Forecasting Engine
Prediksi volume panen per wilayah dan komoditas menggunakan:
- **Holt's Double Exponential Smoothing** (α=0.35, β=0.12)
- **Fourier Seasonal Terms** (K=2, periode bulanan)
- **Exogenous Rain Factor** berbasis pola monsun Indonesia
- **Confidence Interval 95%** yang melebar sesuai horizon prediksi

### 3. 🚛 Route Optimization (VRP Solver)
Optimasi rute pengambilan panen menggunakan:
- **Clarke-Wright Savings Algorithm** untuk pengelompokan titik panen
- **2-opt Local Search** untuk perbaikan rute iteratif
- Visualisasi rute pada peta interaktif dengan estimasi jarak dan utilisasi armada

### 4. 📦 Distribution Priority Engine
Menghitung skor prioritas distribusi batch panen berdasarkan:
- Umur simpan komoditas (`shelfLifeDays`)
- Hari keterlambatan dari estimasi panen
- Volume batch

### 5. 🔗 Blockchain Traceability
Setiap transaksi (lapor tanam, demand, konfirmasi pre-order) dicatat di **hash-chain** transparan:
- Proof of Authority consensus
- SHA-256 Merkle Hash per blok
- Pencarian transaksi global (Global Ledger Explorer)
- Validator: Dinas Pertanian, Koperasi, Gapoktan


### 7. 📥 Input Berlapis (Multi-Source Entry)
Data tanam dapat diinput oleh:
| Sumber | Keterangan |
|--------|-----------|
| `self` | Petani mandiri |
| `family` | Anggota keluarga petani |
| `gapoktan` | Pengurus Kelompok Tani |
| `ppl` | Penyuluh Pertanian Lapangan (batch entry) |

Metadata `input_source` dan `input_by_user_id` tersimpan untuk audit tanpa mempengaruhi hasil matching atau tampilan ke pembeli.

---

## 👥 Role Pengguna

| Role | Akses |
|------|-------|
| **Petani** | Input rencana tanam, lihat matching, konfirmasi pre-order, tandai panen selesai |
| **Pembeli / Koperasi** | Buat demand, lihat rekomendasi petani, QR scan batch |
| **PPL** | Batch entry untuk banyak petani binaan sekaligus, monitoring wilayah |
| **Admin** | Tuning bobot matching, manajemen dispute, monitoring distribusi |
| **Dinas Pertanian** | Dashboard read-only: monitoring nasional, forecasting, route optimization |
| **Blockchain** | Ledger explorer, manual block mining (validator) |

---

## 🗂️ Struktur Proyek

```
src/
├── components/
│   ├── AdminView.tsx        # Dashboard Admin — matching tuning & distribusi
│   ├── BlockchainView.tsx   # Blockchain ledger explorer
│   ├── BuyerView.tsx        # Dashboard Pembeli / Koperasi
│   ├── DinasView.tsx        # Dashboard Dinas Pertanian (read-only)
│   ├── FarmerView.tsx       # Dashboard Petani
│   ├── InteractiveMap.tsx   # Peta interaktif (klik koordinat ke form)
│   ├── Navbar.tsx           # Navigasi & role switcher
│   ├── PPLView.tsx          # Dashboard PPL — batch entry
│   └── TraceModal.tsx       # Modal QR Code & blockchain trace
├── context/
│   └── AppContext.tsx       # Global state, matching engine, localStorage sync
├── utils/
│   ├── cvGrading.ts         # TensorFlow.js CV quality grading
│   ├── forecasting.ts       # Harvest forecasting (Holt-Winters + Fourier)
│   └── routeOptimizer.ts    # VRP solver (Clarke-Wright + 2-opt)
├── types.ts                 # TypeScript types & commodity metadata
├── App.tsx                  # Root component & notification system
└── main.tsx                 # Entry point
```

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js 18+
- npm atau yarn

### Install & Run

```bash
# Clone repository
git clone https://github.com/linnoking/sistem-pengurangan-food-loss1.git
cd sistem-pengurangan-food-loss1

# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka `http://localhost:5173` di browser.

### Build Production

```bash
npm run build
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Motion (Framer Motion) |
| Icons | Lucide React |
| Map | Leaflet.js |
| ML / AI | TensorFlow.js |
| State | React Context + localStorage |

---

## 📊 Data & State Management

Saat ini menggunakan **localStorage** sebagai penyimpanan sementara (prototype/demo). Data di-seed otomatis dengan contoh petani, pembeli, dan komoditas dari berbagai wilayah (Brebes, Garut, Malang, Cianjur, Lampung).

> ⚠️ **Roadmap:** Database production menggunakan PostgreSQL + Drizzle ORM, autentikasi dengan Better Auth, dan backend Next.js API routes.

---

## 🗺️ Roadmap

- [ ] Database nyata (PostgreSQL / SQLite)
- [ ] Autentikasi & login multi-role (Better Auth)
- [ ] RBAC di level API endpoint
- [ ] Landing page publik
- [ ] Prediksi harga pasar (bukan hanya volume panen)
- [ ] Integrasi API cuaca BMKG
- [ ] Notifikasi WhatsApp / push notification
- [ ] Mobile app (React Native)
- [ ] Deploy ke Vercel + domain production

---

## 📄 Lisensi

Apache License 2.0 — lihat file [LICENSE](LICENSE) untuk detail.

---

<div align="center">
  <p>Dibuat untuk mengurangi food loss hortikultura Indonesia 🇮🇩</p>
</div>
