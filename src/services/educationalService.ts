/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/educationalService.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Service layer untuk konten edukasi budidaya (PPL/BPP → petani).
 */

import { EducationalContent } from "../types";

export async function eduGetAll(
  region?: string,
  status?: string,
): Promise<EducationalContent[]> {
  const params = new URLSearchParams();
  if (region) params.set("region", region);
  if (status) params.set("status", status);
  const qs = params.toString();
  const res = await fetch(`/api/educational-contents${qs ? `?${qs}` : ""}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function eduAdd(
  content: Omit<EducationalContent, "id" | "createdAt" | "status">,
): Promise<EducationalContent[]> {
  await fetch("/api/educational-contents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });
  return eduGetAll();
}

export async function eduUpdateStatus(
  id: string,
  status: EducationalContent["status"],
): Promise<void> {
  try {
    await fetch(`/api/educational-contents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  } catch (err) {
    console.warn("[edu] Gagal update status:", err);
  }
}
