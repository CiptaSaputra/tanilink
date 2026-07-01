# Checklist Pembuatan Aplikasi TaniLink

## 1. Persiapan Tools & Akun
- [ ] Install tools development yang dipakai (code editor, Node.js, Git).
- [ ] Siapkan akun AI coding assistant yang dipakai tim (Claude Code/Antigravity/lainnya).
- [ ] Buat repository GitHub untuk project TaniLink.

## 2. Planning Produk dengan AI
- [ ] Matangkan konsep TaniLink: menghubungkan petani dan pembeli sejak tahap rencana tanam.
- [ ] Tetapkan lima modul inti: Harvest Forecasting, Price & Demand Prediction, Smart Matching & Pre-Order, Distribution Priority, Route Optimization.
- [ ] Tetapkan peran pengguna: Petani, Pembeli/Koperasi, PPL/Gapoktan, Admin, Dinas Pertanian (read-only).
- [ ] Tetapkan mekanisme input berlapis (petani mandiri, keluarga, Gapoktan, PPL) beserta metadata `input_source`.
- [ ] Finalisasi PRD (Overview, Requirements, Core Features, User Flow, Architecture, Database Schema, Tech Stack).
- [ ] Review, revisi, dan simpan PRD final sebagai acuan development bersama tim.

## 3. Setup Landing Page
- [ ] Buat proyek baru untuk landing page TaniLink.
- [ ] Tambahkan PRD ke dalam context AI coding assistant.
- [ ] Prompt AI untuk membuat landing page berdasarkan PRD (penjelasan masalah food loss, solusi, dan CTA daftar per peran).
- [ ] Jalankan landing page di local dan pastikan tidak ada error runtime.

## 4. Revisi Landing Page
- [ ] Review tampilan landing page di desktop.
- [ ] Review tampilan landing page di mobile.
- [ ] Revisi copywriting agar masalah food loss dan solusi TaniLink tersampaikan jelas.
- [ ] Revisi UI agar cocok untuk audiens petani, pembeli, dan instansi pemerintah (jelas, tidak terlalu ramai).
- [ ] Pastikan CTA "Daftar sebagai Petani/Pembeli/PPL" terlihat jelas.

## 5. Setup Database & Skema Data
- [ ] Buat skema database sesuai PRD: `users`, `gapoktan`, `farmer_profiles`, `plantings`, `harvest_forecasts`, `market_prices`, `price_predictions`, `demand_listings`, `matches`, `pre_orders`, `harvest_batches`, `routes`, `route_stops`.
- [ ] Jalankan migration database di lokal.
- [ ] Isi data dummy/seed untuk komoditas, harga historis, dan wilayah contoh (untuk keperluan testing forecasting & matching).

## 6. Autentikasi & Role-Based Access Control
- [ ] Prompt AI untuk membuat sistem login multi-role (Petani, Pembeli, PPL, Admin, Dinas Pertanian).
- [ ] Implementasikan RBAC di level API supaya tiap role hanya bisa akses data/fitur miliknya.
- [ ] Test login dan pembatasan akses tiap role.

## 7. Frontend Petani & Input Berlapis
- [ ] Prompt AI untuk membuat form input data tanam (komoditas, tanggal tanam, luas lahan, titik lokasi via peta).
- [ ] Buat tampilan batch entry khusus PPL/Gapoktan untuk input data banyak petani sekaligus.
- [ ] Pastikan field `input_source` dan `input_by_user_id` tersimpan otomatis sesuai siapa yang login.
- [ ] Test input dari sisi petani mandiri dan dari sisi PPL/Gapoktan.

## 8. Frontend Pembeli/Koperasi
- [ ] Prompt AI untuk membuat form pembuatan demand (komoditas, volume, harga, lokasi).
- [ ] Buat tampilan peta sebaran prediksi panen di sekitar lokasi pembeli.
- [ ] Buat tampilan status pre-order dan pelacakan distribusi batch.

## 9. Backend Harvest Forecasting & Price Prediction
- [ ] Buat endpoint agregasi data planting menjadi prediksi waktu & volume panen per wilayah.
- [ ] Buat endpoint prediksi harga (regresi linear/exponential smoothing sederhana) berbasis data historis.
- [ ] Test akurasi output dengan data dummy sebelum dipakai fitur lain.

