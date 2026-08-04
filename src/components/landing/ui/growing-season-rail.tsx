"use client";

import { motion } from "framer-motion";
import {
  Sprout, CloudSun, Microscope, Handshake, Truck, ShieldCheck,
} from "lucide-react";

const stages = [
  {
    key: "tanam",
    label: "Tanam",
    desc: "Input komoditas, tanggal tanam, dan titik lokasi lahan - geolocation otomatis dari HP. Sistem langsung estimasi jadwal panen dan sambungkan ke jaringan pembeli.",
    icon: Sprout,
    color: "#16a34a",
    bg: "#dcfce7",
  },
  {
    key: "cuaca",
    label: "Pantau Cuaca",
    desc: "Data BMKG wilayahmu diproses otomatis. Estimasi tanggal panen dan indikator risiko cuaca selalu diperbarui - kamu tahu kapan panen jauh sebelum pembeli bertanya.",
    icon: CloudSun,
    color: "#0891b2",
    bg: "#cffafe",
  },
  {
    key: "deteksi",
    label: "Deteksi Dini",
    desc: "Foto tanaman lewat HP, AI deteksi penyakit atau hama dalam detik. Hasil diagnosis langsung mengoreksi estimasi volume panen - bukan sekadar info, tapi aksi nyata.",
    icon: Microscope,
    color: "#d97706",
    bg: "#fef3c7",
  },
  {
    key: "cocok",
    label: "Tercocokkan",
    desc: "Smart Matching Engine mencocokkan panenmu dengan demand pembeli berdasarkan jarak, waktu panen, harga, dan reputasi. PO terbentuk setelah kedua pihak setuju - tanpa perantara.",
    icon: Handshake,
    color: "#7c3aed",
    bg: "#ede9fe",
  },
  {
    key: "kirim",
    label: "Dikirim",
    desc: "Bila pembeli mengambil dari beberapa petani sekaligus, sistem optimalkan rute pengambilan otomatis - panen sampai tepat waktu, biaya angkut lebih efisien.",
    icon: Truck,
    color: "#0d9488",
    bg: "#ccfbf1",
  },
  {
    key: "bayar",
    label: "Terbayar",
    desc: "Setiap PO yang selesai dicatat di histori penjualan berbasis hash-chain - transparan, tamper-evident, dan bisa diverifikasi kapan saja tanpa bisa dimanipulasi.",
    icon: ShieldCheck,
    color: "#2F6B3C",
    bg: "#dcfce7",
  },
];

export function GrowingSeasonRail() {
  return (
    <section
      id="musim-tanam"
      className="relative bg-[#f0faf4] py-24 md:py-32 px-5 md:px-12 lg:px-20"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="font-data text-xs tracking-[3px] uppercase text-green-500 font-semibold">
            Perjalanan Tanam Tanpa Perantara
          </span>
          <h2 className="font-instrument-serif font-bold text-green-900 text-3xl sm:text-4xl md:text-5xl mt-3 leading-tight tracking-tight">
            Menghubungkan langsung<br />petani ke pembeli.
          </h2>
        </motion.div>

        {/* ── Desktop Timeline (alternate) ── */}
        <div className="hidden md:block relative">
          {/* Center vertical line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-green-200" />

          <div className="space-y-0">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              const isLeft = i % 2 === 0;
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: isLeft ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                  className="relative grid grid-cols-2 gap-0 items-center"
                  style={{ minHeight: "120px" }}
                >
                  {/* Left side — konten jika isLeft, kosong jika isRight */}
                  <div className="pr-12 flex justify-end items-center" style={{ minHeight: "120px" }}>
                    {isLeft && (
                      <div className="text-right">
                        <h3 className="font-instrument-serif font-bold text-green-900 text-xl mb-1">
                          {stage.label}
                        </h3>
                        <p className="text-green-700 text-sm leading-relaxed max-w-xs ml-auto">
                          {stage.desc}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 z-10">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-md border-4 border-[#f0faf4]"
                      style={{ background: stage.color }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Right side — konten jika isRight, kosong jika isLeft */}
                  <div className="pl-12 flex items-center" style={{ minHeight: "120px" }}>
                    {!isLeft && (
                      <div>
                        <h3 className="font-instrument-serif font-bold text-green-900 text-xl mb-1">
                          {stage.label}
                        </h3>
                        <p className="text-green-700 text-sm leading-relaxed max-w-xs">
                          {stage.desc}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Mobile Timeline (left-aligned) ── */}
        <div className="md:hidden relative">
          {/* Left vertical line */}
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-green-200" />

          <div className="space-y-0">
            {stages.map((stage, i) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5%" }}
                  transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex gap-6 pb-8"
                >
                  {/* Dot */}
                  <div className="relative z-10 shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shadow-md border-4 border-[#f0faf4]"
                      style={{ background: stage.color }}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <h3 className="font-instrument-serif font-bold text-green-900 text-lg mb-1">
                      {stage.label}
                    </h3>
                    <p className="text-green-700 text-sm leading-relaxed">
                      {stage.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
