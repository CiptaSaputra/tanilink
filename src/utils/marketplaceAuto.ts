/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/utils/marketplaceAuto.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Marketplace auto-fallback — harvest yang tidak ter-match dan sudah lewat
 * masa panen otomatis masuk ke marketplace terbuka (jalur kedua).
 */

import { Harvest, Match, MarketplaceListing } from "../types";

export const MARKETPLACE_OVERDUE_DAYS = 7;

/**
 * Temukan harvest ACTIVE yang "terlantar":
 * - status ACTIVE (belum ter-match / belum panen)
 * - tidak punya match berstatus CONFIRMED
 * - expectedHarvestDate sudah lewat + MARKETPLACE_OVERDUE_DAYS hari
 */
export function findUnmatchedHarvests(
  harvests: Harvest[],
  matches: Match[],
): Harvest[] {
  const confirmedHarvestIds = new Set(
    matches.filter((m) => m.status === "CONFIRMED").map((m) => m.harvestId),
  );

  const cutoff = Date.now() - MARKETPLACE_OVERDUE_DAYS * 86_400_000;

  return harvests.filter((h) => {
    if (h.status !== "ACTIVE") return false;
    if (confirmedHarvestIds.has(h.id)) return false;
    const harvestTime = new Date(h.expectedHarvestDate).getTime();
    return harvestTime <= cutoff;
  });
}

/**
 * Filter harvest yang belum punya listing marketplace (dedup by harvestId).
 */
export function harvestsWithoutListing(
  harvests: Harvest[],
  listings: MarketplaceListing[],
): Harvest[] {
  const listedIds = new Set(
    listings.map((l) => l.harvestId).filter(Boolean),
  );
  return harvests.filter((h) => !listedIds.has(h.id));
}
