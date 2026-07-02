/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/harvestService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Service layer untuk operasi data Harvest.
 * Implementasi saat ini: localStorage via storage helpers.
 * Untuk swap ke HTTP: ganti body setiap fungsi dengan fetch() calls.
 */

import { Harvest } from '../types';
import { STORAGE_KEYS, storageReadArray, storageWrite } from './storage';
import { SEED_HARVESTS } from '../data/seed';

// ─── Read ──────────────────────────────────────────────────────────────────────

/** Ambil semua harvest. Fallback ke seed data jika storage kosong. */
export function harvestGetAll(): Harvest[] {
  const stored = storageReadArray<Harvest>(STORAGE_KEYS.HARVESTS);
  if (stored.length === 0) {
    harvestSaveAll(SEED_HARVESTS);
    return SEED_HARVESTS;
  }

  // Bersihkan entri legacy H-LIVE dari simulator lama
  const cleaned = stored.filter(
    h => !h.id.startsWith('H-LIVE-') && !h.id.startsWith('h-live-')
  );

  // Migrasi: tambahkan isPublished jika belum ada
  const migrated = cleaned.map(h => ({ ...h, isPublished: h.isPublished ?? true }));

  if (migrated.length !== stored.length) {
    harvestSaveAll(migrated);
  }

  return migrated;
}

/** Cari satu harvest berdasarkan ID. */
export function harvestGetById(id: string): Harvest | undefined {
  return harvestGetAll().find(h => h.id === id);
}

// ─── Write ─────────────────────────────────────────────────────────────────────

/** Simpan seluruh array harvest (mengganti isi sebelumnya). */
export function harvestSaveAll(harvests: Harvest[]): void {
  storageWrite(STORAGE_KEYS.HARVESTS, harvests);
}

/** Tambah harvest baru ke daftar. */
export function harvestAdd(harvest: Harvest): Harvest[] {
  const all = harvestGetAll();
  const updated = [harvest, ...all];
  harvestSaveAll(updated);
  return updated;
}

/** Update satu harvest berdasarkan ID. */
export function harvestUpdate(id: string, patch: Partial<Harvest>): Harvest[] {
  const updated = harvestGetAll().map(h => h.id === id ? { ...h, ...patch } : h);
  harvestSaveAll(updated);
  return updated;
}

/** Hapus harvest berdasarkan ID. */
export function harvestRemove(id: string): Harvest[] {
  const updated = harvestGetAll().filter(h => h.id !== id);
  harvestSaveAll(updated);
  return updated;
}

/** Reset ke seed data. */
export function harvestReset(): Harvest[] {
  harvestSaveAll(SEED_HARVESTS);
  return SEED_HARVESTS;
}
