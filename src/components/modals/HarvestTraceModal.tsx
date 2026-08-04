/**
 * src/components/modals/HarvestTraceModal.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal QR Sertifikat & Lacak Batch Lahan.
 * Tiga tab: Info Lahan + QR | Timeline Batch | Riwayat Penyakit
 */
"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  X, QrCode, Leaf, Calendar, MapPin, Package,
  ShieldCheck, AlertTriangle, CheckCircle2, Clock,
  FileCheck, ExternalLink, Copy, Check,
  Truck, Warehouse, Flag, CircleDot,
} from "lucide-react";
import type { Harvest, PreOrder, DiseaseDetection, HarvestBatch } from "../../types";
import { COMMODITY_LIST } from "../../constants/commodities";
import { diseaseGetAll } from "../../services/diseaseService";
import { QRCodeSVG } from "qrcode.react";

interface HarvestTraceModalProps {
  harvest: Harvest | null;
  preOrders: PreOrder[];
  harvestBatches?: HarvestBatch[];
  onClose: () => void;
}

type Tab = "info" | "timeline" | "health";

/* ── Status badge ── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE:           "bg-emerald-100 text-emerald-700 border-emerald-200",
    MATCHED:          "bg-amber-100 text-amber-700 border-amber-200",
    HARVESTED:        "bg-blue-100 text-blue-700 border-blue-200",
    EXPIRED:          "bg-red-100 text-red-700 border-red-200",
    CONFIRMED:        "bg-emerald-100 text-emerald-700 border-emerald-200",
    COMPLETED:        "bg-purple-100 text-purple-700 border-purple-200",
    PENDING:          "bg-gray-100 text-gray-600 border-gray-200",
    CANCELLED:        "bg-red-100 text-red-700 border-red-200",
    READY:            "bg-sky-100 text-sky-700 border-sky-200",
    IN_TRANSIT:       "bg-amber-100 text-amber-700 border-amber-200",
    DELIVERED:        "bg-emerald-100 text-emerald-700 border-emerald-200",
    PICKED_UP_DIRECTLY: "bg-teal-100 text-teal-700 border-teal-200",
  };
  const labels: Record<string, string> = {
    ACTIVE: "Aktif", MATCHED: "Terhubung", HARVESTED: "Dipanen",
    EXPIRED: "Kedaluwarsa", CONFIRMED: "Dikonfirmasi", COMPLETED: "Selesai",
    PENDING: "Menunggu", CANCELLED: "Dibatalkan",
    READY: "Siap Dijemput", IN_TRANSIT: "Dalam Perjalanan",
    DELIVERED: "Terkirim", PICKED_UP_DIRECTLY: "Dijemput Langsung",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${styles[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {labels[status] ?? status}
    </span>
  );
}

/* ── Timeline step untuk satu batch ── */
const BATCH_STEPS: { status: string; label: string; icon: React.ReactNode }[] = [
  { status: "READY",            label: "Batch dibuat — Siap dijemput",      icon: <Warehouse className="w-3.5 h-3.5" /> },
  { status: "IN_TRANSIT",       label: "Dalam perjalanan ke titik kumpul",  icon: <Truck className="w-3.5 h-3.5" /> },
  { status: "DELIVERED",        label: "Terkirim ke titik kumpul",          icon: <Flag className="w-3.5 h-3.5" /> },
  { status: "PICKED_UP_DIRECTLY", label: "Dijemput langsung oleh pembeli",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

const statusOrder = ["READY", "IN_TRANSIT", "DELIVERED", "PICKED_UP_DIRECTLY"];

function BatchTimeline({ batch, pos }: { batch: HarvestBatch; pos: number }) {
  const currentIdx = statusOrder.indexOf(batch.status);
  const linkedPO = batch.preOrderId;

  return (
    <div className="bg-nat-light-cream/60 border border-nat-border rounded-2xl p-4">
      {/* Batch header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs font-bold text-nat-dark">
            Batch #{pos + 1} — {batch.commodity}
          </p>
          <p className="text-[10px] text-nat-sage font-mono">{batch.id}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={batch.status} />
          <p className="text-[9px] text-nat-sage">
            {batch.actualVolumeKg.toLocaleString("id-ID")} Kg ·{" "}
            Sisa {batch.shelfLifeDays} hari
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="relative">
        {/* connector line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-nat-border" />
        <div className="space-y-4">
          {BATCH_STEPS.filter(
            (s) => s.status !== "PICKED_UP_DIRECTLY" || batch.status === "PICKED_UP_DIRECTLY"
          ).map((step, i) => {
            const stepIdx = statusOrder.indexOf(step.status);
            const done    = stepIdx <= currentIdx;
            const active  = stepIdx === currentIdx;
            return (
              <div key={step.status} className="flex items-start gap-3 relative">
                {/* Dot */}
                <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                  active  ? "bg-nat-green border-nat-green text-white shadow-md"
                  : done  ? "bg-emerald-100 border-emerald-400 text-emerald-600"
                          : "bg-white border-nat-border text-nat-sage"
                }`}>
                  {done && !active
                    ? <CheckCircle2 className="w-3.5 h-3.5" />
                    : active
                      ? step.icon
                      : <CircleDot className="w-3 h-3" />
                  }
                </div>
                <div className="pt-0.5">
                  <p className={`text-xs font-semibold ${done ? "text-nat-dark" : "text-nat-sage"}`}>
                    {step.label}
                  </p>
                  {active && (
                    <p className="text-[10px] text-nat-green font-bold mt-0.5">← Status sekarang</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Linked PO */}
      {linkedPO && (
        <div className="mt-3 flex items-center gap-2 text-[10px] bg-white border border-nat-border rounded-xl px-3 py-2">
          <FileCheck className="w-3.5 h-3.5 text-nat-green shrink-0" />
          <span className="text-nat-sage">Terkait PO:</span>
          <span className="font-mono font-bold text-nat-dark">{linkedPO}</span>
        </div>
      )}

      {/* Priority score */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 bg-nat-border rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-1.5 rounded-full ${
              batch.priorityScore >= 70 ? "bg-red-500"
              : batch.priorityScore >= 40 ? "bg-amber-500"
              : "bg-nat-green"
            }`}
            style={{ width: `${batch.priorityScore}%` }}
          />
        </div>
        <span className={`text-[10px] font-bold ${
          batch.priorityScore >= 70 ? "text-red-600"
          : batch.priorityScore >= 40 ? "text-amber-600"
          : "text-nat-green"
        }`}>
          Prioritas {batch.priorityScore}
        </span>
      </div>
    </div>
  );
}

