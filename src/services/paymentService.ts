/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/paymentService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Service layer untuk operasi data PaymentConfirmation.
 */

import { PaymentConfirmation } from '../types';
import { STORAGE_KEYS, storageReadArray, storageWrite, storageRemove } from './storage';

// ─── Read ──────────────────────────────────────────────────────────────────────

export function paymentGetAll(): PaymentConfirmation[] {
  return storageReadArray<PaymentConfirmation>(STORAGE_KEYS.PAYMENTS);
}

export function paymentGetById(id: string): PaymentConfirmation | undefined {
  return paymentGetAll().find(p => p.id === id);
}

export function paymentGetByPreOrder(preOrderId: string): PaymentConfirmation | undefined {
  return paymentGetAll().find(p => p.preOrderId === preOrderId);
}

// ─── Write ─────────────────────────────────────────────────────────────────────

export function paymentSaveAll(payments: PaymentConfirmation[]): void {
  storageWrite(STORAGE_KEYS.PAYMENTS, payments);
}

export function paymentAdd(payment: PaymentConfirmation): PaymentConfirmation[] {
  const updated = [...paymentGetAll(), payment];
  paymentSaveAll(updated);
  return updated;
}

export function paymentUpdate(id: string, patch: Partial<PaymentConfirmation>): PaymentConfirmation[] {
  const updated = paymentGetAll().map(p => p.id === id ? { ...p, ...patch } : p);
  paymentSaveAll(updated);
  return updated;
}

/** Upsert: update jika sudah ada payment untuk preOrderId, tambah jika belum. */
export function paymentUpsertByPreOrder(
  preOrderId: string,
  proofImageUrl?: string,
  notes?: string
): PaymentConfirmation[] {
  const existing = paymentGetByPreOrder(preOrderId);
  if (existing) {
    return paymentUpdate(existing.id, {
      proofImageUrl: proofImageUrl ?? existing.proofImageUrl,
      notes: notes ?? existing.notes,
      status: 'submitted',
    });
  } else {
    const newPayment: PaymentConfirmation = {
      id: `pay-${Date.now()}`,
      preOrderId,
      proofImageUrl,
      notes,
      status: 'submitted',
    };
    return paymentAdd(newPayment);
  }
}

/** Konfirmasi pembayaran (ubah status menjadi confirmed). */
export function paymentConfirm(id: string): PaymentConfirmation[] {
  return paymentUpdate(id, { status: 'confirmed' });
}

export function paymentClear(): void {
  storageRemove(STORAGE_KEYS.PAYMENTS);
}
