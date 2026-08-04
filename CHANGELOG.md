# Changelog TaniLink

Semua perubahan signifikan dicatat di sini secara kronologis.

---

## [v1.4.0] — 2026-08-04 · QR Scanner, AI QnA Gemini & Polish Final

### ✨ Fitur Baru
- **QR Scanner Kamera Real**: tombol "Kamera" di Lacak Batch buka kamera MacBook/HP via `jsQR` library — scan frame overlay hijau, laser line animasi, auto-detect hasil
- **QR Scanner Upload Gambar**: tab "Upload Gambar" sebagai alternatif — preview gambar sebelum scan, feedback loading/sukses/error
- **AI QnA Gemini**: `/api/qa` sekarang pakai Gemini API dengan data real DB sebagai context (tonase, komoditas, wilayah, harga) — jawaban bahasa Indonesia alami; fallback ke rule-based bila API key kosong
- **Redesign Lacak Batch**: header gradient hijau/teal, info batch terpilih (komoditas, volume, tanggal, status), 3 tombol Simulasi/Kamera/Publik yang rapi

### 🔧 Improvement
- `GEMINI_API_KEY` dipakai shared untuk AI QnA dan ML disease detection
- `.env.example` diupdate dengan dokumentasi lengkap per env var

---

## [v1.3.0] — 2026-08-04 · UI/UX Polish & Bug Fixes

### ✨ Fitur Baru
- **Peta Interaktif — Info Konteks Dinamis**: klik peta menampilkan komoditas, volume, harga, dan tanggal dari lahan terdekat (~15km)
- **Chat In-App**: tombol "Chat In-App" di tabel PO petani dan pembeli — ChatModal bubble persisted ke DB
- **Snap Info Peta**: cari lahan terdekat tanpa lock koordinat

### 🐛 Bug Fix
- ACC Final & Buat PO gagal: API guard `CONFIRMED` → `FINALIZED`
- Batch tidak muncul di Kolektor: filter region diperluas ke semua wilayah + dropdown
- PPLView kosong: hapus filter `isPublished === true`
- InteractiveMap ReferenceError: `harvestsRef` sebelum `filteredHarvests`
- Match tampil komoditas salah: match digroup per demand
- ACC langsung tanpa PO: tombol `CONFIRMED` → `ACCEPTED_BY_BUYER`

### 🔧 Improvement
- Reset Data hanya Admin (navbar + double confirmation)
- Nama petani demo: "Pak Joko Widodo" → "Pak Budi Santoso"
- PPLView & KolektorView: dropdown filter wilayah

---

## [v1.2.0] — 2026-08-03 · Integrasi & Feature Polish

### ✨ Fitur Baru
- **PO Acceptance Flow 2-Pihak**: `POConfirmModal` klausul → CONFIRMED → ACC Final → FINALIZED → PO
- **Rating Sekali Pakai**: setelah submit → bintang statis + "Ulasan terkirim"
- **Link Dashboard Publik** di navbar landing
- **Redesign PublicDashboard**: hero animated counter, 4 stat cards, top komoditas, layout 2-kolom
- **Logo TaniLink** di navbar landing dan footer

### 🔧 Improvement
- KolektorView: semua wilayah + dropdown + depot coords lengkap
- Match digroup per demand di BuyerView

---

## [v1.1.0] — 2026-08-03 · Landing Page, ML & QR Trace

### ✨ Fitur Baru
- **Landing Page**: hero video scroll-scrub, timeline, sticky cards, FAQ, CTA split panel
- **ML Disease Detection**: FastAPI + Gemini API, proxy `/api/disease-detections/predict`
- **HarvestTraceModal 3-tab**: Info+QR, Lacak Batch stepper, Riwayat Penyakit
- **API Verifikasi Publik**: `GET /api/trace/:id` (tanpa auth)
- **TracePublicView**: halaman verifikasi di `/public?trace=id`

