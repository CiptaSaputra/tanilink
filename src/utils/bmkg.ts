/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/utils/bmkg.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Weather risk engine untuk Harvest Forecasting & Distribution Priority.
 *
 * Sumber data: **Open-Meteo** (gratis, tanpa API key, global — termasuk
 * Indonesia). Mengambil prakiraan curah hujan per lokasi (lat/lng) untuk
 * 16 hari ke depan. BMKG API resmi tidak stabil (404/redirect), jadi kita
 * pakai Open-Meteo sebagai pengganti dengan fungsi identik.
 *
 * Jika fetch gagal/offline → fallback ke heuristic musim statis Indonesia.
 */

import { Komoditas } from "../types";
import { COMMODITY_LIST } from "../constants/commodities";

export type WeatherRiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface BMKGResponse {
  riskLevel: WeatherRiskLevel;
  forecastedHarvestDate: string;
}

/** Threshold curah hujan (mm/hari) untuk klasifikasi risiko */
const RAIN_HEAVY_MM = 30; // hujan lebat
const RAIN_MODERATE_MM = 10; // hujan sedang

interface OpenMeteoDaily {
  time: string[];
  precipitation_sum: number[];
}

/**
 * Fetch prakiraan curah hujan dari Open-Meteo untuk 16 hari ke depan.
 * Return null jika gagal (offline / error).
 */
async function fetchRainForecast(
  lat: number,
  lng: number,
): Promise<OpenMeteoDaily | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_sum&timezone=Asia%2FJakarta&forecast_days=16`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as OpenMeteoDaily;
  } catch (err) {
    console.warn("[bmkg] Gagal fetch Open-Meteo, pakai heuristic:", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Hitung risk level dari data curah hujan di sekitar tanggal panen.
 * Mengambil rata-rata hujan 7 hari sebelum & sesudah tanggal panen.
 */
function riskFromRain(
  daily: OpenMeteoDaily,
  harvestDate: Date,
  commodity: Komoditas,
): WeatherRiskLevel {
  const idx = daily.time.findIndex(
    (t) => t.slice(0, 10) === harvestDate.toISOString().split("T")[0],
  );
  // Ambil window: 7 hari sebelum s.d. 7 hari sesudah tanggal panen
  const start = Math.max(0, idx - 7);
  const end = Math.min(daily.precipitation_sum.length, idx + 8);

  const windowRain = daily.precipitation_sum.slice(start, end);
  if (windowRain.length === 0) return "LOW";

  const avgRain =
    windowRain.reduce((s, v) => s + (v ?? 0), 0) / windowRain.length;

  // Sensitivitas komoditas terhadap hujan
  const rainSensitive =
    commodity === "Bawang Merah" ||
    commodity === "Cabai Merah" ||
    commodity === "Tomat";

  if (avgRain >= RAIN_HEAVY_MM) {
    return rainSensitive ? "HIGH" : "MEDIUM";
  }
  if (avgRain >= RAIN_MODERATE_MM) {
    return rainSensitive ? "MEDIUM" : "LOW";
  }
  return "LOW";
}

/**
 * Fallback heuristic musim Indonesia (dipakai jika Open-Meteo offline).
 * Dec-Feb musim hujan lebat, Jun-Aug kemarau.
 */
function heuristicRisk(
  harvestMonth: number,
  commodity: Komoditas,
): { risk: WeatherRiskLevel; adjustDays: number } {
  const isHeavyRain =
    harvestMonth === 11 ||
    harvestMonth === 10 ||
    harvestMonth === 0 ||
    harvestMonth === 1;
  const isDry = harvestMonth >= 5 && harvestMonth <= 7;

  if (isHeavyRain) {
    if (
      commodity === "Bawang Merah" ||
      commodity === "Cabai Merah" ||
      commodity === "Tomat"
    ) {
      return { risk: "HIGH", adjustDays: -3 }; // panen dipercepat hindari busuk
    }
    if (commodity === "Padi") return { risk: "LOW", adjustDays: 0 };
    return { risk: "MEDIUM", adjustDays: 0 };
  }
  if (isDry) {
    if (commodity === "Padi") return { risk: "HIGH", adjustDays: 5 }; // melambat
    return { risk: "LOW", adjustDays: 0 };
  }
  return { risk: "LOW", adjustDays: 0 };
}

/**
 * Estimasi risiko cuaca + penyesuaian tanggal panen untuk sebuah planting.
 * Prioritas: data Open-Meteo real; fallback: heuristic musim.
 */
export async function getBMKGWeatherRisk(
  region: string,
  commodity: Komoditas,
  plantingDate: string,
): Promise<BMKGResponse> {
  const metadata = COMMODITY_LIST[commodity];

  // Tanggal panen dasar = tanam + durasi typical
  const pDate = new Date(plantingDate);
  pDate.setDate(pDate.getDate() + metadata.typicalDurationDays);
  const baseHarvestDate = new Date(pDate);

  // Koordinat default per wilayah (region → lat/lng)
  const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
    Brebes: { lat: -6.871, lng: 109.042 },
    Garut: { lat: -7.227, lng: 107.908 },
    Malang: { lat: -7.982, lng: 112.63 },
    Cianjur: { lat: -6.822, lng: 107.138 },
    Lampung: { lat: -5.402, lng: 105.263 },
    Jakarta: { lat: -6.208, lng: 106.845 },
    Surabaya: { lat: -7.257, lng: 112.752 },
    Bandung: { lat: -6.917, lng: 107.619 },
    Semarang: { lat: -6.993, lng: 110.42 },
    Yogyakarta: { lat: -7.795, lng: 110.369 },
  };
  const coords = REGION_COORDS[region] ?? { lat: -6.871, lng: 109.042 };

  // 1. Coba data real dari Open-Meteo
  const daily = await fetchRainForecast(coords.lat, coords.lng);
  if (
    daily &&
    Array.isArray(daily.precipitation_sum) &&
    daily.precipitation_sum.length > 0 &&
    Array.isArray(daily.time) &&
    daily.time.length > 0
  ) {
    const riskLevel = riskFromRain(daily, baseHarvestDate, commodity);
    // Penyesuaian tanggal panen: level risiko menyesuaikan tanggal
    const adjDate = new Date(baseHarvestDate);
    if (riskLevel === "HIGH") adjDate.setDate(adjDate.getDate() - 2);
    else if (riskLevel === "MEDIUM") adjDate.setDate(adjDate.getDate() - 1);
    return {
      riskLevel,
      forecastedHarvestDate: adjDate.toISOString().split("T")[0],
    };
  }

  // 2. Fallback heuristic musim
  const { risk, adjustDays } = heuristicRisk(pDate.getMonth(), commodity);
  pDate.setDate(pDate.getDate() + adjustDays);

  return {
    riskLevel: risk,
    forecastedHarvestDate: pDate.toISOString().split("T")[0],
  };
}
