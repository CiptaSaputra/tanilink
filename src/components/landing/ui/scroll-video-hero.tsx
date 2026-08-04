"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";
import { motion } from "framer-motion";

const navLinks = [
  { label: "Beranda", href: "#" },
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Kontak", href: "#kontak" },
];

/* ── BlurText: word-by-word blur-in animation ── */
function BlurText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTriggered(true); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={className}
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", rowGap: "0.1em" }}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
          animate={
            triggered
              ? { filter: "blur(0px)", opacity: 1, y: 0 }
              : { filter: "blur(10px)", opacity: 0, y: 50 }
          }
          transition={{
            duration: 0.7,
            delay: (i * 100) / 1000,
            ease: "easeOut",
          }}
          style={{ display: "inline-block", marginRight: "0.28em" }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}

/* ── Main Hero ── */
export function ScrollVideoHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [showV2, setShowV2] = useState(false);
  // hero copy parallax only — NOT opacity fade, agar teks tetap terlihat
  const [contentY, setContentY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const switched = useRef(false);

  useEffect(() => {
    function onScroll() {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const trackH = track.offsetHeight - window.innerHeight;
      if (trackH <= 0) return;

      const p = Math.min(1, Math.max(0, -rect.top / trackH));

      // Crossfade ke video 2 di 60%
      if (!switched.current && p >= 0.6) {
        switched.current = true;
        setShowV2(true);
      }
      if (switched.current && p < 0.5) {
        switched.current = false;
        setShowV2(false);
      }

      // Hanya parallax ringan — TIDAK fade opacity agar navbar & teks tetap ada
      setContentY(Math.round(p * 30));
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── MOBILE MENU OVERLAY ── */}
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
              <Leaf className="w-5 h-5 text-green-400" />
              Tani Link
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="relative w-8 h-8 flex items-center justify-center"
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
                className={`w-full text-center font-instrument-serif text-3xl sm:text-4xl text-white border-b border-white/10 py-4 transition-all duration-300 hover:pl-4 ${
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
            className={`px-6 pb-8 transition-all duration-500 ${menuOpen ? "opacity-100" : "opacity-0"}`}
            style={{ transitionDelay: menuOpen ? "550ms" : "0ms" }}
          >
            <button className="w-full py-4 bg-white text-black font-medium rounded-full text-base">
              Coba Demo
            </button>
          </div>
        </div>
      </div>

      {/* SCROLL TRACK — 200vh */}
      <div ref={trackRef} className="relative" style={{ height: "200vh" }}>
        <div className="sticky top-0 w-full h-screen overflow-hidden">

          {/* VIDEO 1 */}
          <video
            autoPlay loop muted playsInline preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: showV2 ? 0 : 1,
              transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
              willChange: "opacity",
            }}
          >
            <source src="/videos/1.mp4" type="video/mp4" />
          </video>

          {/* VIDEO 2 */}
          <video
            autoPlay loop muted playsInline preload="metadata"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: showV2 ? 1 : 0,
              transition: "opacity 0.8s cubic-bezier(0.4,0,0.2,1)",
              willChange: "opacity",
            }}
          >
            <source src="/videos/2.mp4" type="video/mp4" />
          </video>

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 z-[1]" />

          {/* ── NAVBAR — fixed z-30, TIDAK ikut parallax ── */}
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 md:px-12 lg:px-16 py-4 md:py-6">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white font-semibold text-base md:text-lg tracking-tight whitespace-nowrap"
            >
              <Leaf className="w-4 h-4 md:w-5 md:h-5 text-green-400 shrink-0" />
              <span>Tani Link</span>
            </Link>

            <nav className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 liquid-glass rounded-full px-2 py-1.5">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-white/80 hover:text-white text-sm font-light transition-colors duration-200 px-4 py-1.5 rounded-full hover:bg-white/10 whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>

            <div className="hidden md:flex items-center justify-end gap-3">
              <a href="#kontak" className="text-white/70 hover:text-white text-sm font-light transition-colors duration-200 whitespace-nowrap">
                Hubungi Kami
              </a>
              <button className="liquid-glass text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-white/20 transition whitespace-nowrap">
                Coba Demo
              </button>
            </div>

            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden flex flex-col gap-1.5 p-2 -mr-2 relative z-20"
              aria-label="Buka menu"
            >
              <span className="block w-6 h-0.5 bg-white rounded-full" />
              <span className="block w-4 h-0.5 bg-white rounded-full" />
              <span className="block w-6 h-0.5 bg-white rounded-full" />
            </button>
          </div>

          {/* ── HERO COPY — parallax ringan, opacity TIDAK diubah ── */}
          <div
            className="relative z-20 flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center"
            style={{
              transform: `translateY(-${contentY}px)`,
              willChange: "transform",
            }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="liquid-glass rounded-full px-4 py-1.5 flex items-center gap-2 mb-6"
            >
              <span className="bg-green-400 text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                Baru
              </span>
              <span className="text-white/80 text-xs pr-1">
                Platform agribisnis terintegrasi pertama di Indonesia
              </span>
            </motion.div>

            {/* Headline — BlurText word-by-word */}
            <BlurText
              text="SATU SISTEM, seluruh RANTAI AgroINDUSTRI"
              className="font-instrument-serif italic text-white text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] max-w-5xl tracking-tight mb-5"
            />

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
              className="text-white/70 text-sm md:text-base font-light max-w-sm sm:max-w-md leading-relaxed"
            >
              Optimalkan produksi, pengolahan, penyimpanan, hingga distribusi
              dalam satu platform digital terintegrasi.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
              className="mt-7 flex items-center gap-4"
            >
              <button className="group flex items-center gap-2 bg-white text-black text-sm font-medium px-7 py-3.5 rounded-full hover:bg-white/90 transition">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <button className="liquid-glass text-white text-sm font-light px-6 py-3.5 rounded-full hover:bg-white/10 transition">
                Lihat Demo
              </button>
            </motion.div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/40">
            <span className="text-[10px] tracking-[4px] uppercase">scroll</span>
            <svg width="20" height="28" viewBox="0 0 20 28" fill="none" className="opacity-60">
              <rect x="1" y="1" width="18" height="26" rx="9" stroke="white" strokeWidth="1.5" />
              <circle cx="10" cy="8" r="2.5" fill="white">
                <animate attributeName="cy" values="8;17;8" dur="1.8s" repeatCount="indefinite"
                  calcMode="spline" keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" />
                <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

        </div>
      </div>
    </>
  );
}
