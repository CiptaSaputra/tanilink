# Rencana Pengerjaan TaniLink — 25 Hari (Tim 1–2 Orang)

Rencana ini disusun untuk tim kecil (1–2 orang) yang mengerjakan MVP TaniLink dalam 25 hari kerja. Karena keterbatasan waktu dan tenaga, beberapa integrasi eksternal disederhanakan/di-mock dulu di tahap awal supaya alur inti (petani → matching → PO → transaksi) bisa jalan end-to-end lebih cepat, baru kemudian disempurnakan.

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
- [ ] Inisialisasi project Next.js + Tailwind CSS + shadcn/ui
- [ ] Setup repo Git, struktur folder (app router, lib, components, db)
- [ ] Setup PostgreSQL (lokal/Neon/Supabase) + Drizzle ORM
- [ ] Setup environment variables & deployment awal ke Vercel (skeleton kosong)
- **Output**: project berjalan, terdeploy, siap diisi fitur.

### Hari 2: Database Schema
- [ ] Implementasi seluruh skema tabel di Drizzle (users, ppl_regions, plantings, disease_detections, harvest_forecasts, market_prices, price_predictions, demand_listings, matches, purchase_orders, marketplace_listings, whatsapp_notifications, route_plans, route_stops, payment_confirmations, sales_ledger, reviews, educational_contents, public_qna_logs)
- [ ] Migrasi & seed data dummy (beberapa petani, pembeli, komoditas)
- **Output**: schema lengkap + data dummy untuk testing fitur berikutnya.

### Hari 3: Autentikasi & RBAC
- [ ] Setup Better Auth (email/password minimal untuk MVP)
- [ ] Implementasi role: petani, pembeli, ppl_bpp, admin, dinas_pertanian
- [ ] Middleware proteksi route per-role
- [ ] Halaman login/register dengan field nomor WhatsApp
- **Output**: user bisa daftar/login sesuai peran, akses dibatasi RBAC.

### Hari 4: Layout & Navigasi Multi-Role
- [ ] Landing page publik
- [ ] Layout dashboard per role (sidebar/navigasi berbeda per peran)
- [ ] Komponen UI dasar (card, table, form) dengan shadcn/ui
- [ ] Pastikan tampilan mobile-friendly (uji di viewport HP)
- **Output**: kerangka navigasi semua role sudah bisa diakses (masih kosong kontennya).

### Hari 5: Peta & Geolocation Dasar
- [ ] Integrasi Leaflet.js
- [ ] Komponen peta dengan pin yang bisa digeser manual
- [ ] Ambil koordinat otomatis dari Browser Geolocation API
- **Output**: komponen peta reusable siap dipakai di form planting & demand.

---

## Fase 2 — Sisi Petani: Planting & Forecasting (Hari 6–12)

### Hari 6: Form Input Komoditas
- [ ] Form input planting: jenis komoditas, tanggal tanam, luas lahan, lokasi (pakai komponen peta hari 5)
- [ ] API endpoint `POST /api/plantings` + validasi
- [ ] Halaman daftar planting milik petani
- **Output**: petani bisa input data tanam.

### Hari 7: Integrasi BMKG & Harvest Forecasting Engine (bagian 1)
- [ ] Riset & integrasi endpoint API BMKG sesuai `bmkg_region_code`
- [ ] Fungsi mapping lokasi lat/long → kode wilayah BMKG
- [ ] Simpan data cuaca yang ditarik ke sistem
- **Output**: data cuaca per planting berhasil ditarik dari BMKG.

### Hari 8: Harvest Forecasting Engine (bagian 2)
- [ ] Logika estimasi tanggal panen (base date komoditas + penyesuaian dari data cuaca)
- [ ] Logika `weather_risk_level` (low/medium/high) dari indikator curah hujan/kekeringan
- [ ] Simpan hasil ke `harvest_forecasts`, tampilkan di dashboard petani
- **Output**: setiap planting otomatis punya estimasi panen + risiko cuaca.

