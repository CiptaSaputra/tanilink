"use client";

/**
 * QRCameraScanner — scan QR code menggunakan kamera device (MacBook/HP)
 * via html5-qrcode library. Tidak perlu plugin tambahan.
 */

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, X } from "lucide-react";

interface QRCameraScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function QRCameraScanner({ onScan, onClose }: QRCameraScannerProps) {
  const scannerRef = useRef<InstanceType<typeof import("html5-qrcode")["Html5Qrcode"]> | null>(null);
  const [status, setStatus] = useState<"loading" | "scanning" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const containerId = "qr-camera-reader";

  useEffect(() => {
    let stopped = false;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        const cameras = await Html5Qrcode.getCameras();
        if (!cameras || cameras.length === 0) {
          setErrorMsg("Tidak ada kamera yang ditemukan.");
          setStatus("error");
          return;
        }

        // Pilih kamera belakang kalau ada (HP), kalau tidak ada pakai yang pertama (MacBook)
        const camera = cameras.find((c) =>
          c.label.toLowerCase().includes("back") ||
          c.label.toLowerCase().includes("rear") ||
          c.label.toLowerCase().includes("environment")
        ) ?? cameras[0];

        await scanner.start(
          camera.id,
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (stopped) return;
            stopped = true;
            // Extract ID dari URL kalau QR berisi URL /public?trace=...
            let result = decodedText;
            try {
              const url = new URL(decodedText);
              const trace = url.searchParams.get("trace");
              if (trace) result = trace;
            } catch {
              // bukan URL, pakai langsung
            }
            scanner.stop().catch(() => {});
            onScan(result);
          },
          () => {} // qr not found — silent
        );

        if (!stopped) setStatus("scanning");
      } catch (err) {
        if (!stopped) {
          setErrorMsg(
            "Gagal mengakses kamera. Pastikan izin kamera sudah diberikan di browser."
          );
          setStatus("error");
        }
      }
    }

    startScanner();

    return () => {
      stopped = true;
      scannerRef.current?.stop().catch(() => {});
    };
  }, []);

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

        {/* Camera viewport */}
        <div className="p-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-nat-sage">
              <Loader2 className="w-8 h-8 animate-spin text-nat-green" />
              <p className="text-xs font-medium">Meminta izin kamera...</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
              <CameraOff className="w-10 h-10 text-red-400" />
              <p className="text-sm font-bold text-nat-dark">Kamera tidak bisa diakses</p>
              <p className="text-xs text-nat-sage leading-relaxed max-w-xs">{errorMsg}</p>
              <p className="text-[10px] text-nat-sage">
                Izinkan akses kamera di address bar browser (ikon kunci/kamera)
              </p>
            </div>
          )}

          {/* Container kamera — html5-qrcode inject video ke sini */}
          <div
            id={containerId}
            className={status === "scanning" ? "rounded-xl overflow-hidden" : "hidden"}
          />

          {status === "scanning" && (
            <p className="text-[11px] text-nat-sage text-center mt-3 font-medium">
              Arahkan kamera ke QR Code petani
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