### 🔧 Upgrade
- Next.js 15.5.20 → **16.2.12** (Turbopack)

---

## [v1.0.0] — 2026-08-01 · MVP Core

### ✨ Fitur Inti
- Auth & RBAC multi-role (Petani, Pembeli, PPL, Kolektor, Dinas, Admin)
- Smart Matching Engine (Haversine + volume + harga)
- PO Flow lengkap
- Hash-Chain Ledger SHA-256
- Route Optimization (Clarke-Wright + 2-opt + OSRM)
- Prediksi Harga 14 hari (Holt's Double ES + Fourier)
- Marketplace Fallback
- Notifikasi real-time polling 3 detik
- Rating & Review dua arah
- Chat In-App + link `wa.me`
- Export CSV/JSON
- Peta Interaktif Leaflet.js
- PostgreSQL 15 + Drizzle ORM (16 tabel)

---

## 📁 Arsip Dokumentasi

| Dokumen | Lokasi |
|---|---|
| PRD lengkap | [`docs/PRD-TaniLink.md`](docs/PRD-TaniLink.md) |
| Rencana 25 Hari + Fase 7 | [`docs/Rencana-Pengerjaan-TaniLink-25-Hari.md`](docs/Rencana-Pengerjaan-TaniLink-25-Hari.md) |
| Proposal Lomba | [`dokumen/Proposal TaniLink.docx`](dokumen/Proposal%20TaniLink.docx) |


Semua perubahan signifikan dicatat di sini secara kronologis.

---

## [v1.3.0] — 2026-08-04 · UI/UX Polish & Bug Fixes

### ✨ Fitur Baru
- **Peta Interaktif — Info Konteks Dinamis**: klik peta menampilkan komoditas, volume, harga, dan tanggal panen dari lahan terdekat (~15km) — bukan lagi hardcoded "Cabai Merah 0 Kg"
- **Chat In-App**: tombol "Chat In-App" di tabel PO petani dan pembeli — ChatModal bubble persisted ke DB, kirim dengan Enter
- **Snap Info Peta**: cari lahan terdekat saat klik peta, tampilkan sebagai konteks popup tanpa lock koordinat

### 🐛 Bug Fix
- **ACC Final & Buat PO gagal**: API guard salah cek `CONFIRMED` — diubah ke `FINALIZED` sesuai flow 2-pihak baru
- **Batch tidak muncul di Kolektor**: filter region terlalu ketat — sekarang default tampilkan semua wilayah + dropdown filter
- **PPLView kosong saat pilih wilayah**: filter `isPublished === true` dihapus, ganti dengan `status !== EXPIRED`
- **InteractiveMap ReferenceError**: `harvestsRef` diinisialisasi sebelum `filteredHarvests` — pindah ke setelah `useMemo`
- **Match tampil komoditas salah di BuyerView**: match sekarang digroup per demand dengan header komoditas jelas
- **ACC langsung tanpa PO**: tombol "Terima Penawaran" di pendingBids diubah dari `CONFIRMED` → `ACCEPTED_BY_BUYER`

### 🔧 Improvement
- **Reset Data hanya Admin**: tombol reset di Navbar disembunyikan dari role non-Admin + double confirmation di AdminView
- **Nama petani demo**: ganti "Pak Joko Widodo" → "Pak Budi Santoso"
- **PPLView filter wilayah**: dropdown filter wilayah + selalu include region PPL sebagai default

---

## [v1.2.0] — 2026-08-03 · Integrasi & Feature Polish

### ✨ Fitur Baru
- **PO Acceptance Flow 2-Pihak**: `POConfirmModal` — petani centang 3 klausul kontrak → CONFIRMED → pembeli ACC Final → FINALIZED → PO terbentuk
- **Rating Sekali Pakai**: setelah submit rating → tampil bintang statis + "Ulasan terkirim", tidak bisa input ulang
- **Link Dashboard Publik di Landing**: navbar landing tambah link "Data Publik" → `/public`
- **Redesign PublicDashboard**: hero banner dengan animated counter, 4 stat cards, layout 2-kolom, top komoditas progress bar
- **Logo TaniLink**: ganti icon Leaf dengan logo resmi di navbar landing (desktop + mobile) dan footer

### 🔧 Improvement
- **KolektorView**: default tampilkan batch semua wilayah + dropdown filter + tambah depot coords (Cirebon, Bandung, dll)
- **Match digroup per demand**: BuyerView menampilkan match dengan header "Kebutuhan: [Komoditas]" per demand

---

## [v1.1.0] — 2026-08-03 · Landing Page, ML & QR Trace

### ✨ Fitur Baru
- **Landing Page**: hero video scroll-scrub, timeline musim tanam, sticky cards, dashboard preview peta, FAQ, CTA split panel petani/pembeli
- **ML Disease Detection**: FastAPI + Gemini API — upload foto daun → diagnosis dalam Bahasa Indonesia, confidence bar, riwayat deteksi
- **Proxy API ML**: `/api/disease-detections/predict` (server-side, hindari CORS)
- **HarvestTraceModal 3-tab**: Info+QR code, Lacak Batch (stepper READY→IN_TRANSIT→DELIVERED), Riwayat Penyakit
- **API Verifikasi Publik**: `GET /api/trace/:id` — return harvest + batches + disease + PO + fingerprint SHA256 (tanpa auth)
- **TracePublicView**: halaman verifikasi 3-tab di `/public?trace=id` (tanpa login)
- **Scanner QR BuyerView**: input ID manual + buka halaman publik di tab baru

### 🔧 Upgrade
- **Next.js 15.5.20 → 16.2.12** (Turbopack) — dev server ~5x lebih cepat
- Hapus config `eslint` dari `next.config.mjs` (tidak didukung v16)

---

## [v1.0.0] — 2026-08-01 · MVP Core

### ✨ Fitur Inti
- **Auth & RBAC**: Login/register multi-role (Petani, Pembeli, PPL, Kolektor, Dinas, Admin)
- **Dashboard semua role**: FarmerView, BuyerView, KolektorView, PPLView, DinasView, AdminView, PublicDashboard
- **Smart Matching Engine**: skor Haversine + volume + harga, bobot per kategori komoditas
- **PO Flow**: PENDING → WAITING_BUYER_APPROVAL → ACCEPTED_BY_BUYER → CONFIRMED → COMPLETED
- **Hash-Chain Ledger**: SHA-256 tamper-evident, verifikasi rantai di dashboard publik
- **Route Optimization**: Clarke-Wright Savings + 2-opt TSP, rute jalan aktual OSRM
- **Prediksi Harga**: Holt's Double ES + Fourier, grafik 14 hari per komoditas
- **Marketplace Fallback**: batch tak ter-match otomatis ke listing terbuka
- **Notifikasi Real-time**: polling 3 detik + bell icon + riwayat per user
- **Rating & Review**: dua arah setelah PO selesai
- **Chat In-App**: persisted ke DB via `/api/conversations` + link `wa.me`
- **Export Dataset**: CSV/JSON untuk peneliti
- **AI Q&A**: rule-based dari data agregat platform
- **Peta Interaktif**: Leaflet.js + geolocation + Nominatim + pin lahan/demand
- **PostgreSQL + Drizzle ORM**: migrasi schema 16 tabel

---

## 📁 Arsip Dokumentasi

Dokumentasi lengkap tersimpan di folder [`docs/`](docs/):
- [`PRD-TaniLink.md`](docs/PRD-TaniLink.md) — Product Requirements Document
- [`Rencana-Pengerjaan-TaniLink-25-Hari.md`](docs/Rencana-Pengerjaan-TaniLink-25-Hari.md) — Rencana & checklist 25 hari + Fase 7 post-rencana
