# TaniLink — Platform Prediksi Panen, Pre-Order, dan Optimasi Distribusi Hasil Pertanian

*Tema: Smart Agroindustry and Logistic System*

---

## 1. Permasalahan yang Diangkat

Berdasarkan Kajian Food Loss and Waste (FLW) Indonesia yang disusun oleh Kementerian PPN/Bappenas bersama Waste4Change dan World Resources Institute (WRI) Indonesia, dengan dukungan UK Foreign, Commonwealth and Development Office (2021), ditemukan beberapa fakta penting:

- Total food loss and waste Indonesia selama periode 2000–2019 mencapai **23–48 juta ton sampah makanan per tahun**, setara **115–184 kg/kapita/tahun**.
- Kerugian ekonomi yang ditimbulkan diperkirakan mencapai **Rp213–551 triliun per tahun**, atau setara **4–5% Produk Domestik Bruto (PDB)** Indonesia.
- Yang menarik, kehilangan pangan (food loss) ternyata paling banyak terjadi di **hulu rantai pasok**, bukan di konsumen rumah tangga seperti yang sering dibahas. Tahap produksi menyumbang 7–12,3 juta ton/tahun, dan tahap pascapanen/penyimpanan menyumbang 6,1–9,9 juta ton/tahun.

*Sumber: Bappenas, Waste4Change, & WRI Indonesia (2021), Kajian Food Loss and Waste di Indonesia, didukung UK Foreign, Commonwealth and Development Office.*

Dari data ini bisa disimpulkan bahwa akar masalahnya bukan sekadar makanan yang terbuang di rumah tangga, melainkan persoalan **koordinasi, informasi, dan logistik** yang terjadi jauh sebelum makanan sampai ke tangan konsumen. Berikut penyebab-penyebab utamanya:

1. **Petani menanam tanpa kepastian pembeli.** Karena belum ada kejelasan siapa yang akan membeli hasil panennya, petani sering menanam komoditas yang ternyata tidak sesuai dengan kebutuhan pasar saat panen tiba.
2. **Ketergantungan pada tengkulak.** Minimnya akses informasi harga pasar membuat petani terpaksa menjual dengan harga rendah, atau bahkan membiarkan hasil panen membusuk karena tidak ada pembeli yang siap menampung tepat waktu.
3. **Panen serentak tanpa koordinasi distribusi.** Ketika banyak petani panen dalam waktu berdekatan, tidak ada mekanisme yang menentukan hasil panen mana yang harus dikirim lebih dulu berdasarkan risiko kerusakannya.
4. **Pengiriman yang tidak efisien.** Proses pengambilan hasil panen dari banyak titik lahan yang tersebar ke gudang atau pembeli masih dilakukan tanpa perencanaan rute yang baik, sehingga waktu tempuh menjadi lama dan komoditas rusak selama perjalanan.
5. **Belum ada data prediktif yang bisa diandalkan.** Baik petani maupun pembeli sulit memperkirakan kapan panen akan tiba, berapa volumenya, dan berapa harga yang wajar beberapa minggu ke depan.

---

## 2. Solusi Teknologi yang Ditawarkan (Web)

### Konsep Inti

**TaniLink** adalah platform berbasis web yang mempertemukan petani dan pembeli **sejak tahap rencana tanam**, bukan menunggu sampai panen selesai seperti kebanyakan platform yang ada sekarang. Ide dasarnya sederhana: kalau petani dan pembeli sudah saling terhubung sejak awal, ketidakcocokan antara apa yang ditanam dan apa yang dibutuhkan pasar bisa dicegah lebih dini, sebelum hasil panen terlanjur rusak atau tidak laku.

Sistem ini menggabungkan empat hal dalam satu alur yang saling terhubung: prediksi panen, prediksi harga/permintaan, sistem pre-order otomatis, dan optimasi pengiriman.

### Alur Sistem

