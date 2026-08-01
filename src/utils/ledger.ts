/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/utils/ledger.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Hash-chain ledger helper — tamper-evident riwayat transaksi.
 * Setiap entri menyimpan hash dari entri sebelumnya (SHA-256), sehingga
 * manipulasi data di tengah rantai akan memutus validitas seluruh rantai.
 *
 * Alur:
 *   recordData = JSON transaksi (komoditas, volume, harga, pihak, waktu)
 *   currentHash = SHA256(recordData + "|" + previousHash)
 */

export interface LedgerEntry {
  id: string;
  preOrderId: string;
  recordData: string;
  previousHash: string;
  currentHash: string;
  createdAt: string;
}

/** SHA-256 hex digest (Web Crypto, tersedia di browser & Node 18+) */
export async function sha256(text: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback simple hash (demo) jika Web Crypto tak tersedia
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** Hitung currentHash untuk sebuah entri */
export async function computeHash(
  recordData: string,
  previousHash: string,
): Promise<string> {
  return sha256(`${recordData}|${previousHash}`);
}

/**
 * Verifikasi integritas seluruh rantai.
 * Mengembalikan daftar id entri yang "rusak" (hash tidak cocok).
 */
export async function verifyChain(entries: LedgerEntry[]): Promise<string[]> {
  const broken: string[] = [];
  let prevHash = "GENESIS";

  for (const entry of entries) {
    const expected = await computeHash(entry.recordData, prevHash);
    if (entry.currentHash !== expected) {
      broken.push(entry.id);
    }
    prevHash = entry.currentHash;
  }
  return broken;
}

/** Formatting singkat hash untuk tampilan (mis. 8 char pertama) */
export function shortHash(hash: string, len = 10): string {
  return hash.length > len ? hash.slice(0, len) + "…" : hash;
}
