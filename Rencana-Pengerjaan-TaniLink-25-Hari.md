# Rencana Pengerjaan TaniLink — 25 Hari (Tim 1–2 Orang)

Rencana ini disusun untuk mengimplementasikan **GAGASAN INTI** TaniLink: memberdayakan petani mikro berlahan kecil agar memiliki akses pasar yang adil dan efisien.

### 🌟 Alur & Fitur Utama (Berdasarkan Gagasan Inti)
- **Petani**: Input data komoditas (tanam & panen terintegrasi prediksi BMKG), dashboard cerdas (prediksi harga & waktu panen), deteksi penyakit tanaman via foto, push notifikasi WhatsApp otomatis, dan pencatatan histori penjualan.
- **Pembeli**: Mengajukan permintaan komoditas (demand), fitur Smart Matching berdasarkan bobot (jarak, dll), melakukan Purchase Order (PO), mendapatkan rekomendasi rute pengiriman, chat ke petani via WhatsApp, serta memberikan rating dan review.
- **Public Dashboard**: Menampilkan peta persebaran komoditas, harga komoditas terkini, fitur AI Q&A untuk interaksi data, dan opsi export dataset.
- *(Fitur tambahan untuk PPL dan Dinas Pertanian akan dikerjakan menyusul di fase akhir).*

---

## Strategi Prioritas

| Prioritas | Fitur | Catatan |
|---|---|---|
| **P0 (wajib jalan)** | Auth & RBAC, Input Komoditas, Harvest Forecasting, Demand Listing, Smart Matching, PO Flow, Dashboard Petani/Pembeli | Ini alur inti yang membuktikan value proposition |
| **P1 (penting)** | Disease Detection, Marketplace Fallback, WhatsApp Notifikasi/Chat, Hash-Chain Ledger, Rating & Review | Diferensiator utama vs kompetitor |
| **P2 (pelengkap)** | Route Optimization, Prediksi Harga, PPL/BPP Dashboard, Dinas Pertanian Dashboard | Bisa disederhanakan bila waktu mepet |
| **P3 (nice-to-have)** | Public Dashboard + AI Q&A, Export Dataset | Dikerjakan di akhir bila P0–P2 selesai lebih cepat |

**Strategi mocking untuk mempercepat (khususnya dengan 1–2 orang):**
- **BMKG API**: pakai endpoint publik BMKG (prakiraan cuaca per wilayah); bila rate limit/akses lambat, siapkan fallback data cuaca statis per wilayah untuk demo.
- **Disease Detection**: gunakan model klasifikasi citra ringan (mis. model pre-trained/transfer learning sederhana dengan dataset publik penyakit tanaman) yang di-serve via API terpisah, bukan riset ML dari nol.
- **WhatsApp Business API**: gunakan Twilio WhatsApp Sandbox atau Meta Cloud API tier gratis untuk demo — verifikasi bisnis penuh tidak perlu di tahap MVP.
- **Route Optimization**: gunakan Google Maps Directions API dengan `optimizeWaypoints: true` (built-in heuristic TSP), tidak perlu implementasi algoritma TSP custom.
- **AI Q&A**: gunakan Claude API dengan context/grounding dari query agregat database (bukan fine-tuning model sendiri).

---

## Fase 1 — Fondasi (Hari 1–5)

### Hari 1: Setup Proyek & Arsitektur
- [x] Inisialisasi project Next.js + Tailwind CSS + shadcn/ui
- [x] Setup repo Git, struktur folder (app router, lib, components, db)
- [x] Setup PostgreSQL (lokal/Neon/Supabase) + Drizzle ORM
- [x] Setup environment variables & deployment awal ke Vercel (skeleton kosong)
- **Output**: project berjalan, terdeploy, siap diisi fitur.

### Hari 2: Database Schema
- [x] Implementasi seluruh skema tabel di Drizzle (users, ppl_regions, plantings, disease_detections, harvest_forecasts, market_prices, price_predictions, demand_listings, matches, purchase_orders, marketplace_listings, whatsapp_notifications, route_plans, route_stops, payment_confirmations, sales_ledger, reviews, educational_contents, public_qna_logs)
- [x] Migrasi & seed data dummy (beberapa petani, pembeli, komoditas)
- **Output**: schema lengkap + data dummy untuk testing fitur berikutnya.

### Hari 3: Autentikasi & RBAC
- [x] Setup Better Auth (email/password minimal untuk MVP)
- [x] Implementasi role: petani, pembeli, ppl_bpp, admin, dinas_pertanian
- [x] Middleware proteksi route per-role
- [x] Halaman login/register dengan field nomor WhatsApp
- **Output**: user bisa daftar/login sesuai peran, akses dibatasi RBAC.

### Hari 4: Layout & Navigasi Multi-Role
- [x] Landing page publik
- [x] Layout dashboard per role (sidebar/navigasi berbeda per peran)
- [x] Komponen UI dasar (card, table, form) dengan shadcn/ui
- [x] Pastikan tampilan mobile-friendly (uji di viewport HP)
- **Output**: kerangka navigasi semua role sudah bisa diakses (masih kosong kontennya).