```
Petani Input Data Tanam
        │
        ▼
Harvest Forecasting (prediksi waktu & volume panen)
        │
        ▼
Price & Demand Prediction (prediksi harga & permintaan pasar)
        │
        ▼
Smart Matching & Pre-Order (petani ↔ pembeli)
        │
        ▼
Distribution Priority (urutan kirim berdasarkan risiko rusak)
        │
        ▼
Route Optimization (rute pengambilan & pengiriman)
        │
        ▼
Pengiriman ke Pembeli
```

Alur ini dirancang berurutan supaya setiap tahap punya tujuan yang jelas: mulai dari memperkirakan kapan dan berapa banyak hasil panen akan tersedia, sampai memastikan hasil panen itu sampai ke pembeli secepat dan seefisien mungkin.

### Fitur Utama

**1) Harvest Forecasting (Prediksi Panen)**

Petani memasukkan data dasar tanamnya: jenis komoditas, tanggal tanam, luas lahan, dan titik koordinat lokasi. Dari data ini, sistem melakukan agregasi (penggabungan data) per wilayah untuk memperkirakan kapan panen akan tiba dan berapa perkiraan volumenya. Hasilnya bisa dipakai petani untuk merencanakan penjualan, dan bisa dipakai pembeli untuk memperkirakan pasokan yang akan tersedia.

**2) Price & Demand Prediction (Prediksi Harga & Permintaan)**

Modul ini menganalisis data harga historis dan data permintaan pasar, dipadukan dengan data cuaca (curah hujan dan suhu) sebagai variabel tambahan, menggunakan pendekatan statistik sederhana seperti regresi linear atau exponential smoothing. Hasilnya berupa prediksi harga untuk 1–4 minggu ke depan serta rekomendasi waktu jual terbaik, ditampilkan dalam bentuk grafik menggunakan Chart.js agar mudah dibaca.

**3) Smart Matching & Pre-Order (Pencocokan Otomatis)**

Pembeli atau koperasi mempublikasikan kebutuhan mereka: jenis komoditas, volume, harga penawaran, dan lokasi. Sistem kemudian mencocokkan kebutuhan ini secara otomatis dengan petani yang diperkirakan akan panen, menggunakan skor gabungan dari tiga faktor:

```
Score = w1·Kedekatan Lokasi (Haversine) + w2·Kesesuaian Volume + w3·Kesesuaian Harga
```

Bobot w1, w2, dan w3 bisa diatur oleh admin sesuai kebutuhan (misalnya jarak lebih diprioritaskan daripada harga, atau sebaliknya). Ketika skor kecocokan cukup tinggi, sistem mengirim notifikasi ke kedua pihak, dan mereka bisa langsung menyepakati **pre-order sebelum panen benar-benar selesai**.

**4) Distribution Priority (Prioritas Distribusi)**

Setelah panen tiba, sistem menentukan urutan pengiriman berdasarkan tiga hal: umur simpan komoditas (misalnya sayuran lebih cepat rusak dibanding umbi-umbian), prediksi cuaca, dan jadwal panen. Dengan begitu, hasil panen yang paling berisiko rusak akan diprioritaskan untuk dikirim lebih dulu.

**5) Route Optimization (Optimasi Rute)**

Titik-titik panen yang siap diangkut dikelompokkan secara geografis menggunakan metode clustering sederhana (k-means), lalu urutan penjemputannya ditentukan dengan heuristik nearest-neighbor (mengunjungi lokasi terdekat berikutnya secara berurutan). Hasilnya ditampilkan di peta interaktif menggunakan Leaflet.js, lengkap dengan estimasi waktu tempuh dan kemungkinan menggabungkan beberapa titik panen dalam satu perjalanan pengiriman.

### Peran Pengguna (Multi-Role & Auth)

