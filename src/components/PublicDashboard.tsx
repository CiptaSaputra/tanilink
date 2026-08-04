/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useData } from "../context/DataContext";
import { COMMODITY_LIST } from "../constants/commodities";
import { ledgerGetAll } from "../services";
import { verifyChain, shortHash } from "../utils/ledger";
import type { Komoditas, LedgerEntry } from "../types";
import {
  Globe, TrendingUp, Activity, MapPin, Leaf, Scale,
  ShieldCheck, Fingerprint, Download, MessageCircle,
  Sprout, Package, BarChart3, ExternalLink, QrCode,
  ChevronRight, ArrowUpRight,
} from "lucide-react";
import { QAInput } from "./modals/QAInput";
import TracePublicView from "./TracePublicView";

type ExportDataType = "preOrders" | "harvests" | "demands";

/* ── Animated counter ── */
function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display.toLocaleString("id-ID")}{suffix}</span>;
}

export default function PublicDashboard() {
  const { preOrders, harvests, demands } = useData();

  /* ── Trace mode ── */
  const [traceId, setTraceId] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = new URLSearchParams(window.location.search).get("trace");
    if (id) setTraceId(id);
    const onPop = () => setTraceId(new URLSearchParams(window.location.search).get("trace"));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleBackFromTrace = () => {
    setTraceId(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("trace");
      window.history.pushState({}, "", url.toString());
    }
  };

  /* ── Ledger ── */
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [chainBroken, setChainBroken] = useState<string[]>([]);
  const [ledgerChecked, setLedgerChecked] = useState(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await ledgerGetAll();
      if (cancelled) return;
      setLedger(entries);
      const broken = await verifyChain(entries);
      if (!cancelled) { setChainBroken(broken); setLedgerChecked(true); }
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── Export & QA ── */
  const [exportType, setExportType] = useState<ExportDataType>("preOrders");
  const [showQA, setShowQA] = useState(false);

  /* ── Metrics ── */
  const completedPOs = preOrders.filter((po) => po.status === "COMPLETED");
  const totalVolumeSavedKg = completedPOs.reduce((s, po) => s + po.agreedVolumeKg, 0);
  const totalValueSaved = completedPOs.reduce((s, po) => s + po.agreedVolumeKg * po.agreedPricePerKg, 0);
  const activeHarvests = harvests.filter((h) => h.status === "ACTIVE").length;
  const activeDemands = demands.filter((d) => d.status === "ACTIVE").length;

  /* ── Komoditas breakdown ── */
  const commodityMap: Record<string, number> = {};
  completedPOs.forEach((po) => {
    commodityMap[po.commodity] = (commodityMap[po.commodity] || 0) + po.agreedVolumeKg;
  });
  const topCommodities = Object.entries(commodityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  if (traceId) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">
        <TracePublicView harvestId={traceId} onBack={handleBackFromTrace} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0fdf4] to-[#f8fafc]">

      {/* ── TOP NAVBAR ── */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-14">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="TaniLink" className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-bold text-green-900 text-sm">TaniLink</span>
            <span className="hidden sm:inline text-[10px] text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded-full ml-1">Publik</span>
          </a>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowQA(true)}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors cursor-pointer">
              <MessageCircle className="w-3.5 h-3.5" /> Tanya AI
            </button>
            <a href="/login"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition-colors shadow-sm">
              Masuk <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* ── HERO BANNER ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-teal-700 p-8 md:p-12 text-white shadow-2xl">
          {/* decorative blobs */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-green-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-green-300" />
                <span className="text-xs font-bold text-green-300 uppercase tracking-[3px]">Dashboard Publik</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Transparansi<br />
                <span className="text-green-300">Pangan Nasional</span>
              </h1>
              <p className="text-green-100/80 text-sm md:text-base max-w-lg leading-relaxed">
                Pantau pergerakan komoditas pertanian secara real-time. Data terbuka untuk masyarakat, peneliti, dan pengambil kebijakan.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={() => setShowQA(true)}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer">
                  <MessageCircle className="w-4 h-4" /> Tanya AI
                </button>
                <button onClick={() => window.open(`/api/export?format=csv&type=${exportType}`, "_blank")}
                  className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer">
                  <Download className="w-4 h-4" /> Export Data
                </button>
              </div>
            </div>

            {/* Big stat */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center min-w-[180px]">
              <p className="text-xs text-green-200 uppercase tracking-widest font-semibold mb-2">Pangan Diselamatkan</p>
              <p className="text-5xl font-black text-white">
                <Counter value={Math.round(totalVolumeSavedKg / 1000)} />
              </p>
              <p className="text-green-300 font-bold text-lg">Ton</p>
              <div className="mt-3 pt-3 border-t border-white/20 text-xs text-green-200">
                ≈ Rp{(totalValueSaved / 1_000_000).toFixed(1)}M nilai diselamatkan
              </div>
            </div>
          </div>
        </motion.div>


        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Activity className="w-5 h-5" />, label: "Transaksi Selesai", value: completedPOs.length, suffix: " PO", color: "blue" },
            { icon: <Sprout className="w-5 h-5" />, label: "Lahan Aktif", value: activeHarvests, suffix: " lahan", color: "green" },
            { icon: <Package className="w-5 h-5" />, label: "Permintaan Aktif", value: activeDemands, suffix: " demand", color: "amber" },
            { icon: <ShieldCheck className="w-5 h-5" />, label: "Entri Ledger", value: ledger.length, suffix: " entri", color: "purple" },
          ].map((stat, i) => {
            const colors: Record<string, string> = {
              blue: "bg-blue-50 text-blue-600 border-blue-100",
              green: "bg-green-50 text-green-600 border-green-100",
              amber: "bg-amber-50 text-amber-600 border-amber-100",
              purple: "bg-purple-50 text-purple-600 border-purple-100",
            };
            return (
              <motion.div key={stat.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${colors[stat.color]}`}>
                  {stat.icon}
                </div>
                <p className="text-2xl font-black text-gray-900">
                  <Counter value={stat.value} />{stat.suffix}
                </p>
                <p className="text-xs text-gray-500 font-medium mt-0.5">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* ── DAFTAR LOG + KOMODITAS ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Log Transaksi */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-green-600" />
                Log Publik Transaksi
              </h3>
              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2.5 py-1 rounded-full">
                {completedPOs.length} transaksi
              </span>
            </div>
            {completedPOs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-gray-700">
                  <thead>
                    <tr className="border-b border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-3 text-left">Wilayah</th>
                      <th className="px-6 py-3 text-left">Komoditas</th>
                      <th className="px-6 py-3 text-left">Volume</th>
                      <th className="px-6 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedPOs.map((po) => {
                      const crop = COMMODITY_LIST[po.commodity as Komoditas];
                      return (
                        <tr key={po.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-3.5 font-medium text-gray-700">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              Brebes, Jawa Tengah
                            </div>
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crop?.color || "#ccc" }} />
                              <span className="font-semibold text-gray-800">{po.commodity}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 font-bold text-green-600">
                            {po.agreedVolumeKg.toLocaleString("id-ID")} kg
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                              <ShieldCheck className="w-3 h-3" />
                              {ledger.some((l) => l.preOrderId === po.id) ? "Tercatat Ledger" : "Terverifikasi"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Scale className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Belum ada data transaksi</p>
              </div>
            )}
          </div>

          {/* Komoditas Breakdown */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-green-600" />
                Top Komoditas
              </h3>
              {topCommodities.length > 0 ? (
                <div className="space-y-3">
                  {topCommodities.map(([commodity, vol], i) => {
                    const max = topCommodities[0][1];
                    const crop = COMMODITY_LIST[commodity as Komoditas];
                    return (
                      <div key={commodity}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crop?.color || "#ccc" }} />
                            <span className="text-xs font-semibold text-gray-700">{commodity}</span>
                          </div>
                          <span className="text-[11px] font-bold text-gray-500">{(vol / 1000).toFixed(1)}t</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full transition-all duration-700"
                            style={{ width: `${(vol / max) * 100}%`, backgroundColor: crop?.color || "#16a34a" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-4">Belum ada data</p>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1">
                <Download className="w-4 h-4 text-green-600" />
                Export Dataset
              </h3>
              <select value={exportType} onChange={(e) => setExportType(e.target.value as ExportDataType)}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-green-500">
                <option value="preOrders">Transaksi (PO)</option>
                <option value="harvests">Data Panen</option>
                <option value="demands">Data Permintaan</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => window.open(`/api/export?format=csv&type=${exportType}`, "_blank")}
                  className="flex items-center justify-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => window.open(`/api/export?format=json&type=${exportType}`, "_blank")}
                  className="flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer">
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            </div>

            {/* AI QA card */}
            <button onClick={() => setShowQA(true)}
              className="w-full bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-2xl p-5 text-left transition-all shadow-sm hover:shadow-md cursor-pointer group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold mb-1">Tanya AI Pangan</p>
                  <p className="text-green-100/80 text-xs leading-relaxed">
                    Tanyakan data komoditas, harga, surplus wilayah, atau tren permintaan.
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:text-white transition-colors mt-0.5" />
              </div>
            </button>
          </div>
        </div>


        {/* ── HASH-CHAIN LEDGER ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-purple-600" />
              Hash-Chain Ledger
              <span className="text-[10px] text-gray-400 font-normal">(Tamper-Evident)</span>
            </h3>
            {ledgerChecked && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                chainBroken.length === 0
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {chainBroken.length === 0
                  ? `Rantai Valid — ${ledger.length} entri`
                  : `⚠ ${chainBroken.length} entri rusak`}
              </span>
            )}
          </div>

          {ledger.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-gray-700">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    <th className="px-6 py-3 text-left">Transaksi</th>
                    <th className="px-6 py-3 text-left">Prev Hash</th>
                    <th className="px-6 py-3 text-left">Current Hash</th>
                    <th className="px-6 py-3 text-right">Integritas</th>
                  </tr>
                </thead>
                <tbody>
                  {[...ledger].reverse().map((entry) => {
                    let parsed: Record<string, unknown> | null = null;
                    try { parsed = JSON.parse(entry.recordData); } catch { /* ignore */ }
                    const isBroken = chainBroken.includes(entry.id);
                    return (
                      <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <p className="font-semibold text-gray-800">
                            {parsed ? `${parsed.commodity} · ${Number(parsed.volumeKg || 0).toLocaleString("id-ID")} kg` : entry.preOrderId}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{entry.preOrderId}</p>
                        </td>
                        <td className="px-6 py-3.5 font-mono text-[10px] text-gray-400">{shortHash(entry.previousHash)}</td>
                        <td className="px-6 py-3.5 font-mono text-[10px] text-green-600 font-bold">{shortHash(entry.currentHash)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isBroken ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                          }`}>
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
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Fingerprint className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Ledger kosong</p>
              <p className="text-xs mt-1">Akan terisi saat PO diselesaikan</p>
            </div>
          )}
        </div>

        {/* ── FOOTER CTA ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-6 text-white flex items-center justify-between shadow-sm">
            <div>
              <p className="font-bold text-base mb-1">Petani atau Pembeli?</p>
              <p className="text-green-200 text-sm">Bergabung dan mulai transaksi transparan.</p>
            </div>
            <a href="/register"
              className="shrink-0 flex items-center gap-1.5 bg-white text-green-800 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-green-50 transition-colors">
              Daftar <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-bold text-base text-gray-900 mb-1">Verifikasi QR Lahan</p>
              <p className="text-gray-500 text-sm">Tempel ID lahan di URL: <span className="font-mono text-green-700">/public?trace=ID</span></p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-green-700" />
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-400 pb-4">
          Data bersifat publik dan transparan · Diperbarui secara real-time oleh sistem TaniLink
        </p>
      </div>

      {showQA && <QAInput onClose={() => setShowQA(false)} />}
    </div>
  );
}
