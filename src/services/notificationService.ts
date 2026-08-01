/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/notificationService.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Service layer untuk notifikasi ter-persist (riwayat per user).
 */

import { NotificationItem } from "../types";

export async function notificationGetAll(
  userId: string,
): Promise<NotificationItem[]> {
  const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function notificationAdd(
  notif: Omit<NotificationItem, "id" | "createdAt" | "read">,
): Promise<void> {
  try {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notif),
    });
  } catch (err) {
    console.warn("[notif] Gagal menyimpan notifikasi:", err);
  }
}

export async function notificationMarkRead(id: string): Promise<void> {
  try {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: true }),
    });
  } catch (err) {
    console.warn("[notif] Gagal mark read:", err);
  }
}

export async function notificationMarkAllRead(userId: string): Promise<void> {
  try {
    await fetch(`/api/notifications/read-all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  } catch (err) {
    console.warn("[notif] Gagal mark all read:", err);
  }
}
