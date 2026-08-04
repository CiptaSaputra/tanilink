"use client";

import { Card, CardContent, CardHeader } from "@/components/landing/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useId, useState } from "react";

const faqs = [
  {
    question: "Bagaimana cara mendaftarkan lahan saya?",
    answer:
      "Cukup input jenis komoditas, tanggal tanam, luas lahan, dan titik lokasi. Geolocation otomatis dari HP-mu, atau geser pin manual di peta. Setelah itu sistem langsung estimasi jadwal panen.",
  },
  {
    question: "Apakah saya harus menunggu panen dulu untuk mendapat pembeli?",
    answer:
      "Tidak. TaniLink justru dirancang agar pembeli mengunci stokmu sebelum panen selesai lewat Purchase Order (PO) pre-harvest. Kepastian pasar dari awal musim tanam.",
  },
  {
    question: "Bagaimana sistem mencocokkan saya dengan pembeli?",
    answer:
      "Smart Matching Engine menghitung skor kecocokan berdasarkan jarak, kesesuaian waktu panen, harga, dan reputasi transaksimu. Bersifat rekomendasi - PO baru terbentuk setelah kedua pihak setuju.",
  },
  {
    question: "Apakah ada biaya untuk bergabung?",
    answer:
      "MVP TaniLink tidak memerlukan payment gateway. Pembayaran hasil PO disepakati langsung antara petani dan pembeli di luar sistem, dengan kolom bukti pembayaran opsional di platform.",
  },
  {
    question: "Bagaimana cara kerja deteksi penyakit tanaman?",
    answer:
      "Foto tanamanmu lewat HP, AI langsung mendiagnosis kemungkinan penyakit atau hama dalam detik. Hasilnya otomatis mengoreksi estimasi volume panen di sistem - bukan sekadar informasi.",
  },
  {
    question: "Data cuaca dari mana dan seberapa akurat?",
    answer:
      "Sistem menarik data langsung dari API BMKG untuk wilayah lahan terdaftar. Estimasi tanggal panen dan indikator risiko cuaca diperbarui otomatis berdasarkan kondisi wilayahmu.",
  },
  {
    question: "Bagaimana kalau panen saya tidak menemukan pembeli lewat matching?",
    answer:
      "Ada jalur kedua: Marketplace Fallback. Batch panenmu otomatis tampil sebagai listing terbuka yang bisa dilihat semua pembeli di luar hasil matching - tidak ada hasil panen yang nyangkut tanpa pembeli.",
  },
  {
    question: "Bagaimana cara komunikasi dengan pembeli?",
    answer:
      "Setelah match atau PO terbentuk, petani dan pembeli langsung terhubung via WhatsApp Business API dari platform. Tidak perlu belajar kanal baru - cukup WhatsApp yang sudah kamu pakai sehari-hari.",
  },
  {
    question: "Bagaimana keamanan data transaksi saya?",
    answer:
      "Setiap PO yang selesai dicatat di histori penjualan berbasis hash-chain - setiap entri menyimpan hash dari entri sebelumnya. Tamper-evident tanpa perlu blockchain publik. Data tidak bisa dimanipulasi diam-diam.",
  },
  {
    question: "Bagaimana kalau lebih dari satu pembeli tertarik panen saya?",
    answer:
      "Sistem menentukan urutan layanan lewat Prioritas Distribusi - berdasarkan urutan PO masuk, kesesuaian volume, dan riwayat transaksi pembeli. Kamu terlindungi dari praktik tawar-menawar yang merugikan.",
  },
  {
    question: "Apakah ada notifikasi otomatis?",
    answer:
      "Ya, sistem mengirim push notifikasi WhatsApp untuk: rekomendasi match baru, PO masuk, perubahan status PO, dan peringatan cuaca yang berpotensi mengganggu jadwal panen.",
  },
  {
    question: "Apakah ada fitur untuk pembeli yang mengambil dari banyak petani sekaligus?",
    answer:
      "Ada. Route Optimization Engine menyarankan rute pengambilan terpendek menggunakan Google Maps Waypoints API saat pembeli pooling dari beberapa petani dalam satu hari - pendekatan TSP untuk efisiensi biaya angkut.",
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section id="faq" className="w-full bg-[#f0faf4] px-4 py-16 md:py-24">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mb-4 inline-flex rounded-full bg-green-500/10 p-3"
            aria-hidden="true"
          >
            <HelpCircle className="h-8 w-8 text-green-600" aria-hidden="true" />
          </motion.div>
          <span className="font-data text-xs tracking-[3px] uppercase text-green-500 font-semibold block mb-3">
            FAQ
          </span>
          <h2 className="font-instrument-serif mb-4 text-3xl font-bold sm:text-4xl md:text-5xl text-green-900">
            Pertanyaan yang Sering Ditanya
          </h2>
          <p className="text-sm text-green-700 sm:text-base md:text-lg">
            Semua yang perlu kamu tahu tentang TaniLink - dari cara kerja sistem hingga keamanan data transaksimu.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const questionId = `${baseId}-question-${index}`;
            const answerId = `${baseId}-answer-${index}`;
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "border-green-400 shadow-md" : "border-green-100"
                  }`}
                >
                  <CardHeader>
                    <motion.button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      whileHover={{ x: 4 }}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      id={questionId}
                    >
                      <span className="text-lg font-semibold text-green-900 pr-4">{faq.question}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        aria-hidden="true"
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="h-5 w-5 text-green-600" />
                      </motion.div>
                    </motion.button>
                  </CardHeader>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        role="region"
                        id={answerId}
                        aria-labelledby={questionId}
                      >
                        <CardContent className="pt-0">
                          <p className="text-green-700 leading-relaxed">{faq.answer}</p>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
