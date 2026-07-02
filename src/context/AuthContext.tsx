/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  AuthContextProps,
  LoginCredentials,
  RegisterData,
  User,
} from '../types';
import { SEED_USERS, hashPassword, verifyPassword } from '../data/users';

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY_SESSION = 'flw_auth_session'; // stores AuthUser (no passwordHash)
const STORAGE_KEY_USERS   = 'flw_users';        // stores User[] (with passwordHash)

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Baca daftar user dari localStorage, fallback ke seed jika kosong */
function loadUsers(): User[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (stored) return JSON.parse(stored) as User[];
  } catch {
    // localStorage corrupt → reset ke seed
  }
  const initial = [...SEED_USERS];
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(initial));
  return initial;
}

function saveUsers(users: User[]): void {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function toAuthUser(user: User): AuthUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _removed, ...authUser } = user;
  return authUser;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session saat mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSION);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthUser;
        setCurrentUser(parsed);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> => {
      const { email, password } = credentials;

      if (!email.trim() || !password) {
        return { success: false, error: 'Email dan password wajib diisi.' };
      }

      const users = loadUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

      if (!user) {
        return { success: false, error: 'Email tidak terdaftar.' };
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return { success: false, error: 'Password salah.' };
      }

      const authUser = toAuthUser(user);
      setCurrentUser(authUser);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser));

      return { success: true };
    },
    []
  );

  const register = useCallback(
    async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
      const { name, email, password, confirmPassword, role, region } = data;

      // Validasi field
      if (!name.trim()) return { success: false, error: 'Nama wajib diisi.' };
      if (!email.trim()) return { success: false, error: 'Email wajib diisi.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, error: 'Format email tidak valid.' };
      }
      if (password.length < 6) {
        return { success: false, error: 'Password minimal 6 karakter.' };
      }
      if (password !== confirmPassword) {
        return { success: false, error: 'Konfirmasi password tidak cocok.' };
      }
      if (!region.trim()) return { success: false, error: 'Wilayah wajib diisi.' };

      // Role Admin & Dinas tidak bisa self-register (dicegah di UI, double-check di logic)
      const forbiddenRoles: string[] = ['ADMIN', 'DINAS'];
      if (forbiddenRoles.includes(role)) {
        return { success: false, error: 'Role Admin dan Dinas tidak dapat mendaftar sendiri.' };
      }

      const users = loadUsers();

      // Cek email duplikat
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
        return { success: false, error: 'Email sudah digunakan akun lain.' };
      }

      const newUser: User = {
        id: `u-${role.toLowerCase()}-${Date.now()}`,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: hashPassword(password),
        role,
        region: region.trim(),
        createdAt: new Date().toISOString().split('T')[0],
      };

      const updatedUsers = [...users, newUser];
      saveUsers(updatedUsers);

      // Auto-login setelah register
      const authUser = toAuthUser(newUser);
      setCurrentUser(authUser);
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(authUser));

      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    // Bersihkan active role agar tidak ada state stale
    localStorage.removeItem('flw_active_role');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
