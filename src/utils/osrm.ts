/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/utils/osrm.ts
 * ────────────────────────────────────────────────────────────────────────────
 * OSRM (Open Source Routing Machine) public API helper.
 * Mengambil geometri rute JALAN AKTUAL (bukan garis lurus) antara waypoints.
 * Public server: https://router.project-osrm.org — gratis, tanpa API key.
 *
 * Catatan: untuk produksi gunakan self-hosted OSRM atau provider berbayar
 * (Mapbox/Google) agar tidak bergantung pada server publik.
 */

export interface OSRMWaypoint {
  lat: number;
  lng: number;
}

export interface OSRMRouteResult {
  /** Polyline koordinat [lat, lng] mengikuti jalan */
  geometry: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
}

const OSRM_ENDPOINT = "https://router.project-osrm.org/route/v1/driving";

/**
 * Fetch rute jalan aktual antara waypoints (berurutan).
 * Return null jika gagal (offline / error) — caller fallback ke garis lurus.
 */
export async function fetchOSRMRoute(
  waypoints: OSRMWaypoint[],
): Promise<OSRMRouteResult | null> {
  if (waypoints.length < 2) return null;

  const coords = waypoints
    .map((w) => `${w.lng},${w.lat}`)
    .join(";");
  const url = `${OSRM_ENDPOINT}/${coords}?overview=full&geometries=geojson&steps=false`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const json = await res.json();

    const route = json?.routes?.[0];
    if (!route?.geometry?.coordinates) return null;

    // GeoJSON coordinates = [lon, lat] → swap ke [lat, lng]
    const geometry: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as [number, number],
    );

    return {
      geometry,
      distanceMeters: route.distance ?? 0,
      durationSeconds: route.duration ?? 0,
    };
  } catch (err) {
    // Abort / network error → silent, caller pakai fallback
    console.warn("[osrm] Gagal mengambil rute:", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Format jarak (meter → "12,5 km") */
export function formatDistance(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
  return `${Math.round(meters)} m`;
}

/** Format durasi (detik → "45 mnt" / "1,5 jam") */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} dtk`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} mnt`;
  return `${(minutes / 60).toFixed(1).replace(".", ",")} jam`;
}
