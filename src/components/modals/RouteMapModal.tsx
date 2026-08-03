"use client";
/**
 * RouteMapModal — Menampilkan peta rute JALAN AKTUAL (OSRM) dari titik panen ke titik pembeli.
 * Menggunakan komponen reusable RouteMap (OSRM), bukan garis lurus.
 * @license Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Navigation, Sprout, Store, MapPin, Truck, Clock } from "lucide-react";
import type { PreOrder, Harvest, Demand } from "../../types";
import RouteMap from "../shared/RouteMap";
import { fetchOSRMRoute } from "../../utils/osrm";

interface RouteMapModalProps {
  po: PreOrder;
  harvest: Harvest | undefined;
  demand: Demand | undefined;
  onClose: () => void;
}

export default function RouteMapModal({ po, harvest, demand, onClose }: RouteMapModalProps) {
  // Koordinat titik asal & tujuan
  const farmerLat = harvest?.latitude ?? -7.0;
  const farmerLng = harvest?.longitude ?? 110.0;
  const buyerLat = demand?.latitude ?? -6.9;
  const buyerLng = demand?.longitude ?? 109.9;

  const [osrmInfo, setOsrmInfo] = useState<{
    distanceMeters: number;
    durationSeconds: number;
  } | null>(null);

  // Ambil jarak/durasi aktual dari OSRM untuk info bar atas
  useEffect(() => {
    let cancelled = false;
    fetchOSRMRoute([
      { lat: farmerLat, lng: farmerLng },
      { lat: buyerLat, lng: buyerLng },
    ]).then((r) => {
      if (!cancelled && r) {
        setOsrmInfo({ distanceMeters: r.distanceMeters, durationSeconds: r.durationSeconds });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [farmerLat, farmerLng, buyerLat, buyerLng]);

  // Fallback Haversine jika OSRM gagal
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(buyerLat - farmerLat);
  const dLon = toRad(buyerLng - farmerLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(farmerLat)) * Math.cos(toRad(buyerLat)) * Math.sin(dLon / 2) ** 2;
  const haversineKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));

  const distanceKm = osrmInfo
    ? Math.round(osrmInfo.distanceMeters / 1000)
    : haversineKm;
  const durationMin = osrmInfo
    ? Math.round(osrmInfo.durationSeconds / 60)
    : Math.round((haversineKm / 40) * 10) / 10 * 60;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-green-700 to-green-500 text-white">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            <div>
              <h2 className="font-bold text-sm">Rute Pengiriman</h2>
              <p className="text-green-100 text-xs">{po.commodity} · PO #{po.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Bar */}
        <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
          <div className="flex flex-col items-center py-3 gap-1">
            <MapPin className="w-4 h-4 text-green-600" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Jarak</span>
            <span className="text-sm font-bold text-gray-800">{distanceKm} km</span>
          </div>
          <div className="flex flex-col items-center py-3 gap-1">
            <Truck className="w-4 h-4 text-amber-600" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Estimasi</span>
            <span className="text-sm font-bold text-gray-800">
              {durationMin >= 60
                ? `${(durationMin / 60).toFixed(1)} jam`
                : `${durationMin} mnt`}
            </span>
          </div>
          <div className="flex flex-col items-center py-3 gap-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Volume</span>
            <span className="text-sm font-bold text-gray-800">{po.agreedVolumeKg.toLocaleString("id-ID")} kg</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 py-2 bg-gray-50 border-b border-gray-100 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-green-600" />
            <span className="font-medium">{po.farmerName}</span>
            <span className="text-gray-400">({harvest?.region})</span>
          </span>
          <span className="text-gray-400">→</span>
          <span className="flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-medium">{po.buyerName}</span>
            <span className="text-gray-400">({demand?.region})</span>
          </span>
        </div>

        {/* Map — rute jalan aktual via OSRM */}
        <div className="p-3">
          <RouteMap
            waypoints={[
              { lat: farmerLat, lng: farmerLng },
              { lat: buyerLat, lng: buyerLng },
            ]}
            stops={[
              { id: "farmer", label: po.farmerName, sub: `🌾 ${po.commodity}` },
              { id: "buyer", label: po.buyerName, sub: `🏢 ${po.commodity}` },
            ]}
            height="360px"
            depotIndex={0}
          />
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-2">
          <span className="font-bold">ℹ️</span>
          <span>
            Rute mengikuti jalan aktual (OSRM). Jarak & estimasi adalah perkiraan.
          </span>
        </div>
      </div>
    </div>,
    // Portal ke document.body — modal dirender di dalam motion.div bertransform,
    // sehingga position:fixed terkait ke viewport (bukan ancestor bertransform).
    document.body,
  );
}
