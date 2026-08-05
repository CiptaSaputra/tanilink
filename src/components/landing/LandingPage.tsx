"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { TanilinkHero } from "@/components/landing/ui/tanilink-hero";
import { GrowingSeasonRail } from "@/components/landing/ui/growing-season-rail";
import { ContainerScroll } from "@/components/landing/ui/container-scroll-animation";
import {
  ContainerScroll as CardStackContainer,
  CardSticky,
} from "@/components/landing/ui/cards-stack";
import { FAQAccordion } from "@/components/landing/ui/faq-accordion";
import { ArrowRight, Sprout, Leaf, CheckCircle2 } from "lucide-react";

const DashboardMap = dynamic(
  () => import("@/components/landing/ui/dashboard-map"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center bg-[#e8f0e9] text-[#2F6B3C] animate-pulse rounded-lg text-sm">
        Memuat Peta Distribusi...
      </div>
    ),
  }
);

/* ── Fade-in wrapper ── */
function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Footer Nav with sliding cursor ── */
const footerLinks = [
  { label: "Untuk Petani", href: "#daftar-petani" },
  { label: "Untuk Pembeli", href: "#daftar-pembeli" },
  { label: "Musim Tanam", href: "#musim-tanam" },
  { label: "Dashboard", href: "#fitur" },
  { label: "Kontak", href: "#kontak" },
];

function FooterNav() {
  const [position, setPosition] = React.useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className="relative flex flex-wrap gap-1 w-fit rounded-full border border-green-700 bg-green-800/40 p-1"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      {footerLinks.map((link) => (
        <FooterTab key={link.label} href={link.href} setPosition={setPosition}>
          {link.label}
        </FooterTab>
      ))}
      <motion.li
        animate={position}
        className="absolute z-0 h-8 rounded-full bg-green-600/60"
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      />
    </ul>
  );
}

function FooterTab({
  children,
  href,
  setPosition,
}: {
  children: React.ReactNode;
  href: string;
  setPosition: (p: { left: number; width: number; opacity: number }) => void;
}) {
  const ref = React.useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className="relative z-10"
    >
      <a
        href={href}
        className="block cursor-pointer px-4 py-1.5 text-xs text-green-200 hover:text-white transition-colors whitespace-nowrap"
      >
        {children}
      </a>
    </li>
  );
}

