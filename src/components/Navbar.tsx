/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { useUI } from "../context/UIContext";
import { useAuth } from "../context/AuthContext";
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
} from "lucide-react";
import { Role } from "../types";

export default function Navbar() {
  const { activeRole, setRole, resetAllData } = useUI();
  const { currentUser, logout } = useAuth();

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
  ];

  // Badge warna per role
  const roleBadgeColor: Record<Role, string> = {
    PETANI: "bg-nat-green/10 text-nat-green border-nat-green/30",
    PEMBELI: "bg-nat-brown/10 text-nat-brown border-nat-brown/30",
    PPL: "bg-teal-100 text-teal-700 border-teal-300",
    DINAS: "bg-nat-dark/10 text-nat-dark border-nat-dark/20",
    KOLEKTOR: "bg-amber-100 text-amber-700 border-amber-300",
    ADMIN: "bg-nat-sage/10 text-nat-sage border-nat-sage/30",
  };

  const roleBadgeLabel: Record<Role, string> = {
    PETANI: "Petani",
    PEMBELI: "Pembeli",
    PPL: "PPL / BPP",
    DINAS: "Dinas",
    KOLEKTOR: "Kolektor",
    ADMIN: "Admin",
  };

  // Role yang sedang aktif = role user yang login (tidak bisa di-switch manual)
  const displayRole = currentUser?.role ?? activeRole;

  return (
    <header className="bg-white border-b border-nat-border sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-nat-green rounded-xl flex items-center justify-center shadow-md shadow-nat-green/10">
              <Sprout className="w-5.5 h-5.5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-nat-dark tracking-tight leading-none">
                TaniLink
              </h1>
              <p className="text-[10px] font-semibold text-nat-sage tracking-wider uppercase mt-1">
                Sinergi Hulu-Hilir Pertanian
              </p>
            </div>
          </div>

          {/* User info + actions */}
          <div className="flex items-center space-x-3">
            {/* Reset Data (tetap tersedia untuk demo) */}
            <button
              onClick={resetAllData}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs text-nat-text hover:text-nat-green hover:bg-nat-light-cream rounded-lg transition-colors border border-transparent hover:border-nat-border cursor-pointer"
              title="Kembalikan data ke kondisi awal"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="font-medium hidden sm:inline">Reset Data</span>
            </button>

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

            <div className="flex flex-wrap gap-2">
              {rolesList.map((role) => {
                const isSelected = activeRole === role.id;
                return (
                  <button
                    key={role.id}
                    id={`role-btn-${role.id.toLowerCase()}`}
                    onClick={() => setRole(role.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 cursor-pointer ${
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
          <div className="border-t border-nat-light-cream py-2.5 flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${roleBadgeColor[currentUser.role]}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70 animate-pulse" />
              <span>Aktif sebagai {roleBadgeLabel[currentUser.role]}</span>
            </div>
            <span className="text-[11px] text-nat-sage">
              — Dashboard disesuaikan dengan peran Anda
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