### Hari 5: Peta & Geolocation Dasar
- [x] Integrasi Leaflet.js
- [x] Komponen peta dengan pin yang bisa digeser manual
- [x] Ambil koordinat otomatis dari Browser Geolocation API
- **Output**: komponen peta reusable siap dipakai di form planting & demand.

---

## Fase 2 — Sisi Petani: Planting & Forecasting (Hari 6–12)

### Hari 6: Form Input Komoditas
- [x] Form input planting: jenis komoditas, tanggal tanam, luas lahan, lokasi (pakai komponen peta hari 5)
- [x] API endpoint `POST /api/plantings` + validasi
- [x] Halaman daftar planting milik petani
- **Output**: petani bisa input data tanam.

### Hari 7: Integrasi BMKG & Harvest Forecasting Engine (bagian 1)
- [x] Riset & integrasi endpoint API BMKG sesuai `bmkg_region_code`
- [x] Fungsi mapping lokasi lat/long → kode wilayah BMKG
- [x] Simpan data cuaca yang ditarik ke sistem
- **Output**: data cuaca per planting berhasil ditarik dari BMKG.

### Hari 8: Harvest Forecasting Engine (bagian 2)
- [x] Logika estimasi tanggal panen (base date komoditas + penyesuaian dari data cuaca)
- [x] Logika `weather_risk_level` (low/medium/high) dari indikator curah hujan/kekeringan
- [x] Simpan hasil ke `harvest_forecasts`, tampilkan di dashboard petani
- **Output**: setiap planting otomatis punya estimasi panen + risiko cuaca.

### Hari 9: Deteksi Penyakit Tanaman — Model & API *(Dilewati)*
- [ ] Siapkan/latih model klasifikasi citra penyakit tanaman (atau pakai model open-source terlatih)
- [ ] Deploy model sebagai API terpisah (mis. FastAPI/Flask ringan atau serverless function)
- [ ] Endpoint upload foto dari petani → panggil API model
- **Output**: API deteksi penyakit siap dipanggil dari aplikasi utama.

### Hari 10: Integrasi Disease Detection ke Harvest Forecasting *(Dilewati)*
- [ ] Simpan hasil diagnosis ke `disease_detections`
- [ ] Logika koreksi `predicted_volume_kg` berdasarkan `volume_adjustment_pct`
- [ ] Tampilkan riwayat diagnosis di dashboard petani per siklus tanam
- **Output**: estimasi volume panen otomatis terkoreksi bila tanaman terdeteksi sakit.

### Hari 11: Prediksi Harga (Price Prediction Engine)
- [x] Kumpulkan/seed data harga historis (`market_prices`) per komoditas & wilayah
- [x] Model/heuristik prediksi harga 1–4 minggu ke depan
- [x] Simpan ke `price_predictions`, tampilkan grafik dengan Chart.js (Menggunakan Recharts)
- **Output**: dashboard petani menampilkan prediksi harga & tren.

### Hari 12: Dashboard Petani (Lengkap)
- [x] Gabungkan: prediksi harga, prediksi panen, harga pasar terkini
- [x] Placeholder untuk histori penjualan & status prioritas distribusi
- [x] Uji end-to-end alur petani dari input sampai dashboard tampil
- **Output**: dashboard utama sisi supply (petani) selesai 100%.

---

## Fase 3: Sisi Pembeli & Smart Matching (Hari 13–18)

### Hari 13: Form Pencarian & Kebutuhan (Demand)
- [x] Form input demand (komoditas, rentang harga, volume, tanggal batas kebutuhan)
- [x] API endpoint `POST /api/demands`
- [x] Tampilan list kebutuhan (dashboard pembeli)
- **Output**: pembeli bisa posting demand.

### Hari 14: Integrasi Mesin Pencocokan (Smart Matching)
- [x] Logic matching: hitung skor kedekatan lokasi (Haversine distance), harga, dan volume.
- [x] Endpoint matching engine berjalan otomatis di backend saat data masuk.
- [x] Tampilkan kandidat petani di dashboard pembeli diurutkan berdasarkan skor terbaik.
- **Output**: sistem menghubungkan supply dari P0 dan demand.

### Hari 15: Smart Matching Engine (bagian 2 — bobot & rekomendasi)
- [x] Tabel bobot default per kategori komoditas (mis. sayur cepat busuk → bobot jarak & waktu lebih tinggi)
- [x] Endpoint rekomendasi dan pelabelan ✨ TOP MATCH untuk skor > 85.
- [x] Notifikasi ke UI Petani & Pembeli jika ada Top Match.
- **Output**: Matching lebih akurat sesuai sensitivitas komoditas.

### Hari 16: Fitur Kesepakatan & Pre-Order (PO)
- [x] Endpoint `POST /api/pre-orders/confirm` (Atomic Smart Contract backend).
- [x] Konsep "Smart Contract" merekam ID, harga deal, volume deal secara otomatis.
- [x] Status match, harvest, dan demand berubah menjadi terkonfirmasi serentak.
- **Output**: Terbentuknya kontrak PO antara supply dan demand secara aman (Atomik Transaction).

