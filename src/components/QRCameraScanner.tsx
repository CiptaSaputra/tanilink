"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, X, Upload, ImageIcon, CheckCircle2, AlertTriangle } from "lucide-react";

interface QRCameraScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

type Mode = "camera" | "file";
type ScanState = "idle" | "loading" | "scanning" | "error";

/* ── Extract trace ID dari hasil scan ── */
function extractId(raw: string): string {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    return url.searchParams.get("trace") ?? trimmed;
  } catch {
    return trimmed;
  }
}

/* ── Scan QR dari ImageData via jsQR ── */
async function scanImageData(imageData: ImageData): Promise<string | null> {
  const jsQR = (await import("jsqr")).default;
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "attemptBoth",
  });
  return code ? code.data : null;
}

export default function QRCameraScanner({ onScan, onClose }: QRCameraScannerProps) {
  const [mode, setMode] = useState<Mode>("camera");

  /* ── Camera state ── */
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const [camState, setCamState] = useState<ScanState>("idle");
  const [camError, setCamError] = useState("");
  const [camResult, setCamResult] = useState("");

  /* ── File state ── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [fileState, setFileState] = useState<ScanState>("idle");
  const [fileError, setFileError] = useState("");
  const [fileResult, setFileResult] = useState("");

  /* ── Stop kamera ── */
  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  /* ── Start kamera & loop scan ── */
  const startCamera = async () => {
    stopCamera();
    setCamState("loading");
    setCamError("");
    setCamResult("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCamState("scanning");

      const tick = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2) {
          rafRef.current = requestAnimationFrame(tick);
          return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = await scanImageData(imageData);
        if (result) {
          stopCamera();
          setCamResult(result);
          setTimeout(() => onScan(extractId(result)), 800);
          return;
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setCamError("Gagal mengakses kamera. Izinkan akses kamera di browser (klik ikon kunci/kamera di address bar).");
      setCamState("error");
    }
  };

  /* ── File upload & scan ── */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileState("loading");
    setFileError("");
    setFileResult("");
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      const img = new Image();
      img.src = url;
      await new Promise<void>((res, rej) => {
        img.onload = () => res();
        img.onerror = () => rej();
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const result = await scanImageData(imageData);

      if (result) {
        setFileResult(result);
        setFileState("scanning");
        setTimeout(() => onScan(extractId(result)), 800);
      } else {
        setFileError("QR code tidak terdeteksi. Coba foto yang lebih jelas, lebih dekat, atau pastikan QR tidak terpotong.");
        setFileState("error");
      }
    } catch {
      setFileError("Gagal membaca gambar. Coba format lain (JPG/PNG).");
      setFileState("error");
    }
  };

  /* ── Lifecycle ── */
  useEffect(() => {
    if (mode === "camera") startCamera();
    else stopCamera();
    return stopCamera;
  }, [mode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-nat-border overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-nat-light-cream bg-nat-light-cream/50">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-nat-green" />
            <h3 className="text-sm font-bold text-nat-dark">Scan QR Code</h3>
          </div>
          <button onClick={() => { stopCamera(); onClose(); }}
            className="p-1.5 rounded-lg hover:bg-nat-border transition-colors cursor-pointer">
            <X className="w-4 h-4 text-nat-sage" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex border-b border-nat-light-cream">
          {(["camera", "file"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === m ? "bg-nat-green text-white" : "text-nat-sage hover:bg-nat-light-cream"
              }`}>
              {m === "camera" ? <><Camera className="w-3.5 h-3.5" /> Kamera</> : <><ImageIcon className="w-3.5 h-3.5" /> Upload Gambar</>}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-3">

          {/* ── MODE KAMERA ── */}
          {mode === "camera" && (
            <>
              {/* Preview video + overlay */}
              <div className="relative w-full aspect-square bg-slate-900 rounded-xl overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

                {/* Scan frame overlay */}
                {camState === "scanning" && !camResult && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-48 h-48">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-nat-green rounded-tl-sm" />
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-nat-green rounded-tr-sm" />
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-nat-green rounded-bl-sm" />
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-nat-green rounded-br-sm" />
                      {/* Laser line */}
                      <div className="absolute left-0 right-0 h-0.5 bg-nat-green/70 shadow-lg shadow-nat-green/50"
                        style={{ animation: "scanLine 2s linear infinite", top: "50%" }} />
                    </div>
                    <p className="absolute bottom-4 text-[11px] text-white/80 font-medium">
                      Arahkan ke QR code
                    </p>
                  </div>
                )}

                {/* Loading */}
                {camState === "loading" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900">
                    <Loader2 className="w-8 h-8 animate-spin text-nat-green" />
                    <p className="text-xs text-white/70">Meminta izin kamera...</p>
                  </div>
                )}

                {/* Error */}
                {camState === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 p-4 text-center">
                    <CameraOff className="w-10 h-10 text-red-400" />
                    <p className="text-xs text-white/80 leading-relaxed">{camError}</p>
                    <button onClick={startCamera}
                      className="text-xs text-nat-green font-bold hover:underline cursor-pointer">
                      Coba lagi →
                    </button>
                  </div>
                )}

                {/* Sukses */}
                {camResult && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-900/90">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                    <p className="text-sm text-white font-bold">QR Terdeteksi!</p>
                    <p className="text-[10px] text-emerald-300 font-mono px-4 text-center break-all">{camResult.slice(0, 40)}</p>
                  </div>
                )}
              </div>

              {/* Canvas hidden untuk scan */}
              <canvas ref={canvasRef} className="hidden" />

              {camState === "scanning" && !camResult && (
                <div className="bg-nat-light-cream rounded-xl p-2.5 text-[10px] text-nat-sage space-y-0.5">
                  <p>💡 Pastikan pencahayaan cukup terang</p>
                  <p>📏 Jarak optimal: 10–20 cm dari QR code</p>
                  <p>🔲 QR code harus penuh dalam kotak hijau</p>
                </div>
              )}

              <style>{`@keyframes scanLine { 0%{top:10%} 50%{top:90%} 100%{top:10%} }`}</style>
            </>
          )}

          {/* ── MODE UPLOAD ── */}
          {mode === "file" && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

              {/* Preview gambar */}
              {previewUrl ? (
                <div className="relative w-full aspect-square rounded-xl overflow-hidden border-2 border-nat-border">
                  <img src={previewUrl} alt="Preview QR" className="w-full h-full object-contain bg-gray-50" />
                  {fileState === "loading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                      <Loader2 className="w-8 h-8 animate-spin text-nat-green" />
                    </div>
                  )}
                  {fileResult && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-emerald-900/85">
                      <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                      <p className="text-sm text-white font-bold">QR Terdeteksi!</p>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-nat-border rounded-xl py-10 flex flex-col items-center gap-2.5 text-nat-sage hover:border-nat-green hover:text-nat-green transition-colors cursor-pointer">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm font-semibold">Upload foto/screenshot QR</span>
                  <span className="text-[11px]">JPG · PNG · Screenshot layar</span>
                </button>
              )}

              {previewUrl && fileState !== "loading" && !fileResult && (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 rounded-xl border border-nat-border text-xs font-semibold text-nat-sage hover:bg-nat-light-cream transition-colors cursor-pointer">
                  Ganti Gambar
                </button>
              )}

              {fileError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{fileError}</span>
                </div>
              )}

              {!previewUrl && (
                <div className="bg-nat-light-cream rounded-xl p-2.5 text-[10px] text-nat-sage space-y-0.5">
                  <p>💡 Screenshot QR dari modal petani (paling mudah)</p>
                  <p>📸 Foto langsung dari HP ke layar</p>
                  <p>🔲 Pastikan QR tidak terpotong dan tidak blur</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
