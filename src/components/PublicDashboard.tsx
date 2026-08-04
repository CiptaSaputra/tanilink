/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useData } from "../context/DataContext";
import { COMMODITY_LIST } from "../constants/commodities";
import { ledgerGetAll } from "../services";
import { verifyChain, shortHash } from "../utils/ledger";
import type { Komoditas, LedgerEntry } from "../types";
import {
  Globe,
  TrendingUp,
  Activity,
  MapPin,
  Leaf,
  Scale,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";
import { QAInput } from "./modals/QAInput";
import TracePublicView from "./TracePublicView";

type ExportDataType = "preOrders" | "harvests" | "demands";

export default function PublicDashboard() {
  const { preOrders } = useData();

  // ── Trace mode: cek ?trace=<harvestId> di URL ──
  const [traceId, setTraceId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("trace");
    if (id) setTraceId(id);

    // Listen ke perubahan URL tanpa reload (misal user klik back)
    const onPop = () => {
      const p = new URLSearchParams(window.location.search);
      setTraceId(p.get("trace"));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleBackFromTrace = () => {
    setTraceId(null);
    // Hapus ?trace dari URL tanpa reload
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("trace");
      window.history.pushState({}, "", url.toString());
    }
  };

  // Ledger hash-chain state
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [chainBroken, setChainBroken] = useState<string[]>([]);
  const [ledgerChecked, setLedgerChecked] = useState(false);

  // Export & QA state
  const [exportType, setExportType] = useState<ExportDataType>("preOrders");
  const [showQA, setShowQA] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await ledgerGetAll();
      if (cancelled) return;
      setLedger(entries);
      const broken = await verifyChain(entries);
      if (!cancelled) {
        setChainBroken(broken);
        setLedgerChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Aggregate metrics
  const completedPOs = preOrders.filter((po) => po.status === "COMPLETED");
  const totalVolumeSavedKg = completedPOs.reduce((acc, po) => acc + po.agreedVolumeKg, 0);
  const totalValueSaved = completedPOs.reduce((acc, po) => acc + (po.agreedVolumeKg * po.agreedPricePerKg), 0);

  // ── Jika ada traceId, tampilkan halaman verifikasi ──
  if (traceId) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">
        <TracePublicView harvestId={traceId} onBack={handleBackFromTrace} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header publik */}
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <img
            src="/logo.jpeg"
            alt="Logo TaniLink"
            className="w-10 h-8 object-contain"
          />
          <span className="text-sm font-bold text-nat-dark">TaniLink</span>
        </div>
        <a
          href="/login"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-nat-border text-nat-dark text-xs font-bold hover:bg-nat-light-cream transition-colors shadow-sm"
        >
          Masuk
        </a>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400 opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs font-bold mb-2">
              <Globe className="w-4 h-4" />
              <span>DASHBOARD PUBLIK TANILINK</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-2">
              Transparansi Pangan Nasional
            </h2>
            <p className="text-sm text-blue-100 max-w-lg">
              Memantau secara langsung pergerakan komoditas dan jumlah pangan yang berhasil diselamatkan dari pembusukan berkat inovasi Smart Matching TaniLink.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-right">
            <p className="text-xs text-blue-200 uppercase tracking-wider font-semibold mb-1">
              Total Tonase Diselamatkan
            </p>
            <p className="text-4xl font-black text-emerald-400">
              {(totalVolumeSavedKg / 1000).toLocaleString("id-ID")} <span className="text-xl">Ton</span>
            </p>
            <p className="text-[10px] text-blue-200 mt-1">Setara dengan Rp{totalValueSaved.toLocaleString("id-ID")}</p>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div id="ringkasan" className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-mt-28">
        <div className="bg-white rounded-2xl p-5 border border-nat-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-nat-sage font-bold uppercase">Total Transaksi</p>
            <p className="text-xl font-black text-nat-dark">{completedPOs.length} PO Selesai</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-nat-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-nat-sage font-bold uppercase">Komoditas Teratas</p>
            <p className="text-xl font-black text-nat-dark">Bawang Merah</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-nat-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-nat-sage font-bold uppercase">Status Pangan</p>
            <p className="text-xl font-black text-nat-dark">Surplus Regional</p>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div
        id="data"
        className="bg-white rounded-2xl border border-nat-border p-6 shadow-sm scroll-mt-28"
      >
        <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
          <Scale className="w-4 h-4 text-blue-600" />
          Riwayat Dampak (Log Publik Terbuka)
        </h3>
        
        {completedPOs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-nat-text">
              <thead>
                <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2">Wilayah</th>
                  <th className="py-2">Komoditas</th>
                  <th className="py-2">Tonase Diselamatkan</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedPOs.map((po, idx) => {
                  const crop = COMMODITY_LIST[po.commodity as Komoditas];
                  return (
                    <tr
                      key={po.id}
                      className="border-b border-nat-light-cream hover:bg-nat-light-cream/35 transition-colors"
                    >
                      <td className="py-3 font-medium text-nat-dark flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-nat-sage" />
                        Brebes (Jawa Tengah)
                      </td>
                      <td className="py-3 font-bold text-nat-dark">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded"
                            style={{ backgroundColor: crop?.color || "#ccc" }}
                          />
                          {po.commodity}
                        </div>
                      </td>
                      <td className="py-3 font-bold text-emerald-600">
                        {po.agreedVolumeKg.toLocaleString("id-ID")} Kg
                      </td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-blue-100 text-blue-700">
                          <ShieldCheck className="w-3 h-3" />
                          {ledger.some((l) => l.preOrderId === po.id)
                            ? "Tercatat Ledger"
                            : "Terverifikasi"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-nat-sage italic text-xs">
            Belum ada data riwayat penyelamatan pangan.
          </div>
        )}
      </div>
      {/* Action Buttons (Export & AI) */}
      <div
        id="aksi"
        className="flex flex-wrap items-center justify-between gap-4 scroll-mt-28"
      >
        <div className="flex items-center gap-2">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value as ExportDataType)}
            className="bg-white border border-nat-border text-nat-dark px-3 py-2.5 rounded-xl text-xs font-bold hover:bg-nat-light-cream transition-colors shadow-sm cursor-pointer focus:outline-none"
          >
            <option value="preOrders">Transaksi (PO)</option>
            <option value="harvests">Data Panen</option>
            <option value="demands">Data Permintaan</option>
          </select>
          <button
            onClick={() =>
              window.open(
                `/api/export?format=csv&type=${exportType}`,
                "_blank",
              )
            }
            className="flex items-center gap-2 bg-white border border-nat-border text-nat-dark px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-nat-light-cream transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 text-nat-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <button
            onClick={() =>
              window.open(
                `/api/export?format=json&type=${exportType}`,
                "_blank",
              )
            }
            className="flex items-center gap-2 bg-white border border-nat-border text-nat-dark px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-nat-light-cream transition-colors shadow-sm cursor-pointer"
          >
            JSON
          </button>
        </div>

        <button
          onClick={() => setShowQA(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          Tanya AI (Q&A Data)
        </button>
      </div>
      
      <div className="text-center text-[10px] text-nat-sage">
        <p>Data bersifat publik dan transparan. Diperbarui secara real-time.</p>
      </div>

      {/* ───── Hash-Chain Ledger ───── */}
      <div className="bg-white rounded-2xl border border-nat-border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-nat-light-cream">
          <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
            <Fingerprint className="w-4 h-4 text-blue-600" />
            Hash-Chain Ledger (Tamper-Evident)
          </h3>
          {ledgerChecked && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold ${
                chainBroken.length === 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              {chainBroken.length === 0
                ? `Rantai Terverifikasi (${ledger.length} entri)`
                : `⚠️ ${chainBroken.length} entri rusak`}
            </span>
          )}
        </div>

        {ledger.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-nat-text">
              <thead>
                <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2">Transaksi</th>
                  <th className="py-2">Previous Hash</th>
                  <th className="py-2">Current Hash</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...ledger].reverse().map((entry) => {
                  let parsed: Record<string, unknown> | null = null;
                  try {
                    parsed = JSON.parse(entry.recordData);
                  } catch {
                    /* ignore */
                  }
                  const isBroken = chainBroken.includes(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      className="border-b border-nat-light-cream hover:bg-nat-light-cream/35"
                    >
                      <td className="py-2.5">
                        <div className="font-bold text-nat-dark">
                          {parsed
                            ? `${parsed.commodity ?? ""} · ${Number(parsed.volumeKg ?? 0).toLocaleString("id-ID")} kg`
                            : entry.preOrderId}
                        </div>
                        <div className="text-[9px] text-nat-sage font-mono">
                          {entry.preOrderId}
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-nat-sage">
                        {shortHash(entry.previousHash)}
                      </td>
                      <td className="py-2.5 font-mono text-[10px] text-nat-green">
                        {shortHash(entry.currentHash)}
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isBroken
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {isBroken ? "Manipulasi?" : "Valid"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-nat-sage italic text-xs">
            Belum ada transaksi tercatat. Ledger akan terisi saat PO diselesaikan.
          </div>
        )}
      </div>

      {/* ───── AI Q&A Modal ───── */}
      {showQA && <QAInput onClose={() => setShowQA(false)} />}
    </div>
  );
}
