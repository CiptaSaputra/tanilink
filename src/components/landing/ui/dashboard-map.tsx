"use client";

import { useEffect, useRef } from "react";

const warehousePos:     [number, number] = [-6.2,      106.816666];
const distributionPos1: [number, number] = [-6.914744, 107.60981];
const distributionPos2: [number, number] = [-7.250445, 112.768845];
const productionPos:    [number, number] = [-5.4294,   105.2615];

function pinHtml(color: string, svgPath: string, pulse: boolean) {
  const ring = pulse
    ? `<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-60%);
        width:44px;height:44px;border-radius:50%;background:${color};opacity:0.22;
        animation:lpng 1.8s cubic-bezier(0,0,0.2,1) infinite;"></span>`
    : "";
  return `
    <style>@keyframes lpng{75%,100%{transform:translate(-50%,-60%) scale(2.2);opacity:0;}}</style>
    <div style="position:relative;width:36px;height:48px;display:flex;flex-direction:column;align-items:center;">
      ${ring}
      <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
        background:${color};box-shadow:0 3px 10px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;border:2px solid white;z-index:1;position:relative;">
        <div style="transform:rotate(45deg)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            ${svgPath}
          </svg>
        </div>
      </div>
      <div style="width:5px;height:5px;background:${color};border-radius:50%;margin-top:1px;
        box-shadow:0 1px 3px rgba(0,0,0,0.25);"></div>
    </div>`;
}

export default function DashboardMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null); // holds leaflet map instance

  useEffect(() => {
    if (!containerRef.current) return;

    // Kalau sudah ada instance (Strict Mode double-invoke), destroy dulu
    if (mapRef.current) {
      (mapRef.current as { remove: () => void }).remove();
      mapRef.current = null;
    }

    // Semua import & inisialisasi di dalam effect → tidak pernah jalan di SSR
    import("leaflet").then((L) => {
      if (!containerRef.current) return;

      // Guard: kalau container sudah punya _leaflet_id, reset dulu
      const el = containerRef.current;
      // @ts-expect-error leaflet private prop
      if (el._leaflet_id) {
        // @ts-expect-error leaflet private prop
        delete el._leaflet_id;
      }

      const map = L.map(el, {
        center: [-6.2, 109.5],
        zoom: 6,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false,
      });

      mapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { attribution: "&copy; CARTO" }
      ).addTo(map);

      const makeIcon = (color: string, svgPath: string, pulse = false) =>
        L.divIcon({
          html: pinHtml(color, svgPath, pulse),
          className: "",
          iconSize: [36, 48],
          iconAnchor: [18, 48],
          popupAnchor: [0, -50],
        });

      const warehouseIcon = makeIcon(
        "#0e7490",
        `<path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z"/><path d="M6 18h12"/><path d="M12 10v8"/>`,
        true
      );
      const productionIcon = makeIcon(
        "#15803d",
        `<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>`,
        true
      );
      const truckIcon = makeIcon(
        "#059669",
        `<path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>`,
        false
      );

      L.marker(productionPos, { icon: productionIcon })
        .addTo(map)
        .bindPopup("<strong>🌱 Lahan Produksi</strong><br/>Lampung · 4.250 kg");
      L.marker(warehousePos, { icon: warehouseIcon })
        .addTo(map)
        .bindPopup("<strong>🏭 Gudang Utama</strong><br/>Jakarta · Kapasitas 78%");
      L.marker(distributionPos1, { icon: truckIcon })
        .addTo(map)
        .bindPopup("<strong>🚚 Distribusi</strong><br/>Bandung · Aktif");
      L.marker(distributionPos2, { icon: truckIcon })
        .addTo(map)
        .bindPopup("<strong>🚚 Distribusi</strong><br/>Surabaya · Aktif");

      const lineOpts = (color: string) => ({
        color,
        dashArray: "6, 10" as string,
        weight: 2.5,
        opacity: 0.7,
      });
      L.polyline([productionPos, warehousePos], lineOpts("#16a34a")).addTo(map);
      L.polyline([warehousePos, distributionPos1], lineOpts("#0e7490")).addTo(map);
      L.polyline([warehousePos, distributionPos2], lineOpts("#0e7490")).addTo(map);
    });

    // Cleanup: destroy map saat komponen unmount
    return () => {
      if (mapRef.current) {
        (mapRef.current as { remove: () => void }).remove();
        mapRef.current = null;
      }
    };
  }, []); // hanya jalan sekali setelah mount

  return (
    <div className="w-full h-full min-h-[250px] rounded-lg overflow-hidden relative z-0">
      {/* CSS leaflet dimuat via style tag agar tidak perlu import di top level */}
      <style>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full z-10"
        style={{ minHeight: 250, background: "#0d1f12" }}
      />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_50px_rgba(10,20,12,0.9)] z-[1000]" />
    </div>
  );
}
