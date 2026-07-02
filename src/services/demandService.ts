/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/demandService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Service layer untuk operasi data Demand (permintaan pembeli).
 */

import { Demand } from '../types';
import { STORAGE_KEYS, storageReadArray, storageWrite } from './storage';
import { SEED_DEMANDS } from '../data/seed';

// ─── Read ──────────────────────────────────────────────────────────────────────

/** Ambil semua demand. Fallback ke seed data jika storage kosong. */
export function demandGetAll(): Demand[] {
  const stored = storageReadArray<Demand>(STORAGE_KEYS.DEMANDS);
  if (stored.length === 0) {
    demandSaveAll(SEED_DEMANDS);
    return SEED_DEMANDS;
  }
  return stored;
}

/** Cari satu demand berdasarkan ID. */
export function demandGetById(id: string): Demand | undefined {
  return demandGetAll().find(d => d.id === id);
}

// ─── Write ─────────────────────────────────────────────────────────────────────

/** Simpan seluruh array demand. */
export function demandSaveAll(demands: Demand[]): void {
  storageWrite(STORAGE_KEYS.DEMANDS, demands);
}

/** Tambah demand baru. */
export function demandAdd(demand: Demand): Demand[] {
  const all = demandGetAll();
  const updated = [demand, ...all];
  demandSaveAll(updated);
  return updated;
}

/** Update satu demand berdasarkan ID. */
export function demandUpdate(id: string, patch: Partial<Demand>): Demand[] {
  const updated = demandGetAll().map(d => d.id === id ? { ...d, ...patch } : d);
  demandSaveAll(updated);
  return updated;
}

/** Hapus demand berdasarkan ID. */
export function demandRemove(id: string): Demand[] {
  const updated = demandGetAll().filter(d => d.id !== id);
  demandSaveAll(updated);
  return updated;
}

/** Reset ke seed data. */
export function demandReset(): Demand[] {
  demandSaveAll(SEED_DEMANDS);
  return SEED_DEMANDS;
}
