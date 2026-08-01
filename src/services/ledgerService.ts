/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/ledgerService.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Service layer untuk hash-chain ledger (tamper-evident riwayat transaksi).
 */

import { LedgerEntry } from "../types";

export async function ledgerGetAll(): Promise<LedgerEntry[]> {
  const res = await fetch("/api/ledger");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function ledgerAdd(
  preOrderId: string,
  recordData: string,
): Promise<LedgerEntry | null> {
  const res = await fetch("/api/ledger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preOrderId, recordData }),
  });
  if (!res.ok) return null;
  return res.json();
}
