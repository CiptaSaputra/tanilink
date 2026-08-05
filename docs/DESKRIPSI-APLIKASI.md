# Deskripsi Aplikasi TaniLink

> Platform web full-stack yang menghubungkan petani skala kecil dengan pembeli institusional sejak tahap rencana tanam, dilengkapi AI, QR tracking, dan transparansi rantai pasok.

---

## 1. Fitur Lengkap

### 🌾 Untuk Petani
| Fitur | Deskripsi |
|---|---|
| **Input Rencana Tanam** | Input komoditas, luas lahan, tanggal tanam, koordinat GPS/peta. Sistem otomatis estimasi tanggal panen dan risiko cuaca via Open-Meteo |
| **Prediksi Harga** | Grafik historis + prediksi 14 hari ke depan menggunakan Holt's Double Exponential Smoothing + Fourier |
| **Deteksi Penyakit AI** | Upload foto daun → Gemini AI diagnosis dalam Bahasa Indonesia. Hasil koreksi estimasi volume panen otomatis |
| **Smart Matching** | Sistem otomatis mencocokkan lahan petani dengan permintaan pembeli berdasarkan jarak, harga, dan volume |
| **PO 2-Pihak** | Petani tinjau detail PO + centang 3 klausul kontrak sebelum setuju → forward ke pembeli |
| **QR Trace Lahan** | Generate QR code untuk setiap lahan. Modal 3-tab: Info Lahan, Lacak Batch, Riwayat Penyakit |
| **Lacak Batch Distribusi** | Buat batch panen (Siap Kirim), lacak status READY → IN_TRANSIT → DELIVERED |
| **Chat In-App + WA** | Chat negosiasi langsung dengan pembeli, tersimpan di database + link WhatsApp |
| **Riwayat Transaksi** | Histori PO lengkap dengan hash-chain SHA-256 (tamper-evident) |
| **Rating Petani** | Terima rating dari pembeli setelah transaksi selesai |

### 🛒 Untuk Pembeli
| Fitur | Deskripsi |
|---|---|
| **Buat Demand Pasok** | Input kebutuhan komoditas, volume, wilayah, dan deadline |
| **Smart Matching** | Rekomendasi petani tercocok digroup per demand (tidak campur aduk komoditas) |
| **PO ACC Final** | Review penawaran petani → terima → ACC Final → PO terbentuk otomatis |
| **Scanner QR** | Scan QR petani via kamera/upload gambar → buka HarvestTraceModal in-app |
| **Lacak & Verifikasi Batch** | Input ID lahan, pilih dari daftar, atau scan QR → lihat detail + status batch |
| **Konfirmasi Pembayaran** | Upload bukti transfer, nominal otomatis dari nilai PO yang disepakati |
| **Chat Petani** | Chat in-app + link WA langsung ke petani |
| **Rating Penjual** | Beri rating setelah PO selesai (sekali pakai per transaksi) |
| **Marketplace Terbuka** | Beli langsung dari listing panen yang tidak ter-match |

### 🚛 Untuk Kolektor
| Fitur | Deskripsi |
|---|---|
| **Daftar Batch Semua Wilayah** | Lihat semua batch READY dari semua wilayah + filter dropdown per wilayah |
| **Route Optimization** | Rekomendasi urutan penjemputan Clarke-Wright + 2-opt TSP via OSRM (rute jalan aktual) |
| **Update Status Batch** | Berangkat Jemput (READY→IN_TRANSIT), Konfirmasi Tiba (IN_TRANSIT→DELIVERED), Jemput Langsung |
| **Peta Rute Jalan** | Visualisasi rute jalan aktual di peta Leaflet |

### 👨‍🏫 Untuk PPL/BPP
| Fitur | Deskripsi |
|---|---|
| **Monitoring Wilayah** | Lihat lahan aktif, estimasi panen, status transaksi per wilayah binaan |
| **Filter Wilayah** | Dropdown filter wilayah — bisa monitoring lintas wilayah |
| **Konten Edukasi** | Publikasi artikel budidaya untuk petani binaan |
| **Statistik Komoditas** | Breakdown volume, jumlah petani, persentase ter-match per komoditas |