### Hari 9: Deteksi Penyakit Tanaman — Model & API
- [ ] Siapkan/latih model klasifikasi citra penyakit tanaman (atau pakai model open-source terlatih)
- [ ] Deploy model sebagai API terpisah (mis. FastAPI/Flask ringan atau serverless function)
- [ ] Endpoint upload foto dari petani → panggil API model
- **Output**: API deteksi penyakit siap dipanggil dari aplikasi utama.

### Hari 10: Integrasi Disease Detection ke Harvest Forecasting
- [ ] Simpan hasil diagnosis ke `disease_detections`
- [ ] Logika koreksi `predicted_volume_kg` berdasarkan `volume_adjustment_pct`
- [ ] Tampilkan riwayat diagnosis di dashboard petani per siklus tanam
- **Output**: estimasi volume panen otomatis terkoreksi bila tanaman terdeteksi sakit.

### Hari 11: Prediksi Harga (Price Prediction Engine)
- [ ] Kumpulkan/seed data harga historis (`market_prices`) per komoditas & wilayah
- [ ] Model/heuristik prediksi harga 1–4 minggu ke depan (bisa mulai dari regresi sederhana/moving average, upgrade nanti bila sempat)
- [ ] Simpan ke `price_predictions`, tampilkan grafik dengan Chart.js
- **Output**: dashboard petani menampilkan prediksi harga & tren.

### Hari 12: Dashboard Petani (Lengkap)
- [ ] Gabungkan: prediksi harga, prediksi panen, harga pasar terkini, status penyakit terakhir
- [ ] Placeholder untuk histori penjualan (hash-chain) & status prioritas distribusi (diisi di fase selanjutnya)
- [ ] Uji end-to-end alur petani dari input sampai dashboard tampil
- **Output**: Dashboard Petani P0 selesai.

---

## Fase 3 — Sisi Pembeli & Smart Matching (Hari 13–17)

### Hari 13: Manajemen Demand (Pembeli)
- [ ] Form buat demand listing: komoditas, volume, lokasi, tenggat waktu, harga penawaran
- [ ] API endpoint `POST /api/demand` + halaman daftar demand milik pembeli
- [ ] Peta sebaran prediksi panen petani di sekitar lokasi pembeli
- **Output**: pembeli bisa publikasikan kebutuhan.

### Hari 14: Smart Matching Engine (bagian 1 — scoring)
- [ ] Fungsi hitung `distance_km` (Haversine) antara demand & planting
- [ ] Fungsi `harvest_time_score` (kesesuaian tenggat vs prediksi tanggal panen)
- [ ] Fungsi `price_score` (kesesuaian harga penawaran vs prediksi harga)
- [ ] Fungsi `reputation_score` (dari rating historis petani — default netral bila belum ada data)
- **Output**: fungsi skor individual siap dipakai.

### Hari 15: Smart Matching Engine (bagian 2 — bobot & rekomendasi)
- [ ] Tabel bobot default per kategori komoditas (mis. sayur cepat busuk → bobot jarak & waktu lebih tinggi)
- [ ] Kalkulasi `total_score` gabungan, simpan ke `matches` dengan status `recommended`
- [ ] Halaman rekomendasi match untuk petani & pembeli (list, sortir berdasarkan skor)
- **Output**: sistem menghasilkan rekomendasi matching otomatis.

### Hari 16: Approval Match & Purchase Order (PO)
- [ ] Alur approval dua arah: petani & pembeli sama-sama harus setuju → status `accepted_by_both`
- [ ] Endpoint pembuatan PO dari match yang disetujui (`pending` → `confirmed`)
- [ ] Halaman detail PO untuk kedua pihak
- **Output**: PO pre-harvest bisa terbentuk dari hasil matching.

### Hari 17: Status PO & Bukti Pembayaran
- [ ] Alur update status PO: `confirmed` → `completed`/`cancelled`
- [ ] Form upload bukti pembayaran opsional (`payment_confirmations`)
- [ ] Dashboard Pembeli lengkap: listing demand, rekomendasi, status PO
- **Output**: Dashboard Pembeli P0 selesai, alur PO end-to-end berjalan.

