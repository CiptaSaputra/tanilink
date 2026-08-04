"use client";

import FaqSection, { FaqData } from "@/components/landing/ui/habit-faq-scroller";

const faqData: FaqData = {
  mainTitle: "Pertanyaan yang Sering Ditanya",
  mainSubtitle:
    "Semua yang perlu kamu tahu tentang TaniLink - dari cara kerja sistem hingga keamanan data transaksimu.",
  rows: [
    {
      id: "row1",
      speed: "25s",
      direction: "left",
      faqItems: [
        {
          id: "q1",
          question: "Bagaimana cara mendaftarkan lahan saya?",
          answer:
            "Cukup input jenis komoditas, tanggal tanam, luas lahan, dan titik lokasi. Geolocation otomatis dari HP-mu, atau geser pin manual di peta. Setelah itu sistem langsung estimasi jadwal panen.",
        },
        {
          id: "q2",
          question: "Apakah saya harus menunggu panen dulu untuk mendapat pembeli?",
          answer:
            "Tidak. TaniLink justru dirancang agar pembeli mengunci stokmu sebelum panen selesai lewat Purchase Order (PO) pre-harvest. Kepastian pasar dari awal musim tanam.",
        },
        {
          id: "q3",
          question: "Bagaimana sistem mencocokkan saya dengan pembeli?",
          answer:
            "Smart Matching Engine menghitung skor kecocokan berdasarkan jarak, kesesuaian waktu panen, harga, dan reputasi transaksimu. Bersifat rekomendasi - PO baru terbentuk setelah kedua pihak setuju.",
        },
        {
          id: "q4",
          question: "Apakah ada biaya untuk bergabung?",
          answer:
            "MVP TaniLink tidak memerlukan payment gateway. Pembayaran hasil PO disepakati langsung antara petani dan pembeli di luar sistem, dengan kolom bukti pembayaran opsional di platform.",
        },
      ],
    },
    {
      id: "row2",
      speed: "20s",
      direction: "right",
      faqItems: [
        {
          id: "q5",
          question: "Bagaimana cara kerja deteksi penyakit tanaman?",
          answer:
            "Foto tanamanmu lewat HP, AI langsung mendiagnosis kemungkinan penyakit atau hama dalam detik. Hasilnya otomatis mengoreksi estimasi volume panen di sistem - bukan sekadar informasi.",
        },
        {
          id: "q6",
          question: "Data cuaca dari mana dan seberapa akurat?",
          answer:
            "Sistem menarik data langsung dari API BMKG untuk wilayah lahan terdaftar. Estimasi tanggal panen dan indikator risiko cuaca diperbarui otomatis berdasarkan kondisi wilayahmu.",
        },
        {
          id: "q7",
          question: "Bagaimana kalau panen saya tidak menemukan pembeli lewat matching?",
          answer:
            "Ada jalur kedua: Marketplace Fallback. Batch panenmu otomatis tampil sebagai listing terbuka yang bisa dilihat semua pembeli di luar hasil matching - tidak ada hasil panen yang nyangkut tanpa pembeli.",
        },
        {
          id: "q8",
          question: "Bagaimana cara komunikasi dengan pembeli?",
          answer:
            "Setelah match atau PO terbentuk, petani dan pembeli langsung terhubung via WhatsApp Business API dari platform. Tidak perlu belajar kanal baru - cukup WhatsApp yang sudah kamu pakai sehari-hari.",
        },
      ],
    },
    {
      id: "row3",
      speed: "30s",
      direction: "left",
      faqItems: [
        {
          id: "q9",
          question: "Bagaimana keamanan data transaksi saya?",
          answer:
            "Setiap PO yang selesai dicatat di histori penjualan berbasis hash-chain - setiap entri menyimpan hash dari entri sebelumnya. Tamper-evident tanpa perlu blockchain publik. Data tidak bisa dimanipulasi diam-diam.",
        },
        {
          id: "q10",
          question: "Bagaimana kalau lebih dari satu pembeli tertarik panen saya?",
          answer:
            "Sistem menentukan urutan layanan lewat Prioritas Distribusi - berdasarkan urutan PO masuk, kesesuaian volume, dan riwayat transaksi pembeli. Kamu terlindungi dari praktik tawar-menawar yang merugikan.",
        },
        {
          id: "q11",
          question: "Apakah ada notifikasi otomatis?",
          answer:
            "Ya, sistem mengirim push notifikasi WhatsApp untuk: rekomendasi match baru, PO masuk, perubahan status PO, dan peringatan cuaca yang berpotensi mengganggu jadwal panen.",
        },
        {
          id: "q12",
          question: "Apakah ada fitur untuk pembeli yang mengambil dari banyak petani sekaligus?",
          answer:
            "Ada. Route Optimization Engine menyarankan rute pengambilan terpendek menggunakan Google Maps Waypoints API saat pembeli pooling dari beberapa petani dalam satu hari - pendekatan TSP untuk efisiensi biaya angkut.",
        },
      ],
    },
  ],
};

export default function TaniLinkFaq() {
  return (
    <section id="faq" className="w-full bg-[#f0faf4] py-24 px-4 flex justify-center">
      <FaqSection data={faqData} />
    </section>
  );
}
