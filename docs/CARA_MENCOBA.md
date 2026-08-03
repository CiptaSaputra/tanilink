# 🧪 Panduan Mencoba Semua Fitur TaniLink

> Versi 2026-08. Panduan lengkap untuk demo/mengetes seluruh fitur aplikasi.

## ⚡ Persiapan

### 1. Jalankan Database & Aplikasi

```bash
# Terminal 1 — database PostgreSQL
docker compose up -d

# Terminal 2 — migrasi + seed data (pertama kali saja)
npx drizzle-kit push
npx tsx src/db/seed.ts

# Terminal 3 — aplikasi
npm run dev
```

Buka **http://localhost:3001**

### 2. Akun Demo (password semua: `demo123`)

| Role | Email | Wilayah |
|---|---|---|
| 🌾 **Petani** | `petani@demo.com` | Brebes |
| 🛒 **Pembeli** | `pembeli@demo.com` | Semarang |
| 📋 **PPL/BPP** | `ppl@demo.com` | Brebes |
| 🚛 **Kolektor** | `kolektor@demo.com` | Cirebon |
| 🏛️ **Dinas** | `dinas@demo.com` | Jawa Tengah |
| ⚙️ **Admin** | `admin@demo.com` | Jakarta |

> 💡 **Tips:** Jika buka `http://localhost:3001` tanpa login → otomatis ke **Dashboard Publik** (transparansi pangan). Login lewat tombol **"Masuk"**.

---

## 🔐 1. Auth & Dashboard Publik

1. Buka root `/` → otomatis masuk **Dashboard Publik** tanpa login
2. Di dashboard publik coba:
   - **Ringkasan** — tonase diselamatkan, total transaksi
   - **AI Q&A** (tombol "Tanya AI") — tanya: *"Berapa tonase diselamatkan?"*, *"Komoditas teratas?"*, *"Harga Bawang Merah?"*
   - **Export CSV/JSON** — pilih tipe data → unduh
   - **Hash-Chain Ledger** — lihat verifikasi rantai transaksi
3. Klik **"Masuk"** → login dengan akun demo
4. Coba **login salah password** → muncul pesan error
5. **Register** akun baru → login dengan akun itu

---

## 🌾 2. Dashboard Petani (petani@demo.com)

**Navigasi:** bar di atas (Input Lahan · Prediksi Harga · Lahan Saya · Pencocokan · Pre-Order · Edukasi)

1. **Input Lahan** — isi komoditas, tanggal tanam, luas, koordinat (GPS atau klik peta) → "Laporkan Rencana Tanam"
   - Sistem otomatis hitung **risiko cuaca** (Open-Meteo) & estimasi panen
2. **Prediksi Harga** — pilih komoditas → lihat grafik historis + prediksi 14 hari
3. **Lahan Saya** — tabel lahan dengan **RISIKO CUACA** badge, tombol:
   - **QR Trace** — sertifikat QR
   - **Siap Kirim** — buat batch panen
   - **Jual Marketplace** — daftarkan lahan tak ter-match ke marketplace terbuka
4. **Pencocokan** — untuk match PENDING klik **"Ajukan Penawaran"** (set volume & harga) → status "Menunggu Persetujuan Pembeli"
   - Jika pembeli mengajak duluan → muncul **"Pembeli Mengajak Kerja Sama"** + tombol **Terima/Tolak**
5. **Pre-Order** — daftar kontrak, **Lihat Rute** (peta jalan aktual OSRM), **Chat Pembeli** (wa.me)
   - Saat pembeli sudah bayar → badge **"Bukti Bayar Masuk"** + tombol **"Konfirmasi Terima Bayar"** → PO selesai
   - Setelah selesai → **Lihat Rating** (bintang, distribusi, ulasan)
6. **Edukasi** — konten budidaya dari PPL untuk wilayah petani

---

## 🛒 3. Dashboard Pembeli (pembeli@demo.com)

**Navigasi:** Penawaran Masuk · Rilis Kebutuhan · Pencocokan · Pre-Order · Logistik · Marketplace

1. **Rilis Kebutuhan** — buat demand (komoditas, volume, harga, lokasi)
2. **Pencocokan Petani** — lihat rekomendasi match (skor, jarak, **rating petani**)
   - Klik **"Ajukan Kerja Sama"** → status "Menunggu Persetujuan Petani" (petani akan terima/tolak)
3. **Penawaran Masuk** (jika petani ajukan duluan) — tombol **Terima & Buat Kontrak** atau **Tolak**
4. **Pre-Order** — daftar kontrak:
   - **Konfirmasi Bayar** → buka modal upload **bukti bayar** → status "Menunggu Konfirmasi Petani"
   - **Lihat Rute** — peta jalan aktual dari petani ke gudang
   - **Chat WA** — langsung ke WhatsApp petani
