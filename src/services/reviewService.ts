/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/reviewService.ts
 */
import { Review } from "../types";

export async function reviewGetAll(): Promise<Review[]> {
  const res = await fetch("/api/reviews");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function reviewGetById(id: string): Promise<Review | undefined> {
  const res = await fetch(`/api/reviews/${id}`);
  if (!res.ok) return undefined;
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function reviewGetByPreOrder(
  preOrderId: string,
): Promise<Review[]> {
  const res = await fetch(`/api/reviews/pre-order/${preOrderId}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function reviewGetByReviewee(
  revieweeUserId: string,
): Promise<Review[]> {
  const res = await fetch(`/api/reviews/reviewee/${revieweeUserId}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function reviewSaveAll(reviews: Review[]): Promise<void> {
  await fetch("/api/reviews", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reviews),
  });
}

export async function reviewAdd(review: Review): Promise<Review[]> {
  await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(review),
  });
  return reviewGetAll();
}

export async function reviewClear(): Promise<void> {
  await fetch("/api/reviews/clear", { method: "POST" });
}
