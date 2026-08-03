/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/components/shared/RouteMap.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Reusable Leaflet map yang menggambar RUTE JALAN AKTUAL (via OSRM) antar
 * waypoints — seperti Google Maps. Fallback ke garis lurus jika OSRM gagal.
 *
 * - Dynamic import("leaflet") → SSR-safe (pattern sama dengan RouteMapModal).
 * - Marker bernomor (divIcon bulat) per stop, depot = marker pertama.
 * - Info bar jarak & durasi dari OSRM.
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  fetchOSRMRoute,
  formatDistance,
  formatDuration,
  type OSRMWaypoint,
} from "../../utils/osrm";

interface RouteMapStop {
  id: string;
  label: string;
  sub?: string;
}

interface RouteMapProps {
  waypoints: OSRMWaypoint[];
  stops?: RouteMapStop[];
  height?: string;
  /** index waypoint yang merupakan depot/asal (marker khusus) */
  depotIndex?: number;
}

export default function RouteMap({
  waypoints,
  stops,
  height = "300px",
  depotIndex = 0,
}: RouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const prevCoordsRef = useRef<string>("");
  const [routeInfo, setRouteInfo] = useState<{
    distance: string;
    duration: string;
    isFallback: boolean;
  } | null>(null);

  // Snapshot koordinat — guard agar map TIDAK di-reinit saat parent re-render
  // (mis. polling DataContext tiap 3 detik bikin array waypoints baru dengan
  // nilai sama). Hanya re-init jika koordinat benar-benar berubah.
  const coordsKey = JSON.stringify(
    waypoints.map((w) => [w.lat.toFixed(6), w.lng.toFixed(6)]),
  );

  useEffect(() => {
    if (!mapContainerRef.current || waypoints.length < 2) return;

    // Guard: skip jika koordinat tidak berubah DAN map sudah ada
    if (coordsKey === prevCoordsRef.current && mapRef.current) return;
    prevCoordsRef.current = coordsKey;

    let cancelled = false;

    // Dynamic import Leaflet untuk SSR safety
    import("leaflet").then(async (L) => {
      if (cancelled || !mapContainerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const mid = waypoints[Math.floor(waypoints.length / 2)];
      const map = L.map(mapContainerRef.current, {
        attributionControl: false,
      }).setView([mid.lat, mid.lng], 9);
      mapRef.current = map;

      // Tile layer utama: OSM. Jika gagal dimuat (mis. diblokir), fallback CARTO.
      const osmTiles = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 18, crossOrigin: true },
      ).addTo(map);
      let tileFallbackShown = false;
      osmTiles.on("tileerror", () => {
        if (tileFallbackShown || cancelled) return;
        tileFallbackShown = true;
        L.tileLayer(
          "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
          { maxZoom: 18, attribution: "© CARTO" },
        ).addTo(map);
      });

      // Map dibuat saat modal sedang animasi (ukuran container 0) → panggil
      // invalidateSize agar tile ter-render dengan ukuran benar (cegah peta putih)
      const invalidate = () => {
        if (cancelled || !mapRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).invalidateSize();
      };
      requestAnimationFrame(invalidate);
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 400);
      setTimeout(invalidate, 800);

      // Marker bernomor per stop
      waypoints.forEach((wp, idx) => {
        const isDepot = idx === depotIndex;
        const stop = stops?.[idx];
        const number = isDepot ? "🏠" : String(idx);
        const color = isDepot ? "#5F7444" : "#A67C52";
        const html = `
          <div class="flex flex-col items-center" style="font-family:Inter,sans-serif">
            <div style="width:26px;height:26px;border-radius:9999px;background:${color};color:#fff;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">${number}</div>
          </div>`;
        const icon = L.divIcon({
          className: "bg-transparent",
          html,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });
        L.marker([wp.lat, wp.lng], { icon })
          .addTo(map)
          .bindPopup(
            `<div style="font-size:12px;font-weight:700">${stop?.label ?? (isDepot ? "Titik Awal" : `Titik ${idx + 1}`)}</div>${
              stop?.sub
                ? `<div style="font-size:11px;color:#666">${stop.sub}</div>`
                : ""
            }`,
            { maxWidth: 200 },
          );
      });

      // Fetch rute jalan aktual dari OSRM
      const osrm = await fetchOSRMRoute(waypoints);

      let bounds: L.LatLngBounds | null = null;
      if (osrm && osrm.geometry.length >= 2) {
        const polyline = L.polyline(osrm.geometry, {
          color: "#f59e0b",
          weight: 4,
          opacity: 0.9,
        }).addTo(map);
        bounds = polyline.getBounds();
        if (!cancelled) {
          setRouteInfo({
            distance: formatDistance(osrm.distanceMeters),
            duration: formatDuration(osrm.durationSeconds),
            isFallback: false,
          });
        }
      } else {
        // Fallback: garis lurus antar waypoint
        const flat: [number, number][] = waypoints.map((w) => [w.lat, w.lng]);
        const polyline = L.polyline(flat, {
          color: "#f59e0b",
          weight: 4,
          opacity: 0.85,
          dashArray: "10, 8",
        }).addTo(map);
        bounds = polyline.getBounds();
        if (!cancelled) {
          setRouteInfo(null);
        }
      }

      if (bounds) {
        map.fitBounds(bounds, { padding: [45, 45] });
      }

      // Setelah OSRM & fitBounds, pastikan ukuran sudah benar
      invalidate();
      setTimeout(invalidate, 200);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordsKey]);

  return (
    <div className="rounded-xl overflow-hidden border border-nat-border shadow-sm bg-white relative z-0">
      <div ref={mapContainerRef} style={{ height, width: "100%", position: "relative", zIndex: 1 }} />
      {routeInfo ? (
        <div className="flex items-center justify-between px-3 py-2 bg-amber-50 border-t border-amber-100 text-xs">
          <span className="text-amber-800 font-semibold">
            Rute jalan aktual ({routeInfo.distance})
          </span>
          <span className="text-amber-700">⏱ {routeInfo.duration}</span>
        </div>
      ) : (
        <div className="px-3 py-2 bg-gray-50 border-t border-nat-border text-[10px] text-nat-sage">
          Garis putus-putus = perkiraan. Aktifkan internet untuk rute jalan
          aktual.
        </div>
      )}
    </div>
  );
}