export default function LandingPage() {
  return (
    <main className="bg-[#f0faf4] min-h-screen text-green-950 font-sans selection:bg-green-200">

      {/* ── 1. HERO VIDEO SCROLL-SCRUB ── */}
      <TanilinkHero />

      {/* ── 2. GROWING SEASON RAIL ── */}
      <GrowingSeasonRail />

      {/* ── 3. MASALAH YANG DISELESAIKAN ── */}
      <section className="bg-[#f0faf4]" id="masalah">
        <div className="max-w-7xl mx-auto px-5 md:px-12 lg:px-20 grid md:grid-cols-2 md:gap-12 lg:gap-20">
          {/* Sticky left heading */}
          <div className="md:sticky md:top-0 md:h-screen flex flex-col justify-center py-20">
            <FadeIn>
              <span className="text-xs tracking-[3px] uppercase text-green-500 font-semibold">
                Masalah yang Diselesaikan
              </span>
              <h2 className="font-instrument-serif text-green-900 text-3xl sm:text-4xl md:text-5xl mt-3 leading-tight tracking-tight max-w-xl font-bold">
                Rantai pasok agro
                <br />
                yang tidak adil -
                <br />
                berakhir.
              </h2>
              <p className="mt-5 text-green-700 text-sm leading-relaxed max-w-sm">
                TaniLink membalik tiga masalah terbesar petani mikro Indonesia -
                satu per satu, permanen.
              </p>
            </FadeIn>
          </div>

          {/* Cards stack */}
          <CardStackContainer className="min-h-[250vh] space-y-6 py-20">
            {[
              {
                no: "01",
                before: "Harga ditentukan tengkulak di hari panen.",
                after: "Harga disepakati sebelum tanam selesai.",
                tag: "Harga Adil",
                color: "#16a34a",
              },
              {
                no: "02",
                before:
                  "Penyakit tanaman baru ketahuan saat sudah menyebar luas.",
                after: "Deteksi dini dari foto daun, tangani sejak dini.",
                tag: "Teknologi AI",
                color: "#0891b2",
              },
              {
                no: "03",
                before:
                  "Catatan transaksi mudah dimanipulasi, sengketa sulit diselesaikan.",
                after:
                  "Setiap transaksi terkunci di hash-chain - transparan dan dapat diaudit.",
                tag: "Transparansi",
                color: "#7c3aed",
              },
            ].map((item, i) => (
              <CardSticky
                key={i}
                index={i + 2}
                incrementY={24}
                incrementZ={8}
                className="rounded-3xl border border-green-100 shadow-lg bg-white overflow-hidden"
              >
                <div className="p-7 md:p-9">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className="text-xs tracking-[3px] uppercase font-semibold px-3 py-1 rounded-full"
                      style={{
                        color: item.color,
                        background: `${item.color}18`,
                      }}
                    >
                      {item.tag}
                    </span>
                    <span
                      className="font-instrument-serif text-4xl font-bold"
                      style={{ color: `${item.color}30` }}
                    >
                      {item.no}
                    </span>
                  </div>
                  {/* Before / After */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl p-5 bg-red-50 border border-red-100">
                      <span className="font-data text-[10px] text-red-400 uppercase tracking-widest block mb-2">
                        Dulu
                      </span>
                      <p className="text-green-800 text-sm leading-relaxed">
                        {item.before}
                      </p>
                    </div>
                    <div
                      className="rounded-2xl p-5 border-2"
                      style={{
                        background: `${item.color}0d`,
                        borderColor: `${item.color}30`,
                      }}
                    >
                      <span
                        className="font-data text-[10px] uppercase tracking-widest block mb-2"
                        style={{ color: item.color }}
                      >
                        Sekarang
                      </span>
                      <p
                        className="font-semibold text-sm leading-relaxed"
                        style={{ color: item.color }}
                      >
                        {item.after}
                      </p>
                    </div>
                  </div>
                </div>
              </CardSticky>
            ))}
          </CardStackContainer>
        </div>
      </section>

      {/* ── 4. DASHBOARD PREVIEW ── */}
      <section
        className="bg-white border-y border-green-100 overflow-hidden"
        id="fitur"
      >
        <ContainerScroll
          titleComponent={
            <div className="text-center">
              <span className="text-xs tracking-[3px] uppercase text-green-500 font-semibold">
                Dashboard
              </span>
              <h2 className="font-instrument-serif text-green-900 text-3xl sm:text-4xl md:text-5xl mt-3 leading-tight tracking-tight font-bold">
                Pantau rantai pasok
                <br />
                dalam satu layar.
              </h2>
            </div>
          }
        >
          <div className="w-full h-full bg-green-950 rounded-2xl p-3 md:p-6 flex flex-col">
            {/* Window chrome */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400/70" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-400/70" />
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-400/70" />
              <span className="ml-2 font-data text-[10px] md:text-xs text-green-300/40">
                TaniLink Dashboard
              </span>
            </div>
            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-3">
              {[
                {
                  icon: <Sprout className="w-3 h-3 md:w-4 md:h-4" />,
                  label: "Total Produksi",
                  val: "12,450 kg",
                  sub: "+14% bulan lalu",
                  color: "#4ade80",
                },
                {
                  icon: <Leaf className="w-3 h-3 md:w-4 md:h-4" />,
                  label: "Pembeli Aktif",
                  val: "87",
                  sub: "PO terkunci",
                  color: "#2dd4bf",
                },
                {
                  icon: <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />,
                  label: "Transaksi Verified",
                  val: "1,204",
                  sub: "Hash-chain",
                  color: "#E3A73A",
                  colSpanMobile: true,
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className={`bg-green-900/40 rounded-xl p-2.5 md:p-5 border border-green-800/40 ${card.colSpanMobile ? "col-span-2 md:col-span-1" : ""}`}
                >
                  <div style={{ color: card.color }} className="mb-1.5">
                    {card.icon}
                  </div>
                  <div className="font-data text-[9px] md:text-xs text-green-300/50 mb-0.5">
                    {card.label}
                  </div>
                  <div className="font-instrument-serif font-bold text-white text-base md:text-2xl leading-none">
                    {card.val}
                  </div>
                  <div
                    className="font-data text-[9px] md:text-[11px] mt-1"
                    style={{ color: card.color }}
                  >
                    {card.sub}
                  </div>
                </div>
              ))}
            </div>
            {/* Map */}
            <div
              className="flex-1 bg-green-900/30 rounded-xl border border-green-800/30 overflow-hidden landing-map"
              style={{ minHeight: 200 }}
            >
              <DashboardMap />
            </div>
            <div className="mt-2 flex items-center gap-2 px-1">
              <span className="font-data text-[9px] md:text-[10px] text-teal-400">
                Transaksi terakhir:
              </span>
              <span className="font-data text-[9px] md:text-[10px] text-yellow-400/70 tracking-wide">
                a3f9...c21e
              </span>
              <div className="h-3 w-px bg-green-700/50" />
              <span className="font-data text-[9px] md:text-[10px] text-green-500/40">
                verified on-chain
              </span>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* ── 5. FAQ ── */}
      <FAQAccordion />

      {/* ── 6. CTA GANDA SPLIT PANEL ── */}
      <section
        className="py-20 md:py-28 px-5 md:px-12 lg:px-20 bg-[#f0faf4]"
        id="daftar"
      >
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-14">
            <span className="text-xs tracking-[3px] uppercase text-green-500 font-semibold">
              Untuk Siapa?
            </span>
            <h2 className="font-instrument-serif text-green-900 text-3xl sm:text-4xl md:text-5xl mt-3 leading-tight tracking-tight font-bold">
              TaniLink bekerja untuk
              <br />
              dua pihak sekaligus.
            </h2>
          </FadeIn>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* ── Card Petani ── */}
          <div id="daftar-petani">
            <FadeIn delay={0.05}>
              <div
                className="relative rounded-3xl overflow-hidden min-h-[480px] flex flex-col justify-end shadow-2xl group"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=900&q=80&fit=crop')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/85 transition-all duration-500" />
                <div className="absolute top-6 left-6">
                  <span className="font-data text-[11px] tracking-[3px] uppercase px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white">
                    Untuk Petani
                  </span>
                </div>
                <div className="relative z-10 p-7 md:p-9 flex flex-col gap-5">
                  <h3 className="font-instrument-serif text-white text-2xl md:text-3xl lg:text-4xl leading-tight font-bold">
                    Tanam dengan pembeli
                    <br />
                    yang sudah siap menunggu.
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["Gratis selamanya", "5 menit dari HP", "Didukung PPL"].map(
                      (item) => (
                        <span
                          key={item}
                          className="text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                  {/* CTA → /register?role=petani */}
                  <a
                    href="/register"
                    className="flex items-center gap-2 bg-white hover:bg-green-50 text-green-900 font-semibold px-6 py-3 rounded-full text-sm w-fit transition shadow-lg group/btn"
                  >
                    Daftar sebagai Petani
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ── Card Pembeli ── */}
          <div id="daftar-pembeli">
            <FadeIn delay={0.12}>
              <div
                className="relative rounded-3xl overflow-hidden min-h-[480px] flex flex-col justify-end shadow-2xl group"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&q=80&fit=crop')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d3d3a]/90 via-[#0d3d3a]/30 to-black/10 group-hover:from-[#0d3d3a]/95 transition-all duration-500" />
                <div className="absolute top-6 left-6">
                  <span className="font-data text-[11px] tracking-[3px] uppercase px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-white">
                    Untuk Pembeli
                  </span>
                </div>
                <div className="relative z-10 p-7 md:p-9 flex flex-col gap-5">
                  <h3 className="font-instrument-serif text-white text-2xl md:text-3xl lg:text-4xl leading-tight font-bold">
                    Amankan pasokan sebelum
                    <br />
                    musim panen dimulai.
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "1.000+ petani verified",
                      "Pre-harvest PO",
                      "Lacak real-time",
                    ].map((item) => (
                      <span
                        key={item}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  {/* CTA → /register */}
                  <a
                    href="/register"
                    className="flex items-center gap-2 bg-white hover:bg-teal-50 text-teal-900 font-semibold px-6 py-3 rounded-full text-sm w-fit transition shadow-lg group/btn"
                  >
                    Daftar sebagai Pembeli
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </a>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── 7. FOOTER ── */}
      <footer className="relative bg-green-900 overflow-hidden" id="kontak">
        {/* Ilustrasi sawah */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0 pointer-events-none select-none opacity-[0.12]">
          <img
            src="/images/rice-paddy-field.jpeg"
            alt=""
            className="w-full object-contain object-bottom"
            style={{
              mixBlendMode: "multiply",
              filter:
                "sepia(100%) hue-rotate(90deg) saturate(300%) brightness(0.55)",
            }}
            draggable={false}
          />
        </div>

        <div className="relative z-10 pt-16 md:pt-20 pb-8 px-5 md:px-12 lg:px-20 text-sm text-green-200">
          <div className="max-w-7xl mx-auto mb-14 md:mb-16">
            <a href="/" className="flex items-center gap-2.5 mb-5">
              <img
                src="/logo.png"
                alt="TaniLink"
                className="w-14 h-14 object-contain rounded-lg"
              />
              <span className="font-instrument-serif font-bold text-2xl text-white tracking-tight">
                TaniLink
              </span>
            </a>
            <p className="font-instrument-serif text-green-100/70 text-2xl md:text-3xl lg:text-4xl leading-tight max-w-2xl">
              Dari lahan ke rekening —<br />
              <span className="text-green-400">transparan, terverifikasi,</span>
              <br />
              berkeadilan.
            </p>
          </div>

          <div className="max-w-7xl mx-auto mb-14 flex flex-wrap gap-x-8 gap-y-2">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-green-400/60 hover:text-green-300 text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="max-w-7xl mx-auto border-t border-green-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-green-600 text-xs font-data">
            <p>© {new Date().getFullYear()} TaniLink. Hak cipta dilindungi.</p>
            <div className="flex gap-4 items-center">
              <a
                href="/login"
                className="text-green-400 hover:text-white transition text-sm font-medium"
              >
                Masuk
              </a>
              <a
                href="/register"
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-full text-sm font-medium transition"
              >
                Daftar Gratis
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