| Peran | Akses |
|---|---|
| Petani | Input data lahan/tanam, melihat prediksi harga, konfirmasi pre-order, unggah data hasil panen |
| Pembeli/Koperasi | Input kebutuhan (demand), melihat peta sebaran prediksi panen, melacak status distribusi |
| Dinas Pertanian | Memantau data agregat regional & tren harga (akses read-only) |
| Admin | Validasi data master, mengatur bobot matching, menyelesaikan dispute |

Untuk keamanan, sistem menggunakan autentikasi berbasis token JWT yang dipadukan dengan Role-Based Access Control (RBAC), artinya setiap peran hanya bisa mengakses fitur dan data yang memang menjadi wewenangnya di level endpoint API.

---

## 3. Teknologi yang Sudah Ada

Sebelum membangun TaniLink, penting untuk memetakan platform sejenis yang sudah lebih dulu ada di Indonesia, supaya jelas di mana posisi dan kebaruan dari ide ini:

- **TaniHub** — marketplace direct-to-consumer/bisnis dengan sistem logistik dan cold chain milik sendiri.
- **Sayurbox** — marketplace hasil tani segar dengan sistem pengiriman sendiri, berfokus melayani konsumen akhir.
- **Eragano** — layanan hulu-hilir dalam satu aplikasi, mulai dari akses modal hingga penjualan hasil panen.
- **Crowde** — berfokus pada akses permodalan bagi petani kecil lewat skema crowdfunding.

Keempatnya sama-sama berupaya memutus rantai distribusi panjang yang selama ini banyak melibatkan tengkulak, dan masing-masing punya kekuatan di bidangnya sendiri.

### Perbandingan Fitur

Supaya lebih mudah dilihat posisi TaniLink dibanding platform-platform yang sudah ada, berikut perbandingannya per fitur:

| Fitur | TaniHub | Sayurbox | Eragano | Crowde | TaniLink |
|---|:---:|:---:|:---:|:---:|:---:|
| Terhubung sejak tahap rencana tanam (bukan hanya pasca-panen) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Sistem pre-order sebelum panen selesai | ❌ | ❌ | ❌ | ❌ | ✅ |
| Pencocokan petani–pembeli otomatis & multi-faktor (jarak, volume, harga) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Prediksi harga & permintaan sebagai fitur mandiri | ❌ | ❌ | ❌ | ❌ | ✅ |
| Optimasi rute logistik yang bisa diakses/dilihat pengguna | ❌ | ❌ | ❌ | ❌ | ✅ |
| Prioritas distribusi berdasarkan risiko kerusakan komoditas | ❌ | ❌ | ❌ | ❌ | ✅ |
| Dashboard khusus untuk instansi pemerintah (Dinas Pertanian) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Logistik/cold chain milik sendiri | ✅ | ✅ | ❌ | ❌ | ❌ |
| Layanan hulu-hilir dalam satu aplikasi (modal s.d. penjualan) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Akses permodalan/crowdfunding untuk petani | ❌ | ❌ | ❌ | ✅ | ❌ |

Dari tabel ini terlihat bahwa TaniHub, Sayurbox, Eragano, dan Crowde masing-masing sudah kuat di bidangnya sendiri — TaniHub dan Sayurbox unggul di logistik pengiriman langsung ke konsumen, Eragano unggul di layanan hulu-hilir yang lengkap, dan Crowde unggul di akses permodalan. Namun, tidak satu pun dari keempatnya menjawab persoalan yang justru menjadi akar food loss, yaitu ketidakcocokan informasi **sejak tahap rencana tanam**. TaniLink dirancang untuk mengisi celah tersebut, sehingga sifatnya melengkapi ekosistem agritech yang sudah ada, bukan sekadar menjadi pesaing baru dengan fitur yang sama.

---

## 4. Gap Teknologi yang Sudah Ada dengan Solusi yang Digagas

