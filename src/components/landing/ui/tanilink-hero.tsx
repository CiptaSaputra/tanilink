"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Fitur", href: "#fitur" },
  { label: "Musim Tanam", href: "#musim-tanam" },
  { label: "Dashboard", href: "#fitur" },
  { label: "Kontak", href: "#kontak" },
];

const segments = [
  {
    badges: ["Prediksi Cuaca BMKG"],
    headline: (
      <>
        Kepastian pasar bagi petani,{" "}
        <span className="italic font-instrument-serif">sejak benih</span>{" "}
        ditanam.
      </>
    ),
  },
  {
    badges: ["Deteksi Penyakit AI", "Smart Matching Engine"],
    headline: (
      <>
        Deteksi dini penyakit tanaman,{" "}
        <span className="italic font-instrument-serif">cocokkan otomatis</span>{" "}
        dengan pembeli.
      </>
    ),
  },
  {
    badges: ["Route Optimization"],
    headline: (
      <>
        Panen bertemu pembeli,{" "}
        <span className="italic font-instrument-serif">dijemput</span> tepat
        waktu.
      </>
    ),
  },
  {
    badges: ["Hash-Chain Ledger"],
    headline: (
      <>
        Semua tercatat,{" "}
        <span className="italic font-instrument-serif">tidak bisa</span>{" "}
        dimanipulasi.
      </>
    ),
    showCTA: true,
  },
];

const INTERVAL = 3500;

export function TanilinkHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Auto-rotate segments
  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % segments.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ── Mobile Menu Overlay ── */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-all duration-700 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
      >
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
        <div
          className={`relative z-10 flex flex-col h-full transition-all duration-700 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" }}
        >
          <div className="flex items-center justify-between px-6 py-5">
            <span className="flex items-center gap-2 text-white font-semibold text-lg tracking-tight">
              <img
                src="/logo.jpeg"
                alt="TaniLink"
                className="w-8 h-8 object-contain rounded-md"
              />
              TaniLink
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center relative"
              aria-label="Tutup menu"
            >
              <span className="absolute w-6 h-0.5 bg-white rounded-full rotate-45" />
              <span className="absolute w-6 h-0.5 bg-white rounded-full -rotate-45" />
            </button>
          </div>

          <nav className="flex-1 flex flex-col items-center justify-center">
            {[...navLinks, { label: "Hubungi Kami", href: "#kontak" }].map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`w-full text-center text-4xl sm:text-5xl font-instrument-serif text-white border-b border-white/10 py-4 transition-all duration-300 hover:pl-4 ${
                  menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: menuOpen ? `${150 + i * 80}ms` : "0ms",
                  transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)",
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div
            className={`px-6 pb-8 transition-all duration-500 ${
              menuOpen ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: menuOpen ? "550ms" : "0ms" }}
          >
            <a
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-semibold rounded-full text-sm"
            >
              Mulai Sekarang <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ── Hero Section ── */}
      <section className="w-full h-screen overflow-hidden relative">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradients */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/20 to-black/40" />
        <div className="absolute top-0 left-0 right-0 h-32 z-[1] bg-gradient-to-b from-black/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">

          {/* ── Navbar ── */}
          <div className="flex items-center justify-between px-5 md:px-12 lg:px-16 py-5 md:py-6">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-white font-semibold text-base md:text-lg tracking-tight"
            >
              <img
                src="/logo.jpeg"
                alt="TaniLink"
                className="w-7 h-7 md:w-8 md:h-8 object-contain rounded-md"
              />
              TaniLink
            </Link>

            {/* Center glass pill nav */}
            <nav className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 rounded-full px-2 py-1.5 border border-white/30 bg-white/15 backdrop-blur-md shadow-lg">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white/80 hover:text-white text-sm font-light transition-colors px-4 py-1.5 rounded-full hover:bg-white/10 whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>

            {/* Right: CTA + hamburger */}
            <div className="flex items-center gap-3">
              <a
                href="#kontak"
                className="hidden md:block text-sm font-light text-white/80 hover:text-white transition-colors duration-200 mr-1"
              >
                Hubungi Kami
              </a>
              <a
                href="/register"
                className="hidden md:flex items-center gap-2 bg-white hover:bg-green-50 text-black font-semibold px-5 py-2 rounded-full text-sm transition"
              >
                Mulai Gratis
              </a>

              {/* Hamburger */}
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden flex flex-col gap-[5px] p-2 -mr-1"
                aria-label="Buka menu"
              >
                <span className="block w-6 h-0.5 bg-white rounded-full" />
                <span className="block w-4 h-0.5 bg-white rounded-full" />
                <span className="block w-6 h-0.5 bg-white rounded-full" />
              </button>
            </div>
          </div>

          {/* ── Hero Content — bottom left ── */}
          <div className="flex-1 flex flex-col justify-end pb-12 md:pb-16 px-5 md:px-12 lg:px-16">
            <div className="max-w-2xl">
              {/* Badges */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`badges-${active}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-wrap gap-2 mb-4"
                >
                  {segments[active].badges.map((badge) => (
                    <span
                      key={badge}
                      className="text-[11px] tracking-wide px-3 py-1 rounded-full bg-white/15 text-white border border-white/30 font-medium backdrop-blur-sm"
                    >
                      {badge}
                    </span>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Headline */}
              <AnimatePresence mode="wait">
                <motion.h1
                  key={`headline-${active}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="font-instrument-serif text-white text-4xl sm:text-5xl md:text-6xl lg:text-[3.75rem] leading-[1.08] tracking-tight"
                  style={{ textShadow: "0 2px 24px rgba(0,0,0,0.6)" }}
                >
                  {segments[active].headline}
                </motion.h1>
              </AnimatePresence>

              {/* CTA — always visible */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-2 mt-5 md:mt-7"
              >
                <a
                  href="/register"
                  className="group flex items-center justify-center gap-2 bg-white hover:bg-green-50 text-black font-semibold px-5 py-2.5 md:px-7 md:py-3 rounded-full text-sm transition w-full sm:w-fit"
                >
                  Daftar Sekarang
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </a>
                <a
                  href="#fitur"
                  className="flex items-center justify-center gap-2 border border-white/40 hover:bg-white/10 hover:border-white/60 text-white px-5 py-2.5 md:px-7 md:py-3 rounded-full text-sm transition w-full sm:w-fit"
                >
                  <Play className="w-4 h-4" />
                  Lihat Cara Kerja
                </a>
              </motion.div>
            </div>


          </div>
        </div>
      </section>
    </>
  );
}
