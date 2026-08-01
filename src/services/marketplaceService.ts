/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/marketplaceService.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Service layer untuk Marketplace Fallback (listing panen yang tidak ter-match).
 */

import { MarketplaceListing } from "../types";

export async function marketplaceGetAll(): Promise<MarketplaceListing[]> {
  const res = await fetch("/api/marketplace");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function marketplaceGetOpen(): Promise<MarketplaceListing[]> {
  const res = await fetch("/api/marketplace?status=open");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function marketplaceAdd(
  listing: Omit<MarketplaceListing, "id" | "listedAt">,
): Promise<MarketplaceListing[]> {
  await fetch("/api/marketplace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listing),
  });
  return marketplaceGetAll();
}

export async function marketplaceUpdateStatus(
  id: string,
  status: MarketplaceListing["status"],
): Promise<MarketplaceListing[]> {
  await fetch(`/api/marketplace/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return marketplaceGetAll();
}

export async function marketplaceRemove(id: string): Promise<MarketplaceListing[]> {
  await fetch(`/api/marketplace/${id}`, { method: "DELETE" });
  return marketplaceGetAll();
}