| Aspek | Teknologi yang Sudah Ada | TaniLink |
|---|---|---|
| Titik masuk sistem | Baru berperan **setelah hasil panen tersedia** | Sudah bekerja **sejak rencana tanam**, sehingga ketidakcocokan pasokan-permintaan bisa diantisipasi sebelum komoditas membusuk |
| Kepastian pembeli | Petani tetap menanam tanpa jaminan pembeli di awal | Pre-order terbentuk dari hasil matching sebelum panen selesai, sehingga petani sudah punya kepastian jual lebih awal |
| Pencocokan pasokan-permintaan | Umumnya masih mengandalkan pencarian manual oleh pengguna di marketplace | Pencocokan berjalan otomatis dan multi-faktor (jarak, volume, harga), dengan bobot yang bisa dikonfigurasi |
| Prediksi harga & permintaan | Belum tersedia secara eksplisit sebagai fitur mandiri | Tersedia sebagai modul inti berbasis data historis dan cuaca, membantu petani menentukan waktu jual yang paling tepat |
| Optimasi logistik | Logistik dikelola sebagai layanan internal milik platform, bukan sebagai fitur optimasi rute yang bisa diakses atau dianalisis pengguna | Route Optimization ditampilkan secara eksplisit: pengelompokan titik panen dan penentuan urutan rute penjemputan berdasarkan lokasi riil |
| Prioritas distribusi berdasarkan risiko kerusakan | Belum ada mekanisme khusus untuk mengurutkan pengiriman berdasarkan risiko rusak | Distribution Priority menentukan urutan kirim berdasarkan umur simpan komoditas dan prediksi cuaca |
| Dukungan untuk instansi pemerintah | Tidak menyediakan akses data agregat untuk Dinas Pertanian | Tersedia dashboard read-only untuk Dinas Pertanian sebagai alat bantu kebijakan ketahanan pangan di tingkat wilayah |

**Kelebihan utama TaniLink** dibanding solusi yang sudah ada terletak pada tiga hal. Pertama, intervensinya terjadi lebih awal, yaitu sejak tahap rencana tanam, bukan menunggu pasca-panen, sehingga food loss bisa **dicegah**, bukan sekadar ditangani setelah terjadi. Kedua, seluruh alur dari prediksi sampai distribusi saling terhubung dalam satu sistem yang runtut, bukan sekumpulan fitur yang berdiri sendiri-sendiri. Ketiga, TaniLink secara eksplisit berfokus pada optimasi logistik (prioritas distribusi dan optimasi rute), yang memang relevan langsung dengan subtema *Smart Agroindustry and Logistic System* — bukan sekadar berperan sebagai marketplace jual-beli seperti kebanyakan platform yang sudah ada.

---

## 5. Hubungan Sub Sistem dengan Masalah yang Diselesaikan

