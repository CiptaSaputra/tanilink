/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  AuthUser,
  AuthContextProps,
  LoginCredentials,
  RegisterData,
  User,
} from "../types";
import { SEED_USERS, hashPassword, verifyPassword } from "../data/users";

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY_SESSION = "flw_auth_session"; // stores AuthUser (no passwordHash)
const STORAGE_KEY_USERS = "flw_users"; // stores User[] (with passwordHash)

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
    async (
      credentials: LoginCredentials,
    ): Promise<{ success: boolean; error?: string }> => {
      const { email, password } = credentials;
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (data.success) {
          setCurrentUser(data.user);
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(data.user));
          return { success: true };
        } else {
          return { success: false, error: data.error };
        }
      } catch (err) {
        return { success: false, error: "Network error" };
      }
    },
    [],
  );

  const register = useCallback(
    async (
      data: RegisterData,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (json.success) {
          setCurrentUser(json.user);
          localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(json.user));
          return { success: true };
        } else {
          return { success: false, error: json.error };
        }
      } catch (err) {
        return { success: false, error: "Network error" };
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    // Bersihkan active role agar tidak ada state stale
    localStorage.removeItem("flw_active_role");
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
    throw new Error("useAuth harus digunakan di dalam AuthProvider");
  }
  return context;
};