5. **Logistik & Jemput** — pilih beberapa PO lunas → **"Hitung Rute Terdekat"** → lihat urutan + **peta jalan aktual**
6. **Marketplace** — beli listing terbuka (komoditas, volume, harga, rating penjual) → **Pilih Listing** / **Tandai Dibeli**
7. Setelah PO selesai → **Beri Rating** (1–5 bintang + komentar)

---

## 📋 4. Dashboard PPL/BPP (ppl@demo.com)

**Navigasi:** Ringkasan · Komoditas · Daftar Lahan · Status Batch · **Konten Edukasi**

1. Lihat data agregat wilayah binaan (read-only)
2. **Konten Edukasi** — buat konten budidaya (judul + isi) → status "Menunggu" (menunggu moderasi admin)
3. Cek status konten (Tayang / Ditolak / Menunggu)

---

## 🚛 5. Dashboard Kolektor (kolektor@demo.com)

**Navigasi:** Rute Rekomendasi · Batch Siap Jemput · Riwayat Batch

1. **Rute Rekomendasi** — pilih armada → lihat urutan penjemputan + **peta rute jalan aktual** (OSRM)
2. **Batch Siap Jemput** — update status:
   - **Berangkat Jemput** → `IN_TRANSIT`
   - **Jemput Langsung (Luar Rute)** → `PICKED_UP_DIRECTLY`
3. **Riwayat Batch** — batch yang sudah dikirim/terkirim

---

## 🏛️ 6. Dashboard Dinas (dinas@demo.com)

**Navigasi:** Indeks Nasional · Neraca Komoditas · Risiko Food Loss · Peramalan · Optimasi Rute

1. **Indeks Nasional** — agregat supply/demand, total volume
2. **Neraca Komoditas** — bar chart tanam vs permintaan
3. **Risiko Food Loss** — indeks surplus/defisit per wilayah
4. **Peramalan** — pilih komoditas & wilayah → grafik forecast 4 minggu (95% CI)
5. **Optimasi Rute** — set depot, kapasitas, jumlah armada → **Hitung Rute** → lihat rute per armada + **peta jalan aktual**

---

## ⚙️ 7. Dashboard Admin (admin@demo.com)

Admin bisa **switch role** (dropdown di mobile / tombol di desktop) untuk mengetes semua role sekaligus.

1. **Bobot Matching** — lihat bobot default per komoditas (read-only)
2. **Sengketa** — daftar match & dispute
3. **Ulasan** — monitoring rating
4. **Moderasi** — konten edukasi PPL: **Publish** / **Tolak**
5. **Prioritas** — antrian distribusi batch (skor prioritas)
6. **Pre-Order** — ringkasan kontrak
7. **Reset Data** (tombol di kanan atas) — kembalikan data ke kondisi awal

---

## 🔔 8. Notifikasi (semua role)

- **Bell icon** di kanan atas (badge merah = belum dibaca)
- Klik bell → panel riwayat notifikasi (match, PO, batch, cuaca)
- Klik item → tandai dibaca; "Tandai dibaca" → semua
- Notifikasi muncul otomatis saat: PO disepakati, batch siap, listing marketplace

---

## 📱 9. Mobile-Friendly

1. Buka di HP / devtools (F12 → toggle device, pilih iPhone 375px)
2. Cek: halaman tidak zoom-out, navbar rapi, role switcher jadi dropdown, tabel bisa di-scroll horizontal
3. **Peta rute** di modal — zoom & geser lancar

---

## 🔗 10. Alur Lengkap End-to-End (Demo Utama)

```
1. Petani input lahan (risiko cuaca muncul)
2. Pembeli buat demand → Smart Matching → match terbentuk
3. Petani "Ajukan Penawaran" ATAU Pembeli "Ajukan Kerja Sama"
4. Lawan klik Terima → Pre-Order (PO) CONFIRMED
5. Kedua belah pihak Chat / WhatsApp negosiasi
6. Pembeli "Konfirmasi Bayar" → upload bukti
7. Petani "Konfirmasi Terima Bayar" → PO COMPLETED + tercatat ledger
8. Petani buat batch → Kolektor jemput (rute + peta OSRM)
9. Keduanya beri Rating
10. Publik lihat transparansi + AI Q&A + export data
```

---

## ❓ Troubleshooting

| Masalah | Solusi |
|---|---|
| `ECONNREFUSED 5434` | Docker belum jalan → `docker compose up -d` |
| Login error / data kosong | Jalankan ulang seed: `npx tsx src/db/seed.ts` |
| Peta tidak muncul | Pastikan internet (tile OSM + OSRM); hard refresh Cmd+Shift+R |
| Port 3001 dipakai | `lsof -ti:3001 \| xargs kill -9` lalu `npm run dev` |
