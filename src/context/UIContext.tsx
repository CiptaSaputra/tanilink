/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/UIContext.tsx
 * ─────────────────────────────────────────
 * UI state: active role, notifications, reset.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Role } from '../types';
import { STORAGE_KEYS, storageRead, storageWrite, storageClearDomain } from '../services';
import { useAuth } from './AuthContext';

interface UIContextProps {
  activeRole:           Role;
  notification:         { message: string; type: 'success' | 'warning' | 'info' } | null;
  setRole:              (role: Role) => void;
  showNotification:     (message: string, type: 'success' | 'warning' | 'info') => void;
  dismissNotification:  () => void;
  resetAllData:         () => void;
}

const UIContext = createContext<UIContextProps | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [activeRole, setActiveRole] = useState<Role>(() => {
    if (currentUser) return currentUser.role;
    return (storageRead<Role>(STORAGE_KEYS.ACTIVE_ROLE)) ?? 'PETANI';
  });

  useEffect(() => {
    if (currentUser) setActiveRole(currentUser.role);
  }, [currentUser]);

  const [notification, setNotification] = useState<UIContextProps['notification']>(null);

  useEffect(() => {
    storageWrite(STORAGE_KEYS.ACTIVE_ROLE, activeRole);
  }, [activeRole]);

  const showNotification = useCallback(
    (message: string, type: 'success' | 'warning' | 'info') => setNotification({ message, type }),
    []
  );

  const dismissNotification = useCallback(() => setNotification(null), []);
  const setRole = useCallback((role: Role) => setActiveRole(role), []);

  const resetAllData = useCallback(() => {
    storageClearDomain();
    window.location.reload();
  }, []);

  return (
    <UIContext.Provider value={{ activeRole, notification, setRole, showNotification, dismissNotification, resetAllData }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextProps => {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI harus digunakan di dalam UIProvider');
  return ctx;
};
