/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/paymentService.ts
 */
import { PaymentConfirmation } from "../types";

export async function paymentGetAll(): Promise<PaymentConfirmation[]> {
  const res = await fetch("/api/payments");
  if (!res.ok) return [];
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function paymentGetById(
  id: string,
): Promise<PaymentConfirmation | undefined> {
  const res = await fetch(`/api/payments/${id}`);
  if (!res.ok) return undefined;
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function paymentGetByPreOrder(
  preOrderId: string,
): Promise<PaymentConfirmation | undefined> {
  const res = await fetch(`/api/payments/pre-order/${preOrderId}`);
  if (!res.ok) return undefined;
  const json = await res.json();
  return json.data !== undefined ? json.data : json;
}

export async function paymentSaveAll(
  payments: PaymentConfirmation[],
): Promise<void> {
  await fetch("/api/payments", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payments),
  });
}

export async function paymentAdd(
  payment: PaymentConfirmation,
): Promise<PaymentConfirmation[]> {
  await fetch("/api/payments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payment),
  });
  return paymentGetAll();
}

export async function paymentUpdate(
  id: string,
  patch: Partial<PaymentConfirmation>,
): Promise<PaymentConfirmation[]> {
  await fetch(`/api/payments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return paymentGetAll();
}

export interface PaymentTransferData {
  proofImageUrl?: string;
  notes?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  amount?: number;
  paidAt?: string;
}

export async function paymentUpsertByPreOrder(
  preOrderId: string,
  data: PaymentTransferData = {},
): Promise<PaymentConfirmation[]> {
  const existing = await paymentGetByPreOrder(preOrderId);
  if (existing) {
    return paymentUpdate(existing.id, {
      proofImageUrl: data.proofImageUrl ?? existing.proofImageUrl,
      notes: data.notes ?? existing.notes,
      bankName: data.bankName ?? existing.bankName,
      accountNumber: data.accountNumber ?? existing.accountNumber,
      accountName: data.accountName ?? existing.accountName,
      amount: data.amount ?? existing.amount,
      paidAt: data.paidAt ?? existing.paidAt,
      status: "submitted",
    });
  } else {
    const newPayment: PaymentConfirmation = {
      id: `pay-${Date.now()}`,
      preOrderId,
      proofImageUrl: data.proofImageUrl,
      notes: data.notes,
      bankName: data.bankName,
      accountNumber: data.accountNumber,
      accountName: data.accountName,
      amount: data.amount,
      paidAt: data.paidAt,
      status: "submitted",
    };
    return paymentAdd(newPayment);
  }
}

export async function paymentConfirm(
  id: string,
): Promise<PaymentConfirmation[]> {
  return paymentUpdate(id, { status: "confirmed" });
}

export async function paymentClear(): Promise<void> {
  await fetch("/api/payments/clear", { method: "POST" });
}
