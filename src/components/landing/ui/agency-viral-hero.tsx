"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Leaf } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "#" },
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Kontak", href: "#kontak" },
];

export function ViralHeroSection() {
  const [menuOpen, setMenuOpen] = useState(false);

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
          {/* Header overlay */}
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

          {/* Nav links */}
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

          {/* Footer CTA */}
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

      {/* ── HERO SECTION ── */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Video */}
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_204103_f607742e-09da-4cf5-bb06-4e67b0a531de.mp4"
            type="video/mp4"
          />
        </video>

        {/* Gradient overlay — fade ke hitam supaya nyambung ke scroll scrub */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black z-[1]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">

          {/* ── NAVBAR ── */}
          <div className="flex items-center justify-between px-4 md:px-12 lg:px-16 py-4 md:py-6">
            {/* Logo — kiri */}
            <Link href="/" className="flex items-center gap-1.5 text-white font-semibold text-base md:text-lg tracking-tight whitespace-nowrap">
              <Leaf className="w-4 h-4 md:w-5 md:h-5 text-green-400 shrink-0" />
              <span>Tani Link</span>
            </Link>

            {/* Desktop links — tengah */}
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

            {/* Desktop CTA — kanan */}
            <div className="hidden md:flex items-center justify-end gap-3">
              <a href="#kontak" className="text-white/70 hover:text-white text-sm font-light transition-colors duration-200 whitespace-nowrap">
                Hubungi Kami
              </a>
              <button className="liquid-glass text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-white/20 transition whitespace-nowrap">
                Coba Demo
              </button>
            </div>

            {/* Mobile hamburger */}
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

          {/* ── HERO CONTENT ── */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center -mt-10 md:-mt-16">
            <h1
              className="font-instrument-serif text-white text-[2rem] sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.15] max-w-5xl tracking-tight"
              style={{ textShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
            >
              SATU SISTEM,{" "}
              <em className="italic">seluruh</em>{" "}
              RANTAI <em className="italic">Agro</em>INDUSTRI
            </h1>

            <p className="mt-4 md:mt-5 text-white/70 text-sm md:text-base font-light max-w-sm sm:max-w-md leading-relaxed px-2">
              Optimalkan produksi, pengolahan, penyimpanan, hingga distribusi
              dalam satu platform digital terintegrasi.
            </p>

            <div className="mt-6 flex items-center justify-center">
              <button className="group flex items-center justify-center gap-2 bg-white text-black text-sm font-medium px-7 py-3.5 rounded-full hover:bg-white/90 transition">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
