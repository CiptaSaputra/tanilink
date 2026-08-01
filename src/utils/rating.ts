/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/utils/rating.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Agregasi rating (review) per pengguna — dipakai untuk menampilkan rating
 * rata-rata seorang petani/penjual di berbagai dashboard.
 */

import { Review } from "../types";

export interface SellerRating {
  average: number; // 0 jika belum ada review
  count: number;
  /** persentase 1-5 */
  distribution: { stars: number; pct: number }[];
}

/** Rating rata-rata untuk seorang user (sebagai reviewee). */
export function getSellerRating(
  reviews: Review[],
  userId: string,
): SellerRating {
  const mine = reviews.filter((r) => r.revieweeUserId === userId);
  if (mine.length === 0) {
    return { average: 0, count: 0, distribution: [] };
  }

  const sum = mine.reduce((acc, r) => acc + r.rating, 0);
  const average = Math.round((sum / mine.length) * 10) / 10;

  const distribution = [1, 2, 3, 4, 5].map((stars) => {
    const n = mine.filter((r) => r.rating === stars).length;
    return { stars, pct: Math.round((n / mine.length) * 100) };
  });

  return { average, count: mine.length, distribution };
}

/** Render bintang berisi/penuh untuk tampilan (string utk kepentingan inline). */
export function starLabel(average: number): string {
  if (average <= 0) return "—";
  return "★".repeat(Math.round(average)) + "☆".repeat(5 - Math.round(average));
}

/** Badge kecil: "★ 4.5 (12 ulasan)" atau "Belum ada ulasan" */
export function ratingBadge(reviews: Review[], userId: string): string {
  const { average, count } = getSellerRating(reviews, userId);
  if (average <= 0) return "Belum ada ulasan";
  return `★ ${average.toFixed(1)} (${count} ulasan)`;
}