### 🏛️ Untuk Dinas Pertanian
| Fitur | Deskripsi |
|---|---|
| **Agregat Regional** | Data komoditas, volume, harga, dan tren per wilayah (read-only) |
| **Monitoring Distribusi** | Status batch distribusi real-time seluruh wilayah |
| **Pre-Order Overview** | Rekap transaksi PO yang sedang berjalan |

### ⚙️ Untuk Admin
| Fitur | Deskripsi |
|---|---|
| **Monitoring Smart Matching** | Pantau bobot scoring per komoditas |
| **Manajemen Distribusi** | Overview seluruh batch dan PO aktif |
| **Reset Data** | Reset database ke kondisi awal (double confirmation) |
| **Tanya AI (semua role)** | Tombol Tanya AI di navbar, tersedia untuk semua role |

### 📡 Dashboard Publik (tanpa login)
| Fitur | Deskripsi |
|---|---|
| **Transparansi Pangan** | Tonase diselamatkan, top komoditas, status wilayah (surplus/defisit) |
| **Log Transaksi Publik** | Riwayat PO selesai yang bisa diakses siapa saja |
| **Hash-Chain Ledger** | Verifikasi integritas transaksi (SHA-256 tamper-evident) |
| **AI Q&A** | Tanya pertanyaan tentang data pangan → dijawab Gemini AI dengan data real DB |
| **Export Dataset** | Download CSV/JSON untuk peneliti |
| **Verifikasi QR Lahan** | Akses `/public?trace=<id>` tanpa login — tampilkan 3 tab verifikasi |

---