---

## Fase 4 — Diferensiator: WhatsApp, Marketplace, Trust Layer (Hari 18–21)

### Hari 18: Integrasi WhatsApp (Chat & Notifikasi)
- [ ] Setup WhatsApp Business API (Twilio Sandbox untuk demo)
- [ ] Trigger chat: link/deep-link WhatsApp otomatis saat match/PO terbentuk
- [ ] Trigger notifikasi otomatis: match baru, PO masuk/berubah status, peringatan cuaca (`whatsapp_notifications`)
- **Output**: petani-pembeli bisa langsung chat via WA, notifikasi otomatis terkirim.

### Hari 19: Marketplace Fallback & Prioritas Distribusi
- [ ] Job/cron sederhana: planting `ready_to_harvest` tanpa match institusional dalam X hari → auto masuk `marketplace_listings`
- [ ] Opsi manual petani untuk pindah ke marketplace kapan saja
- [ ] Halaman marketplace terbuka untuk pembeli
- [ ] Logika prioritas distribusi (`priority_rank`): urutan PO masuk → kesesuaian volume → riwayat transaksi pembeli
- **Output**: tidak ada hasil panen yang "nyangkut", petani terlindungi dari rebutan pembeli.

### Hari 20: Hash-Chain Ledger & Rating/Review
- [ ] Implementasi hash-chain custom (SHA-256): setiap PO `completed` → entri baru di `sales_ledger` dengan `previous_hash`
- [ ] Fungsi verifikasi integritas chain (deteksi bila ada entri lama diubah)
- [ ] Fitur rating & review dua arah setelah PO selesai, tampilkan di histori penjualan petani
- **Output**: histori transaksi tamper-evident + sistem reputasi aktif (mempengaruhi `reputation_score` di matching).

### Hari 21: Route Optimization (Pooling Pengambilan)
- [ ] UI bagi pembeli untuk pilih beberapa PO yang mau diambil dalam satu hari (pooling)
- [ ] Integrasi Google Maps Directions API + `optimizeWaypoints`
- [ ] Simpan hasil ke `route_plans`/`route_stops`, tampilkan peta rute
- [ ] Opsi pembeli menyimpang dari urutan yang disarankan (status `deviated`)
- **Output**: fitur rekomendasi rute selesai.

---

## Fase 5 — Peran Pendukung & Dashboard Publik (Hari 22–24)

### Hari 22: Dashboard PPL/BPP
- [ ] Akses monitoring wilayah binaan (read-only: planting, prediksi panen, status PO, agregat deteksi penyakit)
- [ ] Fitur publikasi konten edukasi budidaya (`educational_contents`) per wilayah
- [ ] Tampilkan konten edukasi di dashboard petani sesuai wilayahnya
- **Output**: PPL/BPP jadi kontributor aktif, bukan sekadar pemantau.

### Hari 23: Dashboard Admin & Dinas Pertanian
- [ ] Dashboard Admin: ringkasan planting/demand/match/PO aktif, panel performa bobot Smart Matching per komoditas
- [ ] Fitur moderasi: konten edukasi PPL, dispute data, moderasi rating/review
- [ ] Dashboard Dinas Pertanian: data agregat regional (tren harga, sebaran planting, potensi surplus/defisit) — read-only
- **Output**: peran Admin & Dinas Pertanian selesai.

### Hari 24: Dashboard Publik + AI Q&A + Export Dataset
- [ ] Halaman publik tanpa login: peta persebaran komoditas real-time, harga pasar per wilayah
- [ ] AI Q&A: integrasi Claude API dengan grounding ke query agregat database
- [ ] Endpoint export dataset CSV/JSON untuk peneliti/pihak ketiga
- **Output**: seluruh fitur dari PRD sudah terimplementasi.

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
