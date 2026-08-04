"use client";

/**
 * QRCameraScanner — scan QR code via kamera ATAU upload gambar
 * Menggunakan html5-qrcode library.
 */

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, X, Upload, ImageIcon } from "lucide-react";

interface QRCameraScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

type Mode = "camera" | "file";

export default function QRCameraScanner({ onScan, onClose }: QRCameraScannerProps) {
  const scannerRef = useRef<InstanceType<typeof import("html5-qrcode")["Html5Qrcode"]> | null>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [mode, setMode] = useState<Mode>("camera");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerId = "qr-camera-reader";

  /* ── Start kamera ── */
  const startCamera = async () => {
    try {
      setStatus("loading");
      setErrorMsg("");

      const { Html5Qrcode } = await import("html5-qrcode");
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
      }

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setErrorMsg("Tidak ada kamera yang ditemukan di perangkat ini.");
        setStatus("error");
        return;
      }

      // Pilih kamera belakang (HP) atau yang pertama (MacBook)
      const camera =
        cameras.find((c) =>
          c.label.toLowerCase().includes("back") ||
          c.label.toLowerCase().includes("rear") ||
          c.label.toLowerCase().includes("environment")
        ) ?? cameras[0];

      await scanner.start(
        camera.id,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          videoConstraints: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        (decodedText) => {
          scanner.stop().catch(() => {});
          handleResult(decodedText);
        },
        () => {}
      );

      setStatus("scanning");
    } catch {
      setErrorMsg(
        "Gagal mengakses kamera. Pastikan izin kamera sudah diberikan di browser (klik ikon kamera/kunci di address bar)."
      );
      setStatus("error");
    }
  };

  /* ── Parse & callback result ── */
  const handleResult = (decodedText: string) => {
    let result = decodedText.trim();
    try {
      const url = new URL(decodedText);
      const trace = url.searchParams.get("trace");
      if (trace) result = trace;
    } catch {
      // bukan URL, pakai langsung
    }
    onScan(result);
  };

  /* ── Scan dari file gambar ── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-file-reader");
      const result = await scanner.scanFile(file, false);
      scanner.clear();
      handleResult(result);
    } catch {
      setFileError(
        "QR code tidak terdeteksi dalam gambar. Pastikan gambar jelas dan QR code terlihat penuh."
      );
    }
  };

  /* ── Start kamera saat mount (mode camera) ── */
  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      scannerRef.current?.stop().catch(() => {});
    }
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
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
          <button
            onClick={() => {
              scannerRef.current?.stop().catch(() => {});
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-nat-border transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-nat-sage" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex border-b border-nat-light-cream">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === "camera" ? "bg-nat-green text-white" : "text-nat-sage hover:bg-nat-light-cream"
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Kamera
          </button>
          <button
            onClick={() => setMode("file")}
            className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === "file" ? "bg-nat-green text-white" : "text-nat-sage hover:bg-nat-light-cream"
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Upload Gambar
          </button>
        </div>

        <div className="p-4">
          {/* ── Mode Kamera ── */}
          {mode === "camera" && (
            <>
              {status === "loading" && (
                <div className="flex flex-col items-center justify-center h-52 gap-3 text-nat-sage">
                  <Loader2 className="w-8 h-8 animate-spin text-nat-green" />
                  <p className="text-xs font-medium">Meminta izin kamera...</p>
                </div>
              )}

              {status === "error" && (
                <div className="flex flex-col items-center justify-center h-52 gap-3 text-center">
                  <CameraOff className="w-10 h-10 text-red-400" />
                  <p className="text-sm font-bold text-nat-dark">Kamera tidak bisa diakses</p>
                  <p className="text-xs text-nat-sage leading-relaxed">{errorMsg}</p>
                  <button
                    onClick={startCamera}
                    className="mt-1 text-xs text-nat-green font-bold hover:underline cursor-pointer"
                  >
                    Coba lagi →
                  </button>
                </div>
              )}

              {/* Container kamera */}
              <div
                id={containerId}
                className={`rounded-xl overflow-hidden ${status !== "scanning" ? "hidden" : ""}`}
              />

              {status === "scanning" && (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] text-nat-sage text-center font-medium">
                    Arahkan kamera ke QR Code petani
                  </p>
                  <ul className="text-[10px] text-nat-sage space-y-0.5 bg-nat-light-cream rounded-lg p-2.5">
                    <li>💡 Pastikan pencahayaan cukup</li>
                    <li>📏 Jarak optimal: 10–20 cm dari QR code</li>
                    <li>🖥️ QR code harus terlihat penuh dalam kotak</li>
                  </ul>
                </div>
              )}
            </>
          )}

          {/* ── Mode Upload Gambar ── */}
          {mode === "file" && (
            <div className="space-y-4">
              {/* Hidden div untuk html5-qrcode file reader */}
              <div id="qr-file-reader" className="hidden" />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-nat-border rounded-xl py-10 flex flex-col items-center gap-2.5 text-nat-sage hover:border-nat-green hover:text-nat-green transition-colors cursor-pointer"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm font-semibold">Klik untuk upload foto QR code</span>
                <span className="text-[11px]">JPG · PNG · Foto dari HP atau screenshot</span>
              </button>

              {fileError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                  {fileError}
                </div>
              )}

              <div className="bg-nat-light-cream rounded-xl p-3 text-[11px] text-nat-sage space-y-1">
                <p className="font-semibold text-nat-dark">💡 Tips upload gambar QR:</p>
                <p>• Screenshot QR code dari modal petani</p>
                <p>• Foto QR code dari layar HP atau kertas</p>
                <p>• Pastikan QR code terlihat jelas dan tidak blur</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
