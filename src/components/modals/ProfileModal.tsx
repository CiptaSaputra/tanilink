"use client";

/**
 * ProfileModal — popup setting profil user
 * Edit: nama, nomor WhatsApp, wilayah
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, User, Phone, MapPin, Save, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [region, setRegion] = useState(currentUser?.region ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name ?? "");
      setPhone(currentUser.phone ?? "");
      setRegion(currentUser.region ?? "");
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currentUser.id, name, phone, region }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal menyimpan.");
        return;
      }

      // Update localStorage session
      const updated = { ...currentUser, ...data.user };
      localStorage.setItem("flw_auth_session", JSON.stringify(updated));

      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  const roleLabel: Record<string, string> = {
    PETANI: "🌾 Petani",
    PEMBELI: "🛒 Pembeli / Koperasi",
    KOLEKTOR: "🚛 Kolektor",
    PPL: "👨‍🏫 PPL/BPP",
    DINAS: "🏛️ Dinas Pertanian",
    ADMIN: "⚙️ Admin",
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 12 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nat-border overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-nat-dark to-nat-green">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-sm">
                {(currentUser?.name ?? "?")[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{currentUser?.name}</p>
                <p className="text-[10px] text-green-200">
                  {roleLabel[currentUser?.role ?? ""] ?? currentUser?.role}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Form */}
          <div className="p-5 space-y-4">
            {/* Email — read only */}
            <div className="bg-nat-light-cream rounded-xl px-4 py-2.5 border border-nat-border">
              <p className="text-[10px] text-nat-sage font-semibold uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-xs font-bold text-nat-dark">{currentUser?.email}</p>
            </div>

            {/* Nama */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-nat-text uppercase tracking-wider">
                <User className="w-3 h-3 text-nat-green" /> Nama Lengkap
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kamu"
                className="w-full bg-nat-light-cream border border-nat-border rounded-xl px-3 py-2.5 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-2 focus:ring-nat-green/30"
              />
            </div>

            {/* Nomor WhatsApp */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-nat-text uppercase tracking-wider">
                <Phone className="w-3 h-3 text-nat-green" /> Nomor WhatsApp
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-nat-sage font-mono">+62</span>
                <input
                  type="tel"
                  value={phone.startsWith("62") ? phone.slice(2) : phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setPhone(val ? "62" + val : "");
                  }}
                  placeholder="8xx-xxxx-xxxx"
                  className="w-full bg-nat-light-cream border border-nat-border rounded-xl pl-10 pr-3 py-2.5 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-2 focus:ring-nat-green/30"
                />
              </div>
              <p className="text-[10px] text-nat-sage">
                Dipakai untuk tombol "Chat WA" di platform
              </p>
            </div>

            {/* Wilayah */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-nat-text uppercase tracking-wider">
                <MapPin className="w-3 h-3 text-nat-green" /> Wilayah / Kabupaten
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Contoh: Brebes"
                className="w-full bg-nat-light-cream border border-nat-border rounded-xl px-3 py-2.5 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-2 focus:ring-nat-green/30"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-nat-green hover:bg-nat-green-hover disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              ) : saved ? (
                <><CheckCircle2 className="w-4 h-4" /> Tersimpan!</>
              ) : (
                <><Save className="w-4 h-4" /> Simpan Profil</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
