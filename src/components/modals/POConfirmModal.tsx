/**
 * src/components/modals/POConfirmModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal konfirmasi PO untuk Petani.
 * Petani melihat detail PO (pembeli, komoditas, volume, harga, total nilai)
 * dan wajib mencentang persetujuan sebelum bisa melanjutkan.
 */
"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, FileCheck, User, Package, Scale, Banknote,
  Calendar, CheckSquare, Square, AlertTriangle, Send,
} from "lucide-react";
import type { Match, Harvest, Demand } from "../../types";
import { COMMODITY_LIST } from "../../constants/commodities";

interface POConfirmModalProps {
  match: Match | null;
  harvest: Harvest | undefined;
  demand: Demand | undefined;
  onConfirm: (matchId: string) => void;
  onClose: () => void;
}

export function POConfirmModal({
  match, harvest, demand, onConfirm, onClose,
}: POConfirmModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [agreeClauses, setAgreeClauses] = useState([false, false, false]);

  if (!match || !harvest || !demand) return null;

  const agreedVolume = match.bidVolume ?? harvest.expectedVolume;
  const agreedPrice  = match.bidPrice  ?? harvest.askingPrice;
  const totalValue   = agreedVolume * agreedPrice;
  const crop         = COMMODITY_LIST[harvest.commodity];
  const allChecked   = agreeClauses.every(Boolean);

  const clauses = [
    `Volume yang disepakati: ${agreedVolume.toLocaleString("id-ID")} Kg komoditas ${harvest.commodity}`,
    `Harga per kilogram: Rp${agreedPrice.toLocaleString("id-ID")}/Kg (total Rp${totalValue.toLocaleString("id-ID")})`,
    `Pengiriman ke wilayah ${demand.region} sebelum ${demand.dateRequired}`,
  ];

  return createPortal(
    <AnimatePresence>
      {match && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-nat-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-nat-dark to-nat-green px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <FileCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Konfirmasi Penerimaan Kontrak</h3>
                  <p className="text-[10px] text-green-200">Baca dan setujui semua klausul sebelum melanjutkan</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Pihak-pihak */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border">
                  <p className="text-[9px] text-nat-sage font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Petani (Anda)
                  </p>
                  <p className="text-xs font-bold text-nat-dark">{harvest.farmerName}</p>
                  <p className="text-[10px] text-nat-sage">{harvest.region}</p>
                </div>
                <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border">
                  <p className="text-[9px] text-nat-sage font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" /> Pembeli
                  </p>
                  <p className="text-xs font-bold text-nat-dark">{demand.buyerName}</p>
                  <p className="text-[10px] text-nat-sage">{demand.region}</p>
                </div>
              </div>

              {/* Detail transaksi */}
              <div className="bg-white border border-nat-border rounded-xl overflow-hidden">
                <div className="bg-nat-light-cream px-4 py-2 border-b border-nat-border">
                  <p className="text-[10px] text-nat-sage font-bold uppercase tracking-wider">Detail Kontrak</p>
                </div>
                <div className="divide-y divide-nat-light-cream">
                  {[
                    { icon: <Package className="w-3.5 h-3.5 text-nat-green" />, label: "Komoditas", value: harvest.commodity,
                      accent: <span className="w-2.5 h-2.5 rounded-full inline-block mr-1" style={{ backgroundColor: crop?.color }} /> },
                    { icon: <Scale className="w-3.5 h-3.5 text-nat-green" />, label: "Volume Disepakati", value: `${agreedVolume.toLocaleString("id-ID")} Kg` },
                    { icon: <Banknote className="w-3.5 h-3.5 text-nat-green" />, label: "Harga / Kg", value: `Rp${agreedPrice.toLocaleString("id-ID")}` },
                    { icon: <Banknote className="w-3.5 h-3.5 text-emerald-600" />, label: "Total Nilai", value: `Rp${totalValue.toLocaleString("id-ID")}`, bold: true },
                    { icon: <Calendar className="w-3.5 h-3.5 text-nat-green" />, label: "Batas Pengiriman", value: demand.dateRequired },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-[11px] text-nat-sage flex items-center gap-1.5">{row.icon}{row.label}</span>
                      <span className={`text-xs font-bold text-nat-dark flex items-center ${row.bold ? "text-emerald-600 text-sm" : ""}`}>
                        {row.accent}{row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Klausul persetujuan */}
              <div className="space-y-2">
                <p className="text-[11px] text-nat-sage font-bold uppercase tracking-wider">
                  Centang semua klausul untuk melanjutkan:
                </p>
                {clauses.map((clause, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const next = [...agreeClauses];
                      next[i] = !next[i];
                      setAgreeClauses(next);
                    }}
                    className="w-full flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer text-left hover:bg-nat-light-cream/50"
                    style={{ borderColor: agreeClauses[i] ? "#5F7444" : "#E5E2D8", background: agreeClauses[i] ? "#f0f7ec" : "white" }}
                  >
                    {agreeClauses[i]
                      ? <CheckSquare className="w-4 h-4 text-nat-green shrink-0 mt-0.5" />
                      : <Square className="w-4 h-4 text-nat-border shrink-0 mt-0.5" />
                    }
                    <span className="text-xs text-nat-text leading-relaxed">{clause}</span>
                  </button>
                ))}
              </div>

              {/* Warning jika belum semua dicentang */}
              {!allChecked && (
                <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Centang semua klausul di atas untuk mengaktifkan tombol konfirmasi.
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-nat-border text-nat-text text-xs font-bold hover:bg-nat-light-cream transition-colors cursor-pointer"
                >
                  Batalkan
                </button>
                <button
                  onClick={() => { if (allChecked) { onConfirm(match.id); onClose(); } }}
                  disabled={!allChecked}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed bg-nat-green hover:bg-nat-green-hover text-white shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  Setuju & Forward ke Pembeli
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