| Sub Sistem | Penjelasan Singkat | Masalah yang Diselesaikan |
|---|---|---|
| **Harvest Forecasting** | Modul yang mengolah data tanam petani (komoditas, tanggal tanam, luas lahan, lokasi) untuk memperkirakan kapan panen tiba dan berapa perkiraan volumenya, diagregasi per wilayah. | Menyelesaikan masalah ketidakpastian waktu dan volume panen, sehingga pembeli bisa merencanakan kebutuhan lebih awal dan petani tidak lagi menanam atau memanen tanpa mempertimbangkan kondisi pasar. |
| **Price & Demand Prediction** | Modul yang menganalisis data harga historis, permintaan pasar, dan cuaca untuk memproyeksikan harga 1–4 minggu ke depan serta merekomendasikan waktu jual terbaik. | Menyelesaikan masalah ketergantungan petani pada tengkulak akibat minimnya akses informasi harga, dengan menyediakan prediksi harga dan rekomendasi waktu jual yang transparan bagi semua pihak. |
| **Smart Matching & Pre-Order** | Modul yang mencocokkan otomatis kebutuhan pembeli dengan petani yang diperkirakan akan panen, berdasarkan skor gabungan jarak, volume, dan harga, lalu memicu kesepakatan pre-order sebelum panen selesai. | Menyelesaikan masalah ketidakcocokan informasi antara pasokan dan permintaan, sehingga petani mendapat kepastian pembeli lebih awal dan hasil panen tidak membusuk karena tidak ada yang menampung. |
| **Distribution Priority** | Modul yang mengurutkan prioritas pengiriman hasil panen berdasarkan umur simpan komoditas, prediksi cuaca, dan jadwal panen, sehingga komoditas yang paling rentan rusak ditangani lebih dulu. | Menyelesaikan masalah panen serentak yang tidak terkoordinasi, dengan memastikan komoditas paling berisiko rusak diprioritaskan untuk dikirim lebih dulu. |
| **Route Optimization** | Modul yang mengelompokkan titik-titik panen secara geografis (clustering) dan menentukan urutan rute penjemputan/pengiriman paling efisien, ditampilkan pada peta interaktif. | Menyelesaikan masalah pengiriman yang tidak efisien dari banyak titik lahan yang tersebar, dengan mengelompokkan lokasi panen dan menentukan rute yang lebih singkat serta hemat biaya. |
| **Dashboard Dinas Pertanian** | Modul read-only yang menyajikan data agregat regional berupa tren harga, sebaran komoditas, dan potensi surplus/defisit wilayah, khusus untuk kebutuhan pemangku kebijakan. | Menyelesaikan masalah minimnya data agregat wilayah bagi pemangku kebijakan, sehingga potensi surplus/defisit komoditas antarwilayah bisa diantisipasi lebih awal. |

---

## 6. Peran Kelembagaan dalam Pengelolaan Data (BPP, Gapoktan, Penyuluh)

Salah satu tantangan nyata di lapangan adalah tidak semua petani terbiasa atau mampu mengoperasikan sistem digital secara mandiri. Untuk mengatasi hal ini, TaniLink dirancang dengan mekanisme **input berlapis**, mengikuti pola yang sudah terbukti berjalan di sistem pemerintah seperti SIMLUHTAN dan e-RDKK, di mana data petani banyak diinput oleh Penyuluh Pertanian Lapangan (PPL), bukan oleh petani itu sendiri.

| Lapisan | Siapa yang Input | Kapan Dipakai |
|---|---|---|
| Input mandiri | Petani sendiri | Petani yang sudah terbiasa menggunakan HP/aplikasi |
| Input dibantu keluarga | Anak atau anggota keluarga petani | Petani belum terbiasa digital, tapi ada keluarga yang bisa membantu |
| Input oleh Gapoktan/Poktan | Pengurus kelompok tani | Petani aktif di kelompok tani, cocok untuk input data secara kolektif |
| Input oleh PPL/BPP | Penyuluh Pertanian Lapangan | Sebagai opsi terakhir, mengikuti pola yang sudah berjalan di SIMLUHTAN/e-RDKK |

Prinsip pentingnya: **siapa pun yang menginput data tidak memengaruhi bagaimana data itu diproses atau ditampilkan** di sistem. Data yang sama akan menghasilkan hasil forecasting, matching, dan tampilan dashboard yang sama, tidak peduli apakah diinput oleh petani sendiri, keluarganya, Gapoktan, atau PPL. Perbedaan hanya terjadi di sisi antarmuka input (misalnya PPL punya tampilan batch entry untuk banyak petani sekaligus) dan di metadata internal berupa keterangan siapa yang menginput, yang disimpan untuk keperluan audit dan tidak ditampilkan ke pembeli maupun Dinas Pertanian.

---

*Catatan: Fitur lanjutan seperti Quality Grading berbasis computer vision (TensorFlow.js), Blockchain/Hash-Chain Traceability, dan Disease Detection dapat dicantumkan sebagai roadmap pengembangan berikutnya, bukan sebagai fitur inti MVP, agar scope sistem tetap realistis untuk dikerjakan dalam batas waktu lomba atau praktikum.*
