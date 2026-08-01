/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/NotificationContext.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Notifikasi ter-persist (riwayat per user) + unread count.
 * Data dari API `/api/notifications`, di-sync dengan aksi domain (match/PO/batch).
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { NotificationItem } from "../types";
import {
  notificationGetAll,
  notificationAdd as svcNotificationAdd,
  notificationMarkRead,
  notificationMarkAllRead,
} from "../services";
import { useAuth } from "./AuthContext";

interface NotificationContextProps {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (
    notif: Omit<NotificationItem, "id" | "createdAt" | "read">,
  ) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const refresh = useCallback(async () => {
    if (!currentUser?.id) return;
    const list = await notificationGetAll(currentUser.id);
    setNotifications(list);
  }, [currentUser?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    async (notif: Omit<NotificationItem, "id" | "createdAt" | "read">) => {
      await svcNotificationAdd(notif);
      await refresh();
    },
    [refresh],
  );

  const markRead = useCallback(
    async (id: string) => {
      await notificationMarkRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    if (!currentUser?.id) return;
    await notificationMarkAllRead(currentUser.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [currentUser?.id]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markRead,
        markAllRead,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextProps => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications harus di dalam NotificationProvider");
  return ctx;
};
