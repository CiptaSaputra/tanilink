/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/utils/disease.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Koneksi ke API deteksi penyakit tanaman (ml-tumbu).
 * Server: FastAPI + ResNet9 (38 kelas), request diteruskan via proxy
 * Next.js di /api/disease-detections/predict.
 *
 * Setup ML server:
 *   cd ml-tumbu-main && uvicorn app:app --port 8000
 *   Set ML_API_URL=http://localhost:8000 di .env
 */

export interface DiseasePrediction {
  disease: string;
  disease_key: string;
  confidence: number;
  solution: string;
}

export interface DiseaseResult {
  is_plant: boolean;
  warning?: string | null;
  mode: string;
  gemini_analysis?: string;
  predictions: DiseasePrediction[];
}

/**
 * Kirim gambar base64 ke deteksi penyakit via proxy Next.js.
 * Proxy: POST /api/disease-detections/predict → ML_API_URL/predict-base64
 * (Menghindari CORS dan expose port ML ke browser saat deploy).
 */
export async function predictDisease(
  imageBase64: string,
): Promise<DiseaseResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const res = await fetch("/api/disease-detections/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: imageBase64, top: 3 }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    return (await res.json()) as DiseaseResult;
  } catch (err) {
    console.warn("[disease] Gagal menghubungi API deteksi penyakit:", err);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Persentase koreksi volume panen berdasarkan hasil deteksi.
 *  Penyakit terdeteksi → volume turun. Sehat → 0 (tidak dikoreksi). */
export function computeVolumeAdjustment(
  result: DiseaseResult | null,
): number {
  if (!result || !result.is_plant) return 0;
  const top = result.predictions?.[0];
  if (!top) return 0;
  const disease = top.disease_key?.toLowerCase() ?? "";
  if (disease.includes("healthy") || disease.includes("sehat")) {
    return 0; // sehat → tidak dikoreksi
  }
  // Penyakit → turunkan estimasi volume (makin yakin, makin besar koreksi)
  const base = 0.2 + (1 - top.confidence) * 0.1;
  return Math.min(0.5, Math.round(base * 100) / 100); // 20%–50%
}
