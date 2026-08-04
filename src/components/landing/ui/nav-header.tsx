"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "#" },
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Kontak", href: "#kontak" },
];

export default function NavHeader() {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div
        className="flex items-center justify-between px-4 md:px-6 py-3 rounded-[16px] backdrop-blur-md bg-white/80 border border-green-200"
        style={{ boxShadow: "0 4px 24px rgba(22,163,74,0.10)" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-[18px] md:text-[20px] tracking-tight text-green-800">
          <Leaf className="w-5 h-5 md:w-6 md:h-6 text-green-500" />
          Tani Link
        </Link>

        {/* Desktop Tabs */}
        <ul
          className="relative hidden md:flex w-fit rounded-full bg-green-50 p-1 border border-green-100"
          onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
        >
          {navLinks.map((link) => (
            <Tab key={link.label} href={link.href} setPosition={setPosition}>
              {link.label}
            </Tab>
          ))}
          <Cursor position={position} />
        </ul>

        {/* Desktop CTA */}
        <button className="hidden md:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-medium text-[14px] transition shadow-[0_0_15px_rgba(22,163,74,0.25)]">
          Coba Demo
        </button>

        {/* Mobile Hamburger */}
        <button
          className="flex md:hidden items-center justify-center w-9 h-9 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="mt-2 rounded-2xl bg-white/95 backdrop-blur-md border border-green-100 shadow-xl overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-green-800 font-medium hover:bg-green-50 transition text-[15px]"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 border-t border-green-100 mt-2">
                <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-full font-medium text-[15px] transition">
                  Coba Demo
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

type CursorPosition = { left: number; width: number; opacity: number };

const Tab = ({
  children,
  href,
  setPosition,
}: {
  children: React.ReactNode;
  href: string;
  setPosition: React.Dispatch<React.SetStateAction<CursorPosition>>;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
      }}
      className="relative z-10 list-none"
    >
      <a
        href={href}
        className="block cursor-pointer px-4 py-2 text-[13px] font-semibold text-green-800 tracking-wide"
      >
        {children}
      </a>
    </li>
  );
};

const Cursor = ({ position }: { position: CursorPosition }) => (
  <motion.li
    animate={position}
    className="absolute z-0 h-8 rounded-full bg-green-200 list-none top-1"
  />
);
