/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/components/shared/SectionNav.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Sticky section navigation (anchor scroll) reusable component.
 * Bar lengket di bawah header dengan tombol yang lompat ke section tertentu.
 * - Klik tombol → scrollIntoView smooth ke elemen ber-`id`.
 * - IntersectionObserver menandai section yang sedang aktif di viewport.
 * - Scrollable horizontal di mobile (overflow-x-auto).
 *
 * TARGET: setiap elemen section yang di-anchor harus diberi `scroll-mt-28`
 * (offset sticky Navbar h-16 + SectionNav ~48px) agar tidak tertutup bar.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";

export interface SectionNavItem {
  /** id elemen target di halaman (harus unik per view) */
  id: string;
  /** label tampilan */
  label: string;
  /** ikon lucide-react */
  icon: React.ReactNode;
}

interface SectionNavProps {
  sections: SectionNavItem[];
  /**
   * Handler opsional untuk view bertab (Dinas/Admin). Dipanggil sebelum scroll
   * agar view bisa switch tab terlebih dahulu, lalu SectionNav men-scroll
   * ke section setelah tab ter-render.
   */
  onSectionClick?: (id: string) => void;
  /** true = sticky sendiri; false = render polos (Navbar parent yang sticky) */
  sticky?: boolean;
}

export default function SectionNav({
  sections,
  onSectionClick,
  sticky = false,
}: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Observe setiap target section untuk menandai yang aktif saat scroll
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Hanya ambil entry yang masuk viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  const handleClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    onSectionClick?.(id);
    // Tunggu re-render tab (jika ada switch tab) sebelum scroll
    setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    setActiveId(id);
  };

  return (
    <nav
      aria-label="Navigasi bagian"
      className={`${
        sticky ? "sticky top-16 z-40" : ""
      } -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-white border-b border-nat-border shadow-sm`}
    >
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar whitespace-nowrap py-2">
        {sections.map((s) => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              id={`section-nav-${s.id}`}
              onClick={(e) => handleClick(s.id, e)}
              aria-current={isActive ? "true" : undefined}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer shrink-0 ${
                isActive
                  ? "bg-nat-green text-white border-nat-green shadow-sm"
                  : "bg-white text-nat-sage border-transparent hover:bg-nat-light-cream hover:text-nat-dark"
              }`}
            >
              {s.icon}
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
