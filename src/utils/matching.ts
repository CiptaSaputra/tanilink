/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Pure matching functions — no side effects, no context dependency.
 */

import { COMMODITY_WEIGHTS } from "../constants/commodities";
import type { Harvest, Demand, Match } from "../types";

/** Haversine distance antara dua koordinat, hasil dalam km. */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/** Hitung skor matching antara satu harvest dan satu demand. Pure function. */
export function scoreMatch(harvest: Harvest, demand: Demand): Match {
  const distanceKm = calculateDistance(
    harvest.latitude,
    harvest.longitude,
    demand.latitude,
    demand.longitude,
  );

  const weights = COMMODITY_WEIGHTS[harvest.commodity] ?? {
    wLocation: 0.4,
    wVolume: 0.3,
    wPrice: 0.3,
  };

  let distanceScore = 0;
  if (distanceKm <= 5) distanceScore = 100;
  else if (distanceKm < 150)
    distanceScore = Math.round(100 * (1 - (distanceKm - 5) / 145));

  const minVol = Math.min(harvest.expectedVolume, demand.requiredVolume);
  const maxVol = Math.max(harvest.expectedVolume, demand.requiredVolume);
  const volumeScore = maxVol > 0 ? Math.round((minVol / maxVol) * 100) : 0;

  let priceScore = 0;
  if (demand.offerPrice >= harvest.askingPrice) {
    priceScore = 100;
  } else {
    const ratio = demand.offerPrice / harvest.askingPrice;
    if (ratio >= 0.6) priceScore = Math.round(((ratio - 0.6) / 0.4) * 100);
  }

  const totalScore = Math.round(
    weights.wLocation * distanceScore +
      weights.wVolume * volumeScore +
      weights.wPrice * priceScore,
  );

  return {
    id: `match-${harvest.id}-${demand.id}`,
    harvestId: harvest.id,
    demandId: demand.id,
    score: totalScore,
    distanceKm,
    scoreDetails: {
      distanceScore,
      volumeScore,
      priceScore,
      totalScore,
      distanceKm,
    },
    status: "PENDING",
    createdAt: new Date().toISOString().split("T")[0],
  };
}
