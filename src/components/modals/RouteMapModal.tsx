"use client";
/**
 * RouteMapModal — Menampilkan peta Leaflet dengan garis rute dari titik panen ke titik pembeli
 * @license Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { X, Navigation, Sprout, Store, MapPin, Truck, Clock } from "lucide-react";
import { renderToString } from "react-dom/server";
import type { PreOrder, Harvest, Demand } from "../../types";

interface RouteMapModalProps {
  po: PreOrder;
  harvest: Harvest | undefined;
  demand: Demand | undefined;
  onClose: () => void;
}

export default function RouteMapModal({ po, harvest, demand, onClose }: RouteMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  // Koordinat titik asal & tujuan
  const farmerLat = harvest?.latitude ?? -7.0;
  const farmerLng = harvest?.longitude ?? 110.0;
  const buyerLat = demand?.latitude ?? -6.9;
  const buyerLng = demand?.longitude ?? 109.9;

  // Hitung jarak & estimasi via Haversine
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(buyerLat - farmerLat);
  const dLon = toRad(buyerLng - farmerLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(farmerLat)) * Math.cos(toRad(buyerLat)) * Math.sin(dLon / 2) ** 2;
  const distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  const estimasiJam = Math.round((distanceKm / 40) * 10) / 10; // asumsi truk 40 km/h

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Dynamic import Leaflet untuk SSR safety
    import("leaflet").then((L) => {
      if (!mapContainerRef.current || mapRef.current) return;

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const midLat = (farmerLat + buyerLat) / 2;
      const midLng = (farmerLng + buyerLng) / 2;
      const map = L.map(mapContainerRef.current!, { attributionControl: false }).setView([midLat, midLng], 9);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
      }).addTo(map);

      // Marker Petani (hijau)
      const farmerHtml = renderToString(
        <div className="relative flex flex-col items-center group">
          <div className="absolute -bottom-1 w-5 h-1.5 bg-black/20 rounded-full blur-[2px]"></div>
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform group-hover:-translate-y-1 z-10 bg-[#16a34a]">
            <Sprout size={16} color="white" />
          </div>
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white -mt-[2px] transition-transform group-hover:-translate-y-1 z-0 shadow-sm"></div>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#16a34a] -mt-[9px] transition-transform group-hover:-translate-y-1 z-10"></div>
        </div>
      );

      const farmerIcon = L.divIcon({
        className: "bg-transparent",
        html: farmerHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 38],
        popupAnchor: [0, -38],
      });
      L.marker([farmerLat, farmerLng], { icon: farmerIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-size:13px;font-weight:bold;color:#16a34a">📍 Titik Panen</div>
           <div style="font-size:12px">${po.farmerName}</div>
           <div style="font-size:11px;color:#666">${harvest?.region ?? ""}</div>
           <div style="font-size:11px;margin-top:4px">🌾 ${po.commodity} — ${po.agreedVolumeKg.toLocaleString("id-ID")} kg</div>`,
          { maxWidth: 200 }
        )
        .openPopup();

      // Marker Pembeli (biru)
      const buyerHtml = renderToString(
        <div className="relative flex flex-col items-center group">
          <div className="absolute -bottom-1 w-5 h-1.5 bg-black/20 rounded-full blur-[2px]"></div>
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-md transition-transform group-hover:-translate-y-1 z-10 bg-[#2563eb]">
            <Store size={15} color="white" />
          </div>
          <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-white -mt-[2px] transition-transform group-hover:-translate-y-1 z-0 shadow-sm"></div>
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#2563eb] -mt-[9px] transition-transform group-hover:-translate-y-1 z-10"></div>
        </div>
      );

      const buyerIcon = L.divIcon({
        className: "bg-transparent",
        html: buyerHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 38],
        popupAnchor: [0, -38],
      });
      L.marker([buyerLat, buyerLng], { icon: buyerIcon })
        .addTo(map)
        .bindPopup(
          `<div style="font-size:13px;font-weight:bold;color:#2563eb">📦 Titik Tujuan</div>
           <div style="font-size:12px">${po.buyerName}</div>
           <div style="font-size:11px;color:#666">${demand?.region ?? ""}</div>
           <div style="font-size:11px;margin-top:4px">💰 Rp${po.agreedPricePerKg.toLocaleString("id-ID")}/kg</div>`,
          { maxWidth: 200 }
        );

      // Garis rute (polyline dengan arrow)
      const polyline = L.polyline(
        [[farmerLat, farmerLng], [buyerLat, buyerLng]],
        {
          color: "#f59e0b",
          weight: 4,
          opacity: 0.85,
          dashArray: "10, 8",
        }
      ).addTo(map);

      // Fit bounds ke kedua marker
      map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    });

    return () => {
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
            <span className="text-sm font-bold text-gray-800">{estimasiJam} jam</span>
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
            <span className="text-base">🌾</span>
            <span className="font-medium">{po.farmerName}</span>
            <span className="text-gray-400">({harvest?.region})</span>
          </span>
          <span className="text-gray-400">→</span>
          <span className="flex items-center gap-1.5">
            <span className="text-base">🏢</span>
            <span className="font-medium">{po.buyerName}</span>
            <span className="text-gray-400">({demand?.region})</span>
          </span>
        </div>

        {/* Map */}
        <div ref={mapContainerRef} style={{ height: "380px", width: "100%" }} />

        {/* Footer */}
        <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 text-xs text-amber-700 flex items-center gap-2">
          <span className="font-bold">ℹ️</span>
          <span>Garis kuning menunjukkan jarak garis lurus. Rute aktual mengikuti jalan raya.</span>
        </div>
      </div>
    </div>
  );
}