## 2. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│  Landing Page → Login/Register → Dashboard (per role)           │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────────┐
│                    VERCEL (Next.js 16.2)                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────────────────────────────────┐  │
│  │  App Router  │  │           API Routes (/api/*)            │  │
│  │  (Frontend)  │  │                                          │  │
│  │              │  │  auth/     harvests/   demands/          │  │
│  │  - Landing   │  │  matches/  pre-orders/ payments/         │  │
│  │  - Dashboard │  │  batches/  prices/     ledger/           │  │
│  │  - Public    │  │  qa/       trace/[id]  disease-detect/   │  │
│  └──────────────┘  └──────────────┬───────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────┘
                                     │
           ┌─────────────────────────┼──────────────────────┐
           │                         │                      │
┌──────────▼──────┐       ┌──────────▼──────┐    ┌─────────▼──────┐
│    SUPABASE     │       │    RAILWAY      │    │  EXTERNAL APIs  │
│  (PostgreSQL)   │       │  (FastAPI ML)   │    │                │
│                 │       │                 │    │  Open-Meteo    │
│  16 tabel:      │       │  - Gemini AI    │    │  (cuaca)       │
│  users          │       │  - ResNet9      │    │                │
│  harvests       │       │    (opsional)   │    │  OSRM          │
│  demands        │       │  - /predict     │    │  (rute jalan)  │
│  matches        │       │  - /health      │    │                │
│  pre_orders     │       │                 │    │  Nominatim     │
│  harvest_batches│       └─────────────────┘    │  (geocoding)   │
│  market_prices  │                               └────────────────┘
│  conversations  │
│  messages       │
│  disease_detect │
│  ledger         │
│  reviews        │
│  payments       │
│  notifications  │
│  marketplace    │
│  educational    │
└─────────────────┘
```

### Stack Teknologi

| Layer | Teknologi | Versi |
|---|---|---|
| Framework | Next.js App Router | 16.2 (Turbopack) |
| Language | TypeScript | 5.8 |
| Styling | Tailwind CSS + Framer Motion + GSAP | v4 |
| Database | PostgreSQL via Supabase | 15 |
| ORM | Drizzle ORM | latest |
| Maps | Leaflet.js (vanilla) + Nominatim + OSRM | - |
| ML/AI (disease) | FastAPI + Gemini API | Python 3.11 |
| AI Q&A | Gemini API + rule-based fallback | gemini-2.0-flash |
| Cuaca | Open-Meteo API | - |
| QR Code | qrcode.react + jsQR | - |
| Hosting | Vercel + Supabase + Railway | - |

---

## 3. Cara Kerja Lengkap

### Alur Utama: Dari Tanam ke Transaksi

```
PETANI                    SISTEM                    PEMBELI
  │                          │                          │
  │── Input rencana tanam ──►│                          │
  │   (komoditas, lahan,     │◄── Cuaca Open-Meteo      │
  │    koordinat GPS)        │    estimasi risiko        │
  │                          │                          │
  │                          │◄── Smart Matching ───────│── Buat demand
  │                          │    (Haversine + harga    │   (komoditas,
  │                          │     + volume scoring)    │    volume,
  │                          │                          │    deadline)
  │◄── Notifikasi match ─────│                          │
  │                          │─── Notifikasi match ────►│
  │                          │                          │
  │── Ajukan penawaran ─────►│                          │
  │   (volume + harga bid)   │─── Penawaran masuk ─────►│
  │                          │                          │
  │                          │◄── Terima penawaran ─────│
  │◄── Pembeli setuju ───────│                          │
  │                          │                          │
  │── Tinjau modal klausul ─►│                          │
  │   (centang 3 klausul)    │                          │
  │── CONFIRMED (forward) ──►│─── Notifikasi ──────────►│
  │                          │                          │
  │                          │◄── ACC Final & Buat PO ──│
  │                          │    (FINALIZED)           │
  │◄── PO terbentuk ─────────│─── PO terbentuk ────────►│
  │                          │   (atomic transaction)   │
  │                          │                          │
  │── Siap Kirim ───────────►│                          │
  │   (input volume aktual)  │── Batch READY ──────────►│KOLEKTOR
  │                          │   (priority score)       │── Jemput batch
  │                          │   IN_TRANSIT             │
  │                          │   DELIVERED              │
  │                          │                          │
  │◄── Bukti bayar masuk ────│◄── Upload bukti ─────────│
  │── Konfirmasi terima ─────►│── PO COMPLETED ─────────►│
  │                          │   (ledger SHA-256)       │
```

### Cara Kerja Smart Matching

```
Input:  Harvest (komoditas, volume, harga, lat, lng)
        Demand  (komoditas, volume, harga, lat, lng, deadline)

Scoring (0-100):
  1. Distance Score  = max(0, 100 - (distanceKm / maxDist * 100))
                       Haversine formula untuk jarak GPS
  
  2. Volume Score    = min(100, harvestVol / demandVol * 100)
                       Kesesuaian volume supply vs demand
  
  3. Price Score     = max(0, 100 - abs(harvestPrice - demandPrice) / demandPrice * 100)
                       Kesesuaian harga harapan

  Total Score = (distanceScore × 0.4) + (volumeScore × 0.3) + (priceScore × 0.3)

Output: Match dengan score tertinggi ditampilkan di atas
        Threshold minimum: score > 0 (semua match ditampilkan)
```

### Cara Kerja Disease Detection AI

```
User upload foto daun
        │
        ▼
Browser → Railway FastAPI (/predict-base64)
        │
        ▼
Decode base64 → PIL Image
        │
        ▼
1. Gemini API (gemini-2.0-flash)  ← analisis UTAMA
        │ gagal / quota habis
        ▼
2. OpenRouter vision (gemma-4 / nemotron VL free)
        │ gagal / key kosong
        ▼
3. Model ML lokal ResNet9 (.pth) — jika tersedia
        │ tidak ada
        ▼
4. Color-based diagnosis (demo fallback, hindari 503)
        │
        ▼
Parse JSON response:
  {
    is_plant: true/false,
    disease: "Nama penyakit",
    confidence: 0.0-1.0,
    detailed_analysis: "Deskripsi + solusi lengkap",
    mode: "gemini_primary" | "openrouter_vision" | "color_analysis" | ...
  }
        │
        ▼
Return ke frontend → tampilkan hasil
  + hitung volume adjustment (koreksi estimasi panen)
  + simpan ke DB (disease_detections table)
  + tampil di QR Trace Modal tab "Kesehatan"
```

Env yang dibutuhkan di ML server (`ml-tumbu-main/.env` / Railway):
- `GEMINI_API_KEY` — analisis utama
- `OPENROUTER_API_KEY` — fallback vision (https://openrouter.ai/keys)
- `OPENROUTER_MODEL` (opsional) — default `google/gemma-4-26b-a4b-it:free`

### Cara Kerja QR Trace & Lacak Batch

```
Petani klik "QR Trace" di tabel lahan
        │
        ▼
HarvestTraceModal (3 tab):
  ┌─────────────────────────────────────┐
  │ Tab 1: Info & QR                    │
  │  - Data lahan lengkap               │
  │  - QR Code (encode URL              │
  │    /public?trace=<harvest_id>)      │
  │  - Fingerprint SHA-256              │
  │  - Status PO terkait                │
  └─────────────────────────────────────┘
  ┌─────────────────────────────────────┐
  │ Tab 2: Lacak Batch                  │
  │  - Stepper visual per batch:        │
  │    READY → IN_TRANSIT → DELIVERED   │
  │  - Volume, priority score,          │
  │    link PO terkait                  │
  └─────────────────────────────────────┘
  ┌─────────────────────────────────────┐
  │ Tab 3: Riwayat Penyakit             │
  │  - Semua deteksi AI untuk lahan ini │
  │  - Foto thumbnail + diagnosis       │
  │  - Koreksi volume yang diterapkan   │
  └─────────────────────────────────────┘

Pembeli scan QR → decode ID → buka HarvestTraceModal in-app
  ATAU buka /public?trace=<id> → TracePublicView (tanpa login)
```

### Cara Kerja Hash-Chain Ledger

```
Setiap PO COMPLETED → buat ledger entry:

entry = {
  id: uuid,
  preOrderId: po.id,
  recordData: JSON.stringify(po),
  previousHash: hash entry sebelumnya (atau "GENESIS"),
  currentHash: SHA-256(previousHash + recordData + timestamp)
}

Verifikasi rantai:
  for each entry:
    recompute = SHA-256(entry.previousHash + entry.recordData)
    if recompute !== entry.currentHash → "Manipulasi Terdeteksi"
    if entry.previousHash !== prev.currentHash → "Rantai Rusak"

Hasil ditampilkan di:
  - PublicDashboard → Hash-Chain Ledger table
  - Badge "Valid" / "Manipulasi?" per entri
```

### Cara Kerja Route Optimization

```
Input: Semua batch READY di suatu wilayah
       Koordinat depot kolektor

Algoritma:
  1. Clarke-Wright Savings:
     - Hitung savings(i,j) = dist(depot,i) + dist(depot,j) - dist(i,j)
     - Sort savings descending
     - Gabungkan rute yang menghemat jarak terbanyak
  
  2. 2-opt Local Search:
     - Coba swap setiap pasang edge di rute
     - Terima swap jika total jarak berkurang
     - Iterasi sampai tidak ada improvement
  
  3. OSRM API:
     - Rute hasil dirender di peta menggunakan jalan aktual
     - Bukan garis lurus, tapi rute jalan yang bisa dilalui kendaraan

Output: Urutan penjemputan optimal per kendaraan
        Ditampilkan di peta + list di KolektorView
```

---

## 4. Deployment Architecture

```
GitHub (RizkyCipta301105/tanilink)
    │
    ├─── Vercel (auto-deploy on push)
    │         Next.js App
    │         URL: tanilink-opal.vercel.app
    │
    ├─── Railway (fork akun lain, auto-deploy on sync)
    │         FastAPI ML Server
    │         URL: tanilink-app-production.up.railway.app
    │
    └─── Supabase (managed PostgreSQL)
              Database: tanilink
              Region: Southeast Asia (Singapore)
```

---

## 5. Akun Demo

Password semua akun: **`demo123`**

| Role | Email | Kemampuan Utama |
|---|---|---|
| 🌾 Petani | `petani@demo.com` | Input lahan, deteksi penyakit, QR trace, PO |
| 🛒 Pembeli | `pembeli@demo.com` | Demand, scan QR, ACC PO, bayar |
| 🚛 Kolektor | `kolektor@demo.com` | Route optimization, update batch |
| 👨‍🏫 PPL/BPP | `ppl@demo.com` | Monitoring, konten edukasi |
| 🏛️ Dinas | `dinas@demo.com` | Agregat regional |
| ⚙️ Admin | `admin@demo.com` | Full access |

Public dashboard (tanpa login): `/public`
