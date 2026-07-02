/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/storage.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Typed localStorage helper dengan error handling terpusat.
 *
 * DESAIN:
 * - Semua kunci localStorage didefinisikan di STORAGE_KEYS (satu tempat).
 * - read<T>()  → T | null  (tidak throws, returns null jika corrupt/kosong)
 * - write<T>() → void     (tidak throws, silent fail dengan console.warn)
 * - remove()   → void
 * - Siap di-swap ke HTTP fetch / Drizzle query saat backend tersedia:
 *   cukup ubah implementasi read/write di sini tanpa sentuh AppContext.
 */

// ─── Storage Keys ─────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  ACTIVE_ROLE:      'flw_active_role',
  HARVESTS:         'flw_harvests',
  DEMANDS:          'flw_demands',
  MATCHES:          'flw_matches',
  PRE_ORDERS:       'flw_pre_orders',
  HARVEST_BATCHES:  'flw_harvest_batches',
  CONVERSATIONS:    'flw_conversations',
  MESSAGES:         'flw_messages',
  PAYMENTS:         'flw_payments',
  REVIEWS:          'flw_reviews',
  AUTH_SESSION:     'flw_auth_session',
  USERS:            'flw_users',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

// ─── Core Helpers ─────────────────────────────────────────────────────────────

/**
 * Baca item dari localStorage dan parse sebagai T.
 * Mengembalikan null jika kosong, tidak ada, atau JSON corrupt.
 */
export function storageRead<T>(key: StorageKey): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[storage] Gagal membaca key "${key}":`, err);
    return null;
  }
}

/**
 * Tulis value ke localStorage sebagai JSON.
 * Silent fail dengan console.warn jika gagal (mis. storage penuh).
 */
export function storageWrite<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] Gagal menulis key "${key}":`, err);
  }
}

/**
 * Hapus satu key dari localStorage.
 */
export function storageRemove(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] Gagal menghapus key "${key}":`, err);
  }
}

/**
 * Baca array dari localStorage; jika tidak ada atau corrupt, kembalikan fallback.
 */
export function storageReadArray<T>(key: StorageKey, fallback: T[] = []): T[] {
  const result = storageRead<T[]>(key);
  return Array.isArray(result) ? result : fallback;
}

/**
 * Hapus semua key domain data (kecuali auth session dan users).
 */
export function storageClearDomain(): void {
  const domainKeys: StorageKey[] = [
    STORAGE_KEYS.ACTIVE_ROLE,
    STORAGE_KEYS.HARVESTS,
    STORAGE_KEYS.DEMANDS,
    STORAGE_KEYS.MATCHES,
    STORAGE_KEYS.PRE_ORDERS,
    STORAGE_KEYS.HARVEST_BATCHES,
    STORAGE_KEYS.CONVERSATIONS,
    STORAGE_KEYS.MESSAGES,
    STORAGE_KEYS.PAYMENTS,
    STORAGE_KEYS.REVIEWS,
  ];
  domainKeys.forEach(storageRemove);
}
