/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from "../types";

/**
 * Hash sederhana berbasis btoa — hanya untuk demo tanpa backend.
 * Bukan untuk produksi: tidak ada salt, tidak aman untuk data nyata.
 */
export function hashPassword(password: string): string {
  return btoa(password);
}

export function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

/**
 * Akun demo default. Password semua: "demo123"
 * Admin & Dinas tidak bisa self-register — hanya tersedia lewat seed ini.
 */
export const SEED_USERS: User[] = [
  {
    id: "u-petani-1",
    name: "Pak Budi Santoso",
    email: "petani@demo.com",
    passwordHash: hashPassword("demo123"),
    role: "PETANI",
    region: "Brebes",
    phone: "6285XXXXXXXXX", // ← Ganti nomor WA petani demo
    createdAt: "2026-01-01",
  },
  {
    id: "u-pembeli-1",
    name: "Koperasi Jaya Tani",
    email: "pembeli@demo.com",
    passwordHash: hashPassword("demo123"),
    role: "PEMBELI",
    region: "Semarang",
    phone: "6281XXXXXXXXX", // ← Ganti nomor WA pembeli demo
    createdAt: "2026-01-01",
  },
  {
    id: "u-ppl-1",
    name: "Budi Santoso, S.P.",
    email: "ppl@demo.com",
    passwordHash: hashPassword("demo123"),
    role: "PPL",
    region: "Brebes",
    phone: "6282XXXXXXXXX",
    createdAt: "2026-01-01",
  },
  {
    id: "u-kolektor-1",
    name: "Rudi Angkut",
    email: "kolektor@demo.com",
    passwordHash: hashPassword("demo123"),
    role: "KOLEKTOR",
    region: "Cirebon",
    phone: "6283XXXXXXXXX",
    createdAt: "2026-01-01",
  },
  {
    id: "u-dinas-1",
    name: "Ir. Siti Rahayu, M.Sc.",
    email: "dinas@demo.com",
    passwordHash: hashPassword("demo123"),
    role: "DINAS",
    region: "Jawa Tengah",
    phone: "6284XXXXXXXXX",
    createdAt: "2026-01-01",
  },
  {
    id: "u-admin-1",
    name: "Administrator TaniLink",
    email: "admin@demo.com",
    passwordHash: hashPassword("demo123"),
    role: "ADMIN",
    region: "Jakarta",
    phone: "6289XXXXXXXXX",
    createdAt: "2026-01-01",
  },
];

