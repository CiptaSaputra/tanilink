/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/reviewService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Service layer untuk operasi data Review & Rating.
 */

import { Review } from '../types';
import { STORAGE_KEYS, storageReadArray, storageWrite, storageRemove } from './storage';

// ─── Read ──────────────────────────────────────────────────────────────────────

export function reviewGetAll(): Review[] {
  return storageReadArray<Review>(STORAGE_KEYS.REVIEWS);
}

export function reviewGetById(id: string): Review | undefined {
  return reviewGetAll().find(r => r.id === id);
}

export function reviewGetByPreOrder(preOrderId: string): Review[] {
  return reviewGetAll().filter(r => r.preOrderId === preOrderId);
}

export function reviewGetByReviewee(revieweeUserId: string): Review[] {
  return reviewGetAll().filter(r => r.revieweeUserId === revieweeUserId);
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export function reviewSaveAll(reviews: Review[]): void {
  storageWrite(STORAGE_KEYS.REVIEWS, reviews);
}

export function reviewAdd(review: Review): Review[] {
  const updated = [...reviewGetAll(), review];
  reviewSaveAll(updated);
  return updated;
}

export function reviewClear(): void {
  storageRemove(STORAGE_KEYS.REVIEWS);
}