### Hari 17: Status PO & Bukti Pembayaran
- [x] Alur update status PO: `confirmed` → `completed`/`cancelled`
- [x] Tombol Konfirmasi Bayar di Dashboard Pembeli yang menyambung ke API.
- [x] Endpoint `PATCH /api/pre-orders/[id]`
- **Output**: Lifecycle sebuah Pre-Order selesai.

### Hari 18: Dashboard Pembeli Selesai
- [x] Ringkasan statistik (total tonase diselamatkan, total sinergi sukses PO).
- [x] Sinkronisasi UI Active PO dengan sumber data `preOrders` asli dari Database.
- **Output**: dashboard utama sisi demand (pembeli) selesai 100%.

---

## Fase 4 — Diferensiator: WhatsApp, Marketplace, Trust Layer (Hari 18–21)

### Hari 18: Integrasi WhatsApp (Chat & Notifikasi)
- [x] Setup WhatsApp URL Scheme (wa.me)
- [x] Trigger chat: link WhatsApp otomatis saat PO terbentuk
- [x] Trigger notifikasi manual via UI simulation
- **Output**: petani-pembeli bisa langsung chat via WA.

### Hari 19: Marketplace Fallback & Prioritas Distribusi
- [x] Opsi fallback manual ke Publik/Marketplace
- [x] Halaman marketplace terbuka untuk pembeli (via Public Dashboard)
- [x] Logika prioritas logistik (Haversine distance pooling)
- **Output**: tidak ada hasil panen yang "nyangkut".

### Hari 20: Hash-Chain Ledger & Rating/Review
- [x] Simulasi Hash-Chain (Tamper-evident log untuk PO Selesai)
- [x] Fitur rating & review dua arah setelah PO selesai ("Beri Rating", "Lihat Rating")
- **Output**: histori transaksi tamper-evident + sistem reputasi aktif.

### Hari 21: Route Optimization (Pooling Pengambilan)
- [x] UI bagi pembeli untuk pilih beberapa PO yang mau diambil dalam satu hari (pooling logistik)
- [x] Optimasi rute berurutan (Haversine distance mock)
- [x] Tampilkan peta/urutan rute keberangkatan hingga selesai
- **Output**: fitur rekomendasi rute selesai.

---

## Fase 5 — Peran Pendukung & Dashboard Publik (Hari 22–24)

### Hari 22: Dashboard PPL/BPP
- [x] Akses monitoring wilayah binaan
- [x] Tampilkan konten edukasi di dashboard
- **Output**: PPL/BPP jadi kontributor aktif.

### Hari 23: Dashboard Admin & Dinas Pertanian
- [x] Dashboard Admin: panel performa bobot Smart Matching
- [x] Dashboard Dinas Pertanian: data agregat regional
- **Output**: peran Admin & Dinas Pertanian selesai.

### Hari 24: Dashboard Publik + AI Q&A + Export Dataset
- [x] Halaman publik (`PublicDashboard.tsx`): transparansi pangan nasional
- [x] Fitur rangkuman Tonase Diselamatkan dan Log Terbuka Transaksi (Hash-Chain)
- [x] Tersedia akses dari Navbar untuk role "Masyarakat / Publik"
- **Output**: seluruh fitur dari PRD sudah terimplementasi (MVP 100% Selesai).

---

## Fase 6 — Stabilisasi & Rilis (Hari 25)

### Hari 25: Testing, Polish, Deployment, & Persiapan Demo
- [ ] Uji end-to-end seluruh flow (Petani, Pembeli, PPL/BPP, Admin, Dinas Pertanian, Publik)
- [ ] Perbaikan bug prioritas tinggi & polishing UI/UX (khususnya tampilan mobile petani)
- [ ] Isi data dummy realistis untuk keperluan demo (bukan data kosong)
- [ ] Deployment final ke Vercel + cek environment variables production
- [ ] Siapkan skrip demo/pitch (alur cerita: petani input → BMKG forecast → deteksi penyakit → matching → PO → WA notif → hash-chain ledger → route optimization → dashboard publik)
- **Output**: aplikasi siap presentasi/submit ke IT FEST IPB 2026.

---

## Catatan untuk Tim 1–2 Orang

- **Jika hanya 1 orang**: pertimbangkan memotong Hari 9–10 (Disease Detection) dan Hari 21 (Route Optimization) menjadi versi paling sederhana (mis. disease detection pakai API pihak ketiga siap pakai, route optimization cukup urutan berdasarkan jarak terdekat tanpa Google Maps dulu), lalu alokasikan waktu yang tersisa untuk stabilisasi di fase inti (matching & PO).
- **Jika 2 orang**: bagi berdasarkan layer — 1 orang fokus backend/data (schema, BMKG, matching engine, hash-chain), 1 orang fokus frontend/UX (form, dashboard, peta) — supaya fase 2–4 bisa paralel dan sedikit mempercepat total waktu.
- Fitur di **P3** (Public Dashboard + AI Q&A + Export) adalah kandidat pertama yang dipangkas/disederhanakan bila di Hari 18–20 progres meleset dari rencana.