/* ── Isi modal ── */
function ModalContent({
  harvest, preOrders, harvestBatches = [], onClose,
}: HarvestTraceModalProps & { harvest: Harvest }) {
  const crop       = COMMODITY_LIST[harvest.commodity];
  const relatedPOs = preOrders.filter((po) => po.harvestId === harvest.id);
  const relatedBatches = harvestBatches.filter((b) => b.plantingId === harvest.id);

  const [diseases, setDiseases] = useState<DiseaseDetection[]>([]);
  const [copied,   setCopied]   = useState(false);
  const [tab,      setTab]      = useState<Tab>("info");

  const traceUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/public?trace=${harvest.id}`;

  const fingerprint = (() => {
    const raw = `${harvest.id}|${harvest.farmerId}|${harvest.commodity}|${harvest.plantingDate}|${harvest.expectedVolume}`;
    let h = 0;
    for (let i = 0; i < raw.length; i++) h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
    return Math.abs(h).toString(16).padStart(8, "0").toUpperCase();
  })();

  useEffect(() => {
    diseaseGetAll(harvest.id).then(setDiseases).catch(() => setDiseases([]));
  }, [harvest.id]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "info",     label: "Info & QR" },
    { id: "timeline", label: "Lacak Batch", count: relatedBatches.length },
    { id: "health",   label: "Kesehatan",   count: diseases.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-nat-border flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-nat-light-cream rounded-t-2xl shrink-0"
          style={{ background: `${crop?.color ?? "#5F7444"}12` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: crop?.color ?? "#5F7444" }}>
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-nat-dark">Sertifikat Lahan — {harvest.commodity}</h3>
              <p className="text-[10px] text-nat-sage font-mono">ID: {harvest.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-nat-light-cream transition-colors cursor-pointer">
            <X className="w-4 h-4 text-nat-sage" />
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex border-b border-nat-light-cream px-6 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative py-2.5 px-3 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                tab === t.id
                  ? "text-nat-green border-b-2 border-nat-green -mb-px"
                  : "text-nat-sage hover:text-nat-dark"
              }`}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                  tab === t.id ? "bg-nat-green text-white" : "bg-nat-border text-nat-sage"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── TAB: INFO & QR ── */}
          {tab === "info" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                {/* QR */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="bg-white p-3 rounded-xl border-2 border-nat-border shadow-sm">
                    <QRCodeSVG value={traceUrl} size={140} fgColor="#1B2B1E" bgColor="#FFFFFF" level="M" includeMargin={false} />
                  </div>
                  <p className="text-[9px] text-nat-sage text-center leading-tight max-w-[140px]">Scan untuk verifikasi publik</p>
                  <button
                    onClick={() => navigator.clipboard.writeText(traceUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
                    className="flex items-center gap-1.5 text-[10px] text-nat-green hover:text-nat-green-hover font-semibold cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Tersalin!" : "Salin Link"}
                  </button>
                </div>

                {/* Info grid */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: <Package className="w-3.5 h-3.5" />, label: "Komoditas",    val: harvest.commodity },
                      { icon: <Leaf className="w-3.5 h-3.5" />,    label: "Luas Lahan",   val: `${harvest.landArea} Ha` },
                      { icon: <Calendar className="w-3.5 h-3.5" />, label: "Tgl Tanam",   val: harvest.plantingDate },
                      { icon: <Calendar className="w-3.5 h-3.5" />, label: "Est. Panen",  val: harvest.expectedHarvestDate },
                      { icon: <Package className="w-3.5 h-3.5" />,  label: "Est. Volume", val: `${harvest.expectedVolume.toLocaleString("id-ID")} Kg` },
                      { icon: <MapPin className="w-3.5 h-3.5" />,   label: "Wilayah",     val: harvest.region },
                    ].map((item) => (
                      <div key={item.label} className="bg-nat-light-cream rounded-xl p-3 border border-nat-border">
                        <p className="text-[9px] text-nat-sage font-semibold uppercase tracking-wider flex items-center gap-1 mb-0.5">
                          <span className="text-nat-green">{item.icon}</span>{item.label}
                        </p>
                        <p className="text-xs font-bold text-nat-dark">{item.val}</p>
                      </div>
                    ))}
                  </div>

                  {harvest.weatherRiskLevel && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
                      harvest.weatherRiskLevel === "LOW" ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : harvest.weatherRiskLevel === "MEDIUM" ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-red-50 border-red-200 text-red-700"
                    }`}>
                      {harvest.weatherRiskLevel === "LOW" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                      Risiko Cuaca: {harvest.weatherRiskLevel === "LOW" ? "Rendah" : harvest.weatherRiskLevel === "MEDIUM" ? "Sedang" : "Tinggi"}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <StatusBadge status={harvest.status} />
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-nat-sage">
                      <ShieldCheck className="w-3.5 h-3.5 text-nat-green" />
                      <span>Fingerprint: <span className="text-nat-dark font-bold">{fingerprint}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PO terkait */}
              {relatedPOs.length > 0 && (
                <div className="border-t border-nat-light-cream pt-4">
                  <h4 className="text-xs font-bold text-nat-dark flex items-center gap-1.5 mb-3">
                    <FileCheck className="w-3.5 h-3.5 text-nat-green" />
                    Kontrak PO ({relatedPOs.length})
                  </h4>
                  <div className="space-y-2">
                    {relatedPOs.map((po) => (
                      <div key={po.id} className="flex items-center justify-between bg-nat-light-cream rounded-xl px-4 py-3 border border-nat-border">
                        <div>
                          <p className="text-xs font-bold text-nat-dark">{po.buyerName}</p>
                          <p className="text-[10px] text-nat-text mt-0.5">
                            {po.agreedVolumeKg.toLocaleString("id-ID")} Kg · Rp{po.agreedPricePerKg.toLocaleString("id-ID")}/Kg
                          </p>
                        </div>
                        <StatusBadge status={po.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={`/public?trace=${harvest.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-nat-green text-nat-green text-xs font-bold hover:bg-nat-green hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Buka Halaman Verifikasi Publik
              </a>
            </div>
          )}

          {/* ── TAB: TIMELINE BATCH ── */}
          {tab === "timeline" && (
            <div className="space-y-4">
              {relatedBatches.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Truck className="w-10 h-10 text-nat-border mx-auto" />
                  <p className="text-sm font-semibold text-nat-dark">Belum ada batch distribusi</p>
                  <p className="text-xs text-nat-sage">Batch dibuat setelah petani menandai panen selesai (tombol "Siap Kirim" di tabel lahan).</p>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-nat-sage">
                    {relatedBatches.length} batch terdaftar untuk lahan ini. Scan QR untuk lacak secara publik.
                  </p>
                  {relatedBatches.map((b, i) => (
                    <BatchTimeline key={b.id} batch={b} pos={i} />
                  ))}
                </>
              )}
            </div>
          )}

          {/* ── TAB: RIWAYAT KESEHATAN ── */}
          {tab === "health" && (
            <div className="space-y-3">
              {diseases.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <p className="text-sm font-semibold text-nat-dark">Tidak ada rekam penyakit</p>
                  <p className="text-xs text-nat-sage">Belum ada deteksi penyakit untuk lahan ini. Foto tanaman lewat fitur Deteksi AI untuk memulai rekam jejak.</p>
                </div>
              ) : (
                diseases.map((d) => {
                  const isHealthy =
                    d.detectedCondition.toLowerCase().includes("sehat") ||
                    d.detectedCondition.toLowerCase().includes("healthy");
                  return (
                    <div
                      key={d.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs ${
                        isHealthy ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                      }`}
                    >
                      {d.imageBase64 && (
                        <img src={d.imageBase64} alt="Foto daun" className="w-14 h-14 object-cover rounded-xl border border-white/70 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 font-bold mb-0.5">
                          {isHealthy
                            ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            : <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          }
                          <span className={isHealthy ? "text-emerald-800" : "text-amber-900"}>
                            {d.detectedCondition}
                          </span>
                          <span className="text-[10px] opacity-60 font-normal">({Math.round(d.confidenceScore * 100)}%)</span>
                        </div>
                        <p className="text-[10px] text-nat-sage flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(d.detectedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {d.volumeAdjustmentPct > 0 && (
                          <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                            ⚠ Volume dikoreksi -{Math.round(d.volumeAdjustmentPct * 100)}%
                          </p>
                        )}
                        {d.solution && (
                          <p className="text-[10px] text-nat-text mt-1 leading-relaxed line-clamp-3">💡 {d.solution}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function HarvestTraceModal(props: HarvestTraceModalProps) {
  if (typeof window === "undefined" || !props.harvest) return null;
  return createPortal(
    <AnimatePresence>
      {props.harvest && <ModalContent {...props} harvest={props.harvest} />}
    </AnimatePresence>,
    document.body
  );
}
