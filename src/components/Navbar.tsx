/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import SectionNav from "./shared/SectionNav";
import type { SectionNavItem } from "./shared/SectionNav";
import {
  Sprout,
  ShieldAlert,
  RefreshCw,
  Layers,
  Truck,
  Sliders,
  Users,
  ShoppingBag,
  LogOut,
  UserCircle,
  MapPin,
  Globe,
  Bell,
  CheckCheck,
  MessageCircle,
  PackageCheck,
  Truck as TruckIcon,
  CloudRain,
  Info,
  Plus,
  Handshake,
  FileCheck,
  Store,
  TrendingUp,
  BookOpen,
  ScanEye,
  Inbox,
  Megaphone,
  BarChart3,
  Route,
  List,
  Scale,
  Download,
  Star,
  AlertTriangle,
  Gauge,
  Boxes,
  LineChart,
} from "lucide-react";
import { Role } from "../types";

// ─── Section Navigation per role ────────────────────────────────────────────────
// Dirender di dalam Navbar (yang sudah sticky top-0 z-50) agar selalu tampil
// di atas tanpa bug offset sticky terpisah.

const ROLE_SECTIONS: Record<string, SectionNavItem[]> = {
  PETANI: [
    { id: "input", label: "Input Lahan", icon: <Plus className="w-3.5 h-3.5" /> },
    { id: "harga", label: "Prediksi Harga", icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: "deteksi", label: "Deteksi Penyakit", icon: <ScanEye className="w-3.5 h-3.5" /> },
    { id: "lahan", label: "Lahan Saya", icon: <Sprout className="w-3.5 h-3.5" /> },
    { id: "match", label: "Pencocokan & PO", icon: <Handshake className="w-3.5 h-3.5" /> },
    { id: "po", label: "Pre-Order", icon: <FileCheck className="w-3.5 h-3.5" /> },
    { id: "edukasi", label: "Edukasi", icon: <BookOpen className="w-3.5 h-3.5" /> },
  ],
  PEMBELI: [
    { id: "tawaran", label: "Penawaran Masuk", icon: <Inbox className="w-3.5 h-3.5" /> },
    { id: "input-demand", label: "Rilis Kebutuhan", icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: "match", label: "Pencocokan Petani", icon: <Handshake className="w-3.5 h-3.5" /> },
    { id: "po", label: "Pre-Order Aktif", icon: <FileCheck className="w-3.5 h-3.5" /> },
    { id: "logistik", label: "Logistik & Jemput", icon: <Truck className="w-3.5 h-3.5" /> },
    { id: "marketplace", label: "Marketplace", icon: <Store className="w-3.5 h-3.5" /> },
  ],
  PPL: [
    { id: "ringkasan", label: "Ringkasan", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "komoditas", label: "Komoditas", icon: <Layers className="w-3.5 h-3.5" /> },
    { id: "lahan", label: "Daftar Lahan", icon: <Sprout className="w-3.5 h-3.5" /> },
    { id: "batch", label: "Status Batch", icon: <Truck className="w-3.5 h-3.5" /> },
    { id: "edukasi", label: "Konten Edukasi", icon: <BookOpen className="w-3.5 h-3.5" /> },
  ],
  DINAS: [
    { id: "indeks", label: "Indeks Nasional", icon: <Gauge className="w-3.5 h-3.5" /> },
    { id: "komoditas", label: "Neraca Komoditas", icon: <Boxes className="w-3.5 h-3.5" /> },
    { id: "risiko", label: "Risiko Food Loss", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: "forecast", label: "Peramalan", icon: <LineChart className="w-3.5 h-3.5" /> },
    { id: "rute", label: "Optimasi Rute", icon: <Truck className="w-3.5 h-3.5" /> },
  ],
  ADMIN: [
    { id: "bobot", label: "Bobot Matching", icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: "dispute", label: "Sengketa", icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: "review", label: "Ulasan", icon: <Star className="w-3.5 h-3.5" /> },
    { id: "moderasi", label: "Moderasi", icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: "prioritas", label: "Prioritas", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: "po", label: "Pre-Order", icon: <FileCheck className="w-3.5 h-3.5" /> },
  ],
  KOLEKTOR: [
    { id: "rute", label: "Rute Rekomendasi", icon: <Route className="w-3.5 h-3.5" /> },
    { id: "batch", label: "Batch Siap Jemput", icon: <Truck className="w-3.5 h-3.5" /> },
    { id: "riwayat", label: "Riwayat Batch", icon: <List className="w-3.5 h-3.5" /> },
  ],
  PUBLIK: [
    { id: "ringkasan", label: "Ringkasan", icon: <Globe className="w-3.5 h-3.5" /> },
    { id: "data", label: "Data Dampak", icon: <Scale className="w-3.5 h-3.5" /> },
    { id: "aksi", label: "Ekspor & AI", icon: <Download className="w-3.5 h-3.5" /> },
  ],
};

