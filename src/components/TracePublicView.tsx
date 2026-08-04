/**
 * src/components/TracePublicView.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Halaman verifikasi publik — dapat diakses tanpa login via /public?trace=<id>.
 * Menampilkan: info lahan, timeline batch, riwayat penyakit, PO summary.
 * Data diambil dari GET /api/trace/:id
 */
"use client";

import React, { useEffect, useState } from "react";
import {
  Leaf, Package, Calendar, MapPin, ShieldCheck, AlertTriangle,
  CheckCircle2, Clock, FileCheck, Truck, Warehouse, Flag,
  CircleDot, ArrowLeft, Loader2, QrCode, ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

/* ── Types dari API response ── */
interface TraceHarvest {
  id: string; farmerName: string; commodity: string; landArea: number;
  expectedVolume: number; askingPrice: number; region: string;
  plantingDate: string; expectedHarvestDate: string;
  weatherRiskLevel?: string; status: string; notes?: string;
}
interface BatchEvent { status: string; label: string; ts: string; }
interface TraceBatch {
  batchId: string; commodity: string; actualVolumeKg: number;
  harvestDate: string; shelfLifeDays: number; priorityScore: number;
  currentStatus: string; preOrderId?: string; events: BatchEvent[];
}
interface TracePO {
  id: string; buyerName: string; commodity: string;
  agreedVolumeKg: number; agreedPricePerKg: number;
  status: string; createdAt: string;
}
interface TraceDisease {
  id: string; detectedCondition: string; confidenceScore: number;
  volumeAdjustmentPct: number; solution?: string; detectedAt: string;
}
interface TraceData {
  harvest: TraceHarvest; batches: TraceBatch[];
  preOrders: TracePO[]; diseaseDetections: TraceDisease[];
  fingerprint: string; verifiedAt: string;
}

/* ── Status badge ── */
function Badge({ status }: { status: string }) {
  const s: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    MATCHED: "bg-amber-100 text-amber-700",
    HARVESTED: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-purple-100 text-purple-700",
    PENDING: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-700",
    READY: "bg-sky-100 text-sky-700",
    IN_TRANSIT: "bg-amber-100 text-amber-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    PICKED_UP_DIRECTLY: "bg-teal-100 text-teal-700",
  };
  const l: Record<string, string> = {
    ACTIVE: "Aktif", MATCHED: "Terhubung", HARVESTED: "Dipanen",
    CONFIRMED: "Dikonfirmasi", COMPLETED: "Selesai",
    PENDING: "Menunggu", CANCELLED: "Dibatalkan",
    READY: "Siap Dijemput", IN_TRANSIT: "Dalam Perjalanan",
    DELIVERED: "Terkirim", PICKED_UP_DIRECTLY: "Dijemput Langsung",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${s[status] ?? "bg-gray-100 text-gray-600"}`}>
      {l[status] ?? status}
    </span>
  );
}

/* ── Timeline step ── */
const STEPS = [
  { status: "READY",              label: "Batch dibuat",              icon: <Warehouse className="w-4 h-4" /> },
  { status: "IN_TRANSIT",         label: "Dalam perjalanan",          icon: <Truck className="w-4 h-4" /> },
  { status: "DELIVERED",          label: "Terkirim ke titik kumpul",  icon: <Flag className="w-4 h-4" /> },
  { status: "PICKED_UP_DIRECTLY", label: "Dijemput langsung",         icon: <CheckCircle2 className="w-4 h-4" /> },
];
const ORDER = ["READY", "IN_TRANSIT", "DELIVERED", "PICKED_UP_DIRECTLY"];

function BatchCard({ batch, idx }: { batch: TraceBatch; idx: number }) {
  const cur = ORDER.indexOf(batch.currentStatus);
  const showPKD = batch.currentStatus === "PICKED_UP_DIRECTLY";

  return (
    <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-nat-dark">Batch #{idx + 1} — {batch.commodity}</p>
          <p className="text-[10px] text-nat-sage font-mono mt-0.5">{batch.batchId}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge status={batch.currentStatus} />
          <p className="text-[10px] text-nat-sage">
            {batch.actualVolumeKg.toLocaleString("id-ID")} Kg · {batch.shelfLifeDays} hari sisa
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative pl-8">
        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-nat-border" />
        <div className="space-y-5">
          {STEPS.filter((s) => s.status !== "PICKED_UP_DIRECTLY" || showPKD).map((step) => {
            const si    = ORDER.indexOf(step.status);
            const done  = si <= cur;
            const active = si === cur;
            return (
              <div key={step.status} className="flex items-start gap-3 relative">
                <div className={`absolute left-[-22px] top-0 w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0 ${
                  active ? "bg-nat-green border-nat-green text-white shadow-md"
                  : done  ? "bg-emerald-50 border-emerald-400 text-emerald-600"
                          : "bg-white border-nat-border text-nat-sage"
                }`}>
                  {done && !active ? <CheckCircle2 className="w-3.5 h-3.5" /> : active ? step.icon : <CircleDot className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${done ? "text-nat-dark" : "text-nat-sage"}`}>{step.label}</p>
                  {active && <p className="text-[11px] text-nat-green font-bold">← Status sekarang</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority bar */}
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[10px] text-nat-sage font-semibold w-16 shrink-0">Prioritas</span>
        <div className="flex-1 bg-nat-border rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full ${batch.priorityScore >= 70 ? "bg-red-500" : batch.priorityScore >= 40 ? "bg-amber-500" : "bg-nat-green"}`}
            style={{ width: `${batch.priorityScore}%` }}
          />
        </div>
        <span className={`text-[11px] font-bold w-6 text-right ${batch.priorityScore >= 70 ? "text-red-600" : batch.priorityScore >= 40 ? "text-amber-600" : "text-nat-green"}`}>
          {batch.priorityScore}
        </span>
      </div>

      {batch.preOrderId && (
        <div className="mt-3 flex items-center gap-2 text-[10px] bg-nat-light-cream border border-nat-border rounded-xl px-3 py-2">
          <FileCheck className="w-3.5 h-3.5 text-nat-green" />
          <span className="text-nat-sage">Terkait PO:</span>
          <span className="font-mono font-bold text-nat-dark">{batch.preOrderId}</span>
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
interface Props { harvestId: string; onBack: () => void; }

export default function TracePublicView({ harvestId, onBack }: Props) {
  const [data,    setData]    = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState<"info" | "batch" | "health">("info");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/trace/${encodeURIComponent(harvestId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Gagal memuat data. Coba lagi."))
      .finally(() => setLoading(false));
  }, [harvestId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-10 h-10 text-nat-green animate-spin" />
        <p className="text-sm text-nat-sage">Memuat data verifikasi...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400" />
        <p className="text-sm font-bold text-nat-dark">Data tidak ditemukan</p>
        <p className="text-xs text-nat-sage max-w-sm">{error || "Pastikan ID lahan benar atau QR code masih valid."}</p>
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-nat-green font-semibold hover:underline cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard Publik
        </button>
      </div>
    );
  }

  const { harvest, batches, preOrders, diseaseDetections, fingerprint, verifiedAt } = data;
  const traceUrl = typeof window !== "undefined" ? window.location.href : "";

  const TABS = [
    { id: "info"   as const, label: "Info Lahan" },
    { id: "batch"  as const, label: `Lacak Batch (${batches.length})` },
    { id: "health" as const, label: `Kesehatan (${diseaseDetections.length})` },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs text-nat-sage hover:text-nat-dark font-semibold cursor-pointer transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
      </button>

      {/* Hero card */}
      <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nat-green flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-nat-dark">Sertifikat Lahan Terverifikasi</h2>
              <p className="text-[10px] text-nat-sage font-mono mt-0.5">{harvest.id}</p>
            </div>
          </div>
          <Badge status={harvest.status} />
        </div>

        {/* Verified stamp */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-emerald-700">Terverifikasi oleh TaniLink</p>
            <p className="text-[10px] text-emerald-600 font-mono">
              Fingerprint: {fingerprint} · {new Date(verifiedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* QR */}
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl border-2 border-nat-border shadow-sm shrink-0">
            <QRCodeSVG value={traceUrl} size={80} fgColor="#1B2B1E" bgColor="#FFFFFF" level="M" includeMargin={false} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-nat-dark">{harvest.farmerName}</p>
            <p className="text-xs text-nat-sage">{harvest.commodity} · {harvest.region}</p>
            <p className="text-[10px] text-nat-sage">Lahan {harvest.landArea} Ha · Est. {harvest.expectedVolume.toLocaleString("id-ID")} Kg</p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="flex bg-white border border-nat-border rounded-2xl overflow-hidden">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
              tab === t.id ? "bg-nat-green text-white" : "text-nat-sage hover:text-nat-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === "info" && (
        <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Package className="w-4 h-4" />, label: "Komoditas",    val: harvest.commodity },
              { icon: <Leaf className="w-4 h-4" />,    label: "Luas Lahan",   val: `${harvest.landArea} Ha` },
              { icon: <Calendar className="w-4 h-4" />, label: "Tgl Tanam",   val: harvest.plantingDate },
              { icon: <Calendar className="w-4 h-4" />, label: "Est. Panen",  val: harvest.expectedHarvestDate },
              { icon: <Package className="w-4 h-4" />,  label: "Est. Volume", val: `${harvest.expectedVolume.toLocaleString("id-ID")} Kg` },
              { icon: <MapPin className="w-4 h-4" />,   label: "Wilayah",     val: harvest.region },
            ].map((item) => (
              <div key={item.label} className="bg-nat-light-cream rounded-xl p-3 border border-nat-border">
                <p className="text-[10px] text-nat-sage font-semibold uppercase tracking-wider flex items-center gap-1 mb-1">
                  <span className="text-nat-green">{item.icon}</span>{item.label}
                </p>
                <p className="text-sm font-bold text-nat-dark">{item.val}</p>
              </div>
            ))}
          </div>

          {harvest.weatherRiskLevel && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border ${
              harvest.weatherRiskLevel === "LOW" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : harvest.weatherRiskLevel === "MEDIUM" ? "bg-amber-50 border-amber-200 text-amber-700"
              : "bg-red-50 border-red-200 text-red-700"
            }`}>
              {harvest.weatherRiskLevel === "LOW" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              Risiko Cuaca: {harvest.weatherRiskLevel === "LOW" ? "Rendah" : harvest.weatherRiskLevel === "MEDIUM" ? "Sedang" : "Tinggi"}
            </div>
          )}

          {preOrders.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-nat-dark flex items-center gap-1.5 mb-3">
                <FileCheck className="w-3.5 h-3.5 text-nat-green" /> Kontrak PO ({preOrders.length})
              </h4>
              <div className="space-y-2">
                {preOrders.map((po) => (
                  <div key={po.id} className="flex items-center justify-between bg-nat-light-cream rounded-xl px-4 py-3 border border-nat-border">
                    <div>
                      <p className="text-xs font-bold text-nat-dark">{po.buyerName}</p>
                      <p className="text-[10px] text-nat-text">
                        {po.agreedVolumeKg.toLocaleString("id-ID")} Kg · Rp{po.agreedPricePerKg.toLocaleString("id-ID")}/Kg
                      </p>
                    </div>
                    <Badge status={po.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Batch Timeline */}
      {tab === "batch" && (
        <div className="space-y-4">
          {batches.length === 0 ? (
            <div className="bg-white rounded-2xl border border-nat-border p-8 text-center space-y-3 shadow-sm">
              <Truck className="w-10 h-10 text-nat-border mx-auto" />
              <p className="text-sm font-bold text-nat-dark">Belum ada batch distribusi</p>
              <p className="text-xs text-nat-sage">Batch akan muncul setelah petani menandai panen selesai.</p>
            </div>
          ) : (
            batches.map((b, i) => <BatchCard key={b.batchId} batch={b} idx={i} />)
          )}
        </div>
      )}

      {/* Tab: Kesehatan */}
      {tab === "health" && (
        <div className="space-y-3">
          {diseaseDetections.length === 0 ? (
            <div className="bg-white rounded-2xl border border-nat-border p-8 text-center space-y-3 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-nat-dark">Tidak ada rekam penyakit</p>
              <p className="text-xs text-nat-sage">Belum ada deteksi penyakit untuk lahan ini.</p>
            </div>
          ) : (
            diseaseDetections.map((d) => {
              const isHealthy =
                d.detectedCondition.toLowerCase().includes("sehat") ||
                d.detectedCondition.toLowerCase().includes("healthy");
              return (
                <div
                  key={d.id}
                  className={`bg-white rounded-2xl border p-4 shadow-sm space-y-2 ${
                    isHealthy ? "border-emerald-200" : "border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isHealthy
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    }
                    <span className={`text-sm font-bold ${isHealthy ? "text-emerald-800" : "text-amber-900"}`}>
                      {d.detectedCondition}
                    </span>
                    <span className="ml-auto text-xs font-bold text-nat-sage">
                      {Math.round(d.confidenceScore * 100)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-nat-sage flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(d.detectedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {d.volumeAdjustmentPct > 0 && (
                    <p className="text-xs text-amber-700 font-semibold">⚠ Volume dikoreksi -{Math.round(d.volumeAdjustmentPct * 100)}%</p>
                  )}
                  {d.solution && (
                    <p className="text-xs text-nat-text leading-relaxed">💡 {d.solution}</p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Footer */}
      <div className="bg-nat-light-cream rounded-2xl border border-nat-border p-4 text-center">
        <p className="text-[11px] text-nat-sage">
          Data ini diverifikasi secara otomatis oleh TaniLink · Sertifikat diterbitkan untuk kepentingan transparansi rantai pasok.
        </p>
        <a href="/login" className="mt-2 inline-flex items-center gap-1.5 text-xs text-nat-green font-bold hover:underline">
          <ExternalLink className="w-3 h-3" /> Masuk untuk melihat lebih lengkap
        </a>
      </div>
    </div>
  );
}
