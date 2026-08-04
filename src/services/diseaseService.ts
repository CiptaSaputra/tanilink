/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/diseaseService.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Service layer untuk deteksi penyakit tanaman (hasil + riwayat).
 */

import { DiseaseDetection } from "../types";

export async function diseaseGetAll(
  plantingId?: string,
): Promise<DiseaseDetection[]> {
  const qs = plantingId ? `?plantingId=${encodeURIComponent(plantingId)}` : "";
  const res = await fetch(`/api/disease-detections${qs}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function diseaseAdd(
  detection: Omit<DiseaseDetection, "id" | "detectedAt">,
): Promise<DiseaseDetection[] | null> {
  const res = await fetch("/api/disease-detections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(detection),
  });
  if (!res.ok) return null;
  return diseaseGetAll();
}
