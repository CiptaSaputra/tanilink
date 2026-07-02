/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/matchService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Service layer untuk operasi data Match.
 * Matches bersifat computed (tidak perlu persist ke DB nantinya),
 * tapi status update-nya perlu disimpan agar tidak hilang saat re-compute.
 */

import { Match } from '../types';
import { STORAGE_KEYS, storageReadArray, storageWrite, storageRemove } from './storage';

// ─── Read ──────────────────────────────────────────────────────────────────────

/** Ambil semua match yang tersimpan (status snapshot). */
export function matchGetAll(): Match[] {
  return storageReadArray<Match>(STORAGE_KEYS.MATCHES);
}

/** Cari match berdasarkan ID. */
export function matchGetById(id: string): Match | undefined {
  return matchGetAll().find(m => m.id === id);
}

// ─── Write ─────────────────────────────────────────────────────────────────────

/** Simpan seluruh array match. */
export function matchSaveAll(matches: Match[]): void {
  storageWrite(STORAGE_KEYS.MATCHES, matches);
}

/**
 * Update status satu match berdasarkan ID.
 * Hanya menyimpan status — komputasi skor tetap di AppContext.
 */
export function matchUpdateStatus(id: string, status: Match['status']): void {
  const all = matchGetAll();
  const updated = all.map(m => m.id === id ? { ...m, status } : m);
  // Jika match belum tersimpan, tambahkan sebagai stub status saja
  if (!all.find(m => m.id === id)) {
    // Tidak ditambahkan — hanya update yang sudah ada
    return;
  }
  matchSaveAll(updated);
}

/** Upsert: update jika ada, tambah jika belum ada. */
export function matchUpsert(match: Match): void {
  const all = matchGetAll();
  const exists = all.find(m => m.id === match.id);
  if (exists) {
    matchSaveAll(all.map(m => m.id === match.id ? match : m));
  } else {
    matchSaveAll([...all, match]);
  }
}

/** Hapus semua match (dipanggil saat reset data). */
export function matchClear(): void {
  storageRemove(STORAGE_KEYS.MATCHES);
}