export default function Navbar() {
  const { activeRole, setRole, resetAllData } = useUI();
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifTypeIcon = (type: string) => {
    switch (type) {
      case "match":
        return <MessageCircle className="w-3.5 h-3.5 text-nat-green" />;
      case "preorder":
        return <PackageCheck className="w-3.5 h-3.5 text-nat-brown" />;
      case "batch":
        return <TruckIcon className="w-3.5 h-3.5 text-amber-600" />;
      case "weather":
        return <CloudRain className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return <Info className="w-3.5 h-3.5 text-nat-sage" />;
    }
  };

  const rolesList: {
    id: Role;
    label: string;
    icon: React.ReactNode;
    color: string;
    desc: string;
  }[] = [
    {
      id: "PETANI",
      label: "Petani",
      icon: <Sprout className="w-4 h-4" />,
      color:
        "bg-nat-green text-white border-nat-green hover:bg-nat-green-hover",
      desc: "Melaporkan jadwal tanam, memantau risiko susut, dan mencocokkan panen.",
    },
    {
      id: "PEMBELI",
      label: "Pembeli / Koperasi",
      icon: <ShoppingBag className="w-4 h-4" />,
      color: "bg-nat-brown text-white border-nat-brown hover:opacity-95",
      desc: "Menginput kebutuhan komoditas, mengajukan pre-order, dan membeli surplus.",
    },
    {
      id: "PPL",
      label: "PPL / Gapoktan",
      icon: <Users className="w-4 h-4" />,
      color: "bg-teal-600 text-white border-teal-600 hover:opacity-95",
      desc: "Penyuluh Pertanian Lapangan: pantau wilayah binaan.",
    },
    {
      id: "DINAS",
      label: "Dinas Pertanian",
      icon: <Layers className="w-4 h-4" />,
      color: "bg-nat-dark text-white border-nat-dark hover:opacity-95",
      desc: "Memonitoring sebaran wilayah surplus, risiko busuk, dan laporan agregat.",
    },
    {
      id: "KOLEKTOR",
      label: "Kolektor",
      icon: <Truck className="w-4 h-4" />,
      color: "bg-amber-600 text-white border-amber-600 hover:opacity-95",
      desc: "Petugas kolektor: melihat rekomendasi rute first-mile dan update status batch.",
    },
    {
      id: "ADMIN",
      label: "Admin",
      icon: <Sliders className="w-4 h-4" />,
      color: "bg-nat-sage text-white border-nat-sage hover:opacity-95",
      desc: "Memantau performa bobot default Smart Matching dan menyelesaikan dispute.",
    },
    {
      id: "PUBLIK",
      label: "Masyarakat / Publik",
      icon: <Globe className="w-4 h-4" />,
      color: "bg-blue-600 text-white border-blue-600 hover:opacity-95",
      desc: "Dashboard publik untuk melihat total tonase diselamatkan dan tren pangan.",
    },
  ];

  // Badge warna per role
  const roleBadgeColor: Record<Role, string> = {
    PETANI: "bg-nat-green/10 text-nat-green border-nat-green/30",
    PEMBELI: "bg-nat-brown/10 text-nat-brown border-nat-brown/30",
    PPL: "bg-teal-100 text-teal-700 border-teal-300",
    DINAS: "bg-nat-dark/10 text-nat-dark border-nat-dark/20",
    KOLEKTOR: "bg-amber-100 text-amber-700 border-amber-300",
    ADMIN: "bg-nat-sage/10 text-nat-sage border-nat-sage/30",
    PUBLIK: "bg-blue-100 text-blue-700 border-blue-300",
  };

  const roleBadgeLabel: Record<Role, string> = {
    PETANI: "Petani",
    PEMBELI: "Pembeli",
    PPL: "PPL / BPP",
    DINAS: "Dinas",
    KOLEKTOR: "Kolektor",
    ADMIN: "Admin",
    PUBLIK: "Publik",
  };

  // Role yang sedang aktif = role user yang login (tidak bisa di-switch manual)
  const displayRole = currentUser?.role ?? activeRole;

  return (
    <header className="bg-white border-b border-nat-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <img
              src="/logo.jpeg"
              alt="Logo TaniLink"
              className="w-10 h-8 sm:w-12 sm:h-9 object-contain drop-shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-nat-dark tracking-tight leading-none truncate">
                TaniLink
              </h1>
              <p className="hidden sm:block text-[10px] font-semibold text-nat-sage tracking-wider uppercase mt-1 truncate">
                Sinergi Hulu-Hilir Pertanian
              </p>
            </div>
          </div>

          {/* User info + actions */}
          <div className="flex items-center space-x-3">
            {/* Notifikasi bell + dropdown */}
            {currentUser && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotif((v) => !v)}
                  className="relative flex items-center justify-center w-9 h-9 rounded-lg text-nat-sage hover:text-nat-green hover:bg-nat-light-cream transition-colors cursor-pointer"
                  title="Riwayat notifikasi"
                  aria-label="Notifikasi"
                >
                  <Bell className="w-4.5 h-4.5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {showNotif && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-nat-border overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-nat-light-cream border-b border-nat-border">
                      <span className="text-xs font-bold text-nat-dark">
                        Notifikasi
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="flex items-center gap-1 text-[10px] text-nat-green font-semibold hover:underline cursor-pointer"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Tandai dibaca
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-nat-sage italic">
                          Belum ada notifikasi.
                        </div>
                      ) : (
                        notifications.slice(0, 30).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => markRead(n.id)}
                            className={`w-full text-left flex gap-2.5 px-4 py-2.5 border-b border-nat-light-cream transition-colors cursor-pointer ${
                              n.read
                                ? "opacity-60 hover:opacity-100"
                                : "bg-white hover:bg-nat-light-cream"
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {notifTypeIcon(n.type)}
                            </span>
                            <span>
                              <span
                                className={`block text-[11px] ${
                                  n.read
                                    ? "text-nat-sage font-medium"
                                    : "text-nat-dark font-bold"
                                }`}
                              >
                                {n.message}
                              </span>
                              <span className="block text-[9px] text-nat-sage mt-0.5">
                                {new Date(n.createdAt).toLocaleString("id-ID")}
                              </span>
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reset Data — hanya tampil untuk Admin */}
            {activeRole === "ADMIN" && (
              <button
                onClick={resetAllData}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                title="Reset semua data ke kondisi awal (Admin only)"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="font-medium hidden sm:inline">Reset Data</span>
              </button>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-nat-border" />

            {/* User info */}
            {currentUser && (
              <div className="flex items-center space-x-2.5">
                <div className="flex items-center space-x-2 text-right">
                  <div className="hidden sm:block">
                    <p className="text-xs font-semibold text-nat-dark leading-none">
                      {currentUser.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-2.5 h-2.5 text-nat-sage" />
                      <p className="text-[10px] text-nat-sage leading-none">
                        {currentUser.region}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-nat-light-cream border border-nat-border flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-nat-sage" />
                  </div>
                </div>

                {/* Role badge */}
                <span
                  className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadgeColor[displayRole as Role]}`}
                >
                  {roleBadgeLabel[displayRole as Role]}
                </span>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 cursor-pointer"
                  title="Keluar dari akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="font-medium hidden sm:inline">Keluar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Role Switcher Bar — hanya tampil jika user adalah Admin (demo mode) atau tidak ada user */}
        {(!currentUser || currentUser.role === "ADMIN") && (
          <div className="border-t border-nat-light-cream py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-nat-green shrink-0" />
              <span className="text-xs font-semibold text-nat-dark">
                Simulasi Peran MVP:
              </span>
              <span className="text-[11px] text-nat-sage hidden lg:inline">
                Klik peran di bawah untuk menguji alur kerja lengkap hulu-hilir
              </span>
            </div>

            {/* Dropdown (mobile) */}
            <div className="md:hidden w-full">
              <select
                value={activeRole}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full bg-white border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green cursor-pointer"
              >
                {rolesList.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol row (desktop) */}
            <div className="hidden md:flex overflow-x-auto no-scrollbar gap-2">
              {rolesList.map((role) => {
                const isSelected = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    id={`role-btn-${role.id.toLowerCase()}`}
                    onClick={() => setRole(role.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer shrink-0 ${
                      isSelected
                        ? `${role.color} ring-2 ring-nat-green/20 font-semibold shadow-sm`
                        : "bg-white text-nat-text border-nat-border hover:bg-nat-light-cream hover:text-nat-dark"
                    }`}
                    title={role.desc}
                  >
                    {role.icon}
                    <span>{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Role indicator bar — untuk user non-Admin yang sudah login */}
        {currentUser && currentUser.role !== "ADMIN" && (
          <div className="border-t border-nat-light-cream py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap shrink-0 ${roleBadgeColor[currentUser.role]}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
              <span>Aktif sebagai {roleBadgeLabel[currentUser.role]}</span>
            </div>
            <span className="text-[11px] text-nat-sage whitespace-nowrap shrink-0">
              — Dashboard disesuaikan dengan peran Anda
            </span>
          </div>
        )}

        {/* Section Navigation — di dalam Navbar (sudah sticky) agar selalu di atas */}
        {ROLE_SECTIONS[displayRole as string] && (
          <SectionNav
            sections={ROLE_SECTIONS[displayRole as string]}
            onSectionClick={(id) => {
              // View bertab (Dinas/Admin) mendengarkan event ini untuk switch tab
              window.dispatchEvent(
                new CustomEvent("tanilink:sectionclick", {
                  detail: { role: displayRole, id },
                }),
              );
            }}
          />
        )}
      </div>
    </header>
  );
}