## 10. Backend Smart Matching & Pre-Order
- [ ] Implementasikan perhitungan skor gabungan (Haversine untuk jarak, kesesuaian volume, kesesuaian harga).
- [ ] Buat mekanisme bobot (w1, w2, w3) yang bisa diatur Admin.
- [ ] Buat endpoint notifikasi saat skor matching tinggi.
- [ ] Buat alur konfirmasi pre-order dari hasil matching yang diterima.
- [ ] Test skenario matching dengan berbagai kombinasi jarak/volume/harga.

## 11. Backend Distribution Priority & Route Optimization
- [ ] Implementasikan perhitungan skor prioritas distribusi (umur simpan, prediksi cuaca, jadwal panen).
- [ ] Implementasikan clustering sederhana untuk mengelompokkan titik panen secara geografis.
- [ ] Implementasikan heuristik nearest-neighbor untuk urutan rute penjemputan.
- [ ] Tampilkan hasil rute di peta interaktif (Leaflet.js).
- [ ] Test dengan beberapa titik panen sekaligus untuk memastikan urutan rute masuk akal.

## 12. Dashboard Admin
- [ ] Prompt AI untuk membuat dashboard ringkasan planting, demand, matching, dan batch siap distribusi.
- [ ] Buat panel pengaturan bobot Smart Matching Engine.
- [ ] Buat fitur resolusi dispute data (misalnya data planting ganda).
- [ ] Test seluruh fitur admin di dev server.

## 13. Dashboard Dinas Pertanian (Read-Only)
- [ ] Prompt AI untuk membuat dashboard agregat regional: tren harga, sebaran planting, potensi surplus/defisit.
- [ ] Pastikan seluruh akses Dinas Pertanian bersifat read-only, tidak ada aksi ubah data.
- [ ] Test bahwa role ini tidak bisa mengakses endpoint tulis data.

## 14. Integrasi Frontend dan Backend
- [ ] Hubungkan seluruh form (planting, demand, matching, pre-order) ke API masing-masing.
- [ ] Pastikan data yang diinput oleh sumber berbeda (petani/keluarga/Gapoktan/PPL) menghasilkan tampilan output yang identik di sisi pembeli dan Dinas Pertanian.
- [ ] Sinkronkan visualisasi peta dan grafik dengan data real dari backend.

## 15. Testing Local dan Revisi
- [ ] Test flow Petani dari input tanam sampai menerima notifikasi matching.
- [ ] Test flow PPL dari input proxy sampai memantau wilayah binaan.
- [ ] Test flow Pembeli dari membuat demand sampai pre-order disepakati.
- [ ] Test flow Distribution Priority dan Route Optimization dengan beberapa batch panen sekaligus.
- [ ] Test flow Dinas Pertanian memastikan data agregat tampil benar dan read-only.
- [ ] Test responsive design di desktop dan mobile.
- [ ] Catat bug, prompt AI untuk memperbaiki, lalu re-test sampai build production berhasil.

## 16. Deploy ke Production
- [ ] Buat Dockerfile/setup deployment untuk production build.
- [ ] Commit dan push seluruh source code (landing page + web app) ke GitHub.
- [ ] Deploy ke platform hosting yang dipakai (VPS/Vercel/lainnya).
- [ ] Set environment variables, database production, build command, dan start command.
- [ ] Jalankan migration database production.
- [ ] Hubungkan domain/subdomain dan aktifkan SSL/HTTPS.
- [ ] Test seluruh flow (Petani, Pembeli, PPL, Admin, Dinas Pertanian) di production.

## 17. Final Showcase & Dokumentasi Lomba
- [ ] Buat data demo untuk showcase (beberapa petani, pembeli, dan komoditas contoh).
- [ ] Ambil screenshot landing page, dashboard tiap role, dan alur matching/route optimization.
- [ ] Buat narasi singkat: masalah food loss, solusi TaniLink, dan kelima fitur utamanya.
- [ ] Siapkan materi presentasi/proposal lomba dengan link live demo (jika ada).
- [ ] Review keseluruhan showcase dan dokumen sebelum submisi/presentasi.
