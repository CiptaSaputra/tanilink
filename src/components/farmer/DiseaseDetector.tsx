/**
 * src/components/farmer/DiseaseDetector.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Deteksi penyakit tanaman dari foto daun — terhubung ke API ml-tumbu
 * (FastAPI + ResNet9 / Gemini) via proxy /api/disease-detections/predict.
 *
 * Fitur:
 *  • Health check otomatis saat mount — tampilkan status ML server
 *  • Upload + preview foto
 *  • Hasil: semua prediksi (bukan hanya top-1) dengan confidence bar
 *  • Mode Gemini (analisis naratif mendalam) vs mode ML lokal
 *  • Simpan ke DB + koreksi estimasi volume panen
 *  • Riwayat deteksi untuk lahan ini
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  ImageIcon,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  History,
  Clock,
} from "lucide-react";
import {
  predictDisease,
  computeVolumeAdjustment,
  type DiseaseResult,
} from "../../utils/disease";
import { diseaseAdd, diseaseGetAll } from "../../services";
import type { Harvest, DiseaseDetection } from "../../types";

interface DiseaseDetectorProps {
  harvest: Harvest | undefined;
  onVolumeAdjust?: (adjustmentPct: number) => void;
}

type MLStatus = "checking" | "online" | "offline" | "unknown";

export const DiseaseDetector: React.FC<DiseaseDetectorProps> = ({
  harvest,
  onVolumeAdjust,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── State ── */
  const [imageData, setImageData] = useState<string>("");
  const [result, setResult] = useState<DiseaseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [mlStatus, setMlStatus] = useState<MLStatus>("checking");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<DiseaseDetection[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showAllPredictions, setShowAllPredictions] = useState(false);

  /* ── Health check + wake up Railway saat mount ── */
  useEffect(() => {
    setMlStatus("checking");

    // Hit Railway langsung untuk wake up (production) atau proxy (lokal)
    const isProduction = typeof window !== "undefined" &&
      !window.location.hostname.includes("localhost");
    const healthUrl = isProduction
      ? "https://tanilink-app-production.up.railway.app/health"
      : "/api/disease-detections/predict";

    fetch(healthUrl, { method: "GET", signal: AbortSignal.timeout(35000) })
      .then((r) => {
        if (r.ok) setMlStatus("online");
        else setMlStatus("offline");
      })
      .catch(() => setMlStatus("offline"));
  }, []);

  /* ── Load history saat harvest berubah ── */
  useEffect(() => {
    if (!harvest) { setHistory([]); return; }
    setLoadingHistory(true);
    diseaseGetAll(harvest.id)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [harvest?.id]);

  /* ── File handler ── */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG/PNG/WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran gambar maksimal 5MB.");
      return;
    }
    setError("");
    setResult(null);
    setSaved(false);
    setShowAllPredictions(false);
    const reader = new FileReader();
    reader.onload = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  /* ── Deteksi ── */
  const handleDetect = async () => {
    if (!imageData || loading) return;
    setLoading(true);
    setError("");
    setSaved(false);
    setShowAllPredictions(false);

    const res = await predictDisease(imageData);
    setLoading(false);

    if (!res) {
      setError(
        mlStatus === "offline"
          ? "ML server offline. Jalankan: cd ml-tumbu-main && uvicorn app:app --port 8000"
          : "Gagal menghubungi API. Coba lagi."
      );
      return;
    }

    if (!res.is_plant) {
      setError(res.warning ?? "Gambar tidak terdeteksi sebagai foto tanaman.");
      setResult(res);
      return;
    }

    setResult(res);
    const adjust = computeVolumeAdjustment(res);
    onVolumeAdjust?.(adjust);

    if (harvest) {
      const top = res.predictions?.[0];
      await diseaseAdd({
        plantingId: harvest.id,
        detectedCondition: top?.disease ?? "Tidak diketahui",
        confidenceScore: top?.confidence ?? 0,
        volumeAdjustmentPct: adjust,
        solution: top?.solution,
        imageBase64: imageData,
      });
      setSaved(true);
      // Refresh history
      diseaseGetAll(harvest.id).then(setHistory).catch(() => {});
    }
  };

  /* ── Reset ── */
  const handleReset = () => {
    setImageData("");
    setResult(null);
    setError("");
    setSaved(false);
    setShowAllPredictions(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const top = result?.predictions?.[0];
  const isHealthy =
    top?.disease_key?.toLowerCase().includes("healthy") ||
    top?.disease?.toLowerCase().includes("sehat");
  // Gemini & OpenRouter sama-sama analisis naratif mendalam
  const isVisionAI =
    result?.mode === "gemini_primary" || result?.mode === "openrouter_vision";
  const analysisText = result?.gemini_analysis || top?.solution || "";
  const providerLabel =
    result?.mode === "gemini_primary"
      ? "🤖 Dianalisis oleh Gemini AI"
      : result?.mode === "openrouter_vision"
        ? "🤖 Dianalisis oleh AI Vision (OpenRouter)"
        : result?.mode === "color_analysis"
          ? "🎨 Analisis warna (fallback demo)"
          : "🔬 Model ResNet9 (lokal)";

  return (
    <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-nat-light-cream">
        <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-nat-brown" />
          Deteksi Penyakit Tanaman (AI)
        </h3>
        <div className="flex items-center gap-2">
          {/* ML Server status badge */}
          <span
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
              mlStatus === "online"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : mlStatus === "offline"
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-gray-50 text-gray-500 border-gray-200"
            }`}
          >
            {mlStatus === "online" ? (
              <Wifi className="w-3 h-3" />
            ) : mlStatus === "offline" ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            {mlStatus === "online"
              ? "ML Online"
              : mlStatus === "offline"
                ? "ML Offline"
                : "Cek..."}
          </span>
          <span className="text-[10px] text-nat-sage">
            {harvest ? harvest.commodity : "Pilih lahan"}
          </span>
        </div>
      </div>

      {/* ── Offline hint ── */}
      {mlStatus === "offline" && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
          <p className="font-bold mb-1">⚠ ML Server tidak aktif</p>
          <p className="font-mono text-[10px] bg-amber-100 px-2 py-1 rounded mt-1">
            cd ml-tumbu-main &amp;&amp; uvicorn app:app --port 8000
          </p>
        </div>
      )}

      <p className="text-[11px] text-nat-sage mb-3">
        Foto daun atau bagian tanaman yang dicurigai sakit. AI akan
        mendiagnosis dan otomatis menyesuaikan estimasi volume panen.
      </p>

      {/* ── Upload area ── */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        className="hidden"
      />

      {imageData ? (
        <div className="flex items-start gap-3 mb-3 p-3 bg-nat-light-cream rounded-xl border border-nat-border">
          <div className="relative shrink-0">
            <img
              src={imageData}
              alt="Foto tanaman"
              className="w-24 h-24 object-cover rounded-xl border border-nat-border"
            />
            <button
              onClick={handleReset}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-[11px] text-nat-text font-semibold">
              Foto siap dianalisis
            </p>
            <button
              onClick={handleDetect}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-nat-green hover:bg-nat-green-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg text-[11px] transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  Deteksi Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-nat-border rounded-xl py-8 flex flex-col items-center gap-2 text-nat-sage hover:border-nat-green hover:text-nat-green transition-colors cursor-pointer mb-3"
        >
          <ImageIcon className="w-8 h-8" />
          <span className="text-xs font-semibold">
            Klik untuk upload foto daun/tanaman
          </span>
          <span className="text-[10px]">JPG · PNG · WebP · Maks 5MB</span>
        </button>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Hasil Deteksi ── */}
      {result && result.is_plant && top && (
        <div className="space-y-3">
          {/* Diagnosis utama */}
          <div
            className={`p-4 rounded-xl border ${
              isHealthy
                ? "bg-emerald-50 border-emerald-200"
                : "bg-amber-50 border-amber-200"
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm mb-1">
              {isHealthy ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span className={isHealthy ? "text-emerald-800" : "text-amber-900"}>
                {top.disease}
              </span>
              <span
                className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                  isHealthy
                    ? "bg-emerald-200 text-emerald-700"
                    : "bg-amber-200 text-amber-700"
                }`}
              >
                {Math.round(top.confidence * 100)}%
              </span>
            </div>

            {/* Mode badge */}
            <p className="text-[10px] font-semibold mb-2 opacity-60">
              {providerLabel}
            </p>

            {/* Confidence bar */}
            <div className="w-full bg-white/60 rounded-full h-1.5 mb-3">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  isHealthy ? "bg-emerald-500" : "bg-amber-500"
                }`}
                style={{ width: `${Math.round(top.confidence * 100)}%` }}
              />
            </div>

            {/* Analisis mendalam (Gemini / OpenRouter) */}
            {isVisionAI && analysisText ? (
              <div className="text-[11px] text-amber-900 leading-relaxed whitespace-pre-line max-h-80 overflow-y-auto">
                {analysisText}
              </div>
            ) : top.solution ? (
              <p className="text-[11px] text-amber-900 leading-relaxed whitespace-pre-line">
                💡 {top.solution}
              </p>
            ) : null}

            {/* Volume adjustment notice */}
            {!isHealthy && harvest && (
              <div className="mt-2 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                ⚠ Estimasi volume panen dikoreksi -{Math.round(computeVolumeAdjustment(result) * 100)}%
              </div>
            )}

            {saved && harvest && (
              <p className="mt-2 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Tersimpan ke riwayat lahan {harvest.commodity}
              </p>
            )}
          </div>

          {/* Prediksi lain (toggle) — hanya mode ML lokal multi-class */}
          {!isVisionAI && result.predictions.length > 1 && (
            <div>
              <button
                onClick={() => setShowAllPredictions((v) => !v)}
                className="flex items-center gap-1.5 text-[11px] text-nat-green font-semibold hover:underline cursor-pointer"
              >
                {showAllPredictions ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
                {showAllPredictions
                  ? "Sembunyikan"
                  : `Lihat ${result.predictions.length - 1} kemungkinan lain`}
              </button>
              {showAllPredictions && (
                <div className="mt-2 space-y-2">
                  {result.predictions.slice(1).map((pred, i) => {
                    const h =
                      pred.disease_key?.toLowerCase().includes("healthy") ||
                      pred.disease?.toLowerCase().includes("sehat");
                    return (
                      <div
                        key={i}
                        className="bg-nat-light-cream rounded-xl p-3 border border-nat-border"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-nat-dark">
                            {pred.disease}
                          </span>
                          <span className="text-[10px] font-bold text-nat-sage">
                            {Math.round(pred.confidence * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-nat-border rounded-full h-1">
                          <div
                            className={`h-1 rounded-full ${h ? "bg-emerald-400" : "bg-nat-brown"}`}
                            style={{
                              width: `${Math.round(pred.confidence * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Riwayat Deteksi ── */}
      <div className="mt-4 border-t border-nat-light-cream pt-3">
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="flex items-center justify-between w-full text-[11px] font-bold text-nat-dark hover:text-nat-green transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Riwayat Deteksi {harvest ? `(${history.length})` : ""}
          </span>
          {showHistory ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showHistory && (
          <div className="mt-2 space-y-2">
            {loadingHistory ? (
              <div className="flex items-center gap-2 text-[11px] text-nat-sage py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Memuat riwayat...
              </div>
            ) : history.length === 0 ? (
              <p className="text-[11px] text-nat-sage italic py-2">
                {harvest
                  ? "Belum ada riwayat deteksi untuk lahan ini."
                  : "Pilih lahan untuk melihat riwayat."}
              </p>
            ) : (
              history.map((d) => {
                const isH =
                  d.detectedCondition.toLowerCase().includes("sehat") ||
                  d.detectedCondition.toLowerCase().includes("healthy");
                return (
                  <div
                    key={d.id}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-[11px] ${
                      isH
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    {d.imageBase64 && (
                      <img
                        src={d.imageBase64}
                        alt=""
                        className="w-10 h-10 object-cover rounded-lg shrink-0 border border-white/70"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 font-bold">
                        {isH ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        )}
                        <span className={isH ? "text-emerald-800" : "text-amber-900"}>
                          {d.detectedCondition}
                        </span>
                        <span className="text-[10px] opacity-60 ml-auto">
                          {Math.round(d.confidenceScore * 100)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-nat-sage flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(d.detectedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {d.volumeAdjustmentPct > 0 && (
                        <p className="text-[10px] text-amber-700 font-semibold mt-0.5">
                          Volume dikoreksi -{Math.round(d.volumeAdjustmentPct * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
