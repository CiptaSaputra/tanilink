/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/utils/csv.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Helper pembuat string CSV dari array object — untuk fitur Export Dataset.
 */

/** Escape satu nilai untuk CSV (koma, quote, newline) */
function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Konversi array object → string CSV (baris pertama = header dari key) */
export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ];
  return lines.join("\r\n");
}
