/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/preOrderService.ts
 */
import { PreOrder, HarvestBatch } from '../types';

export async function preOrderGetAll(): Promise<PreOrder[]> {
  const res = await fetch('/api/pre-orders');
  if (!res.ok) return [];
  return res.json();
}

export async function preOrderGetById(id: string): Promise<PreOrder | undefined> {
  const res = await fetch(`/api/pre-orders/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function preOrderSaveAll(preOrders: PreOrder[]): Promise<void> {
  await fetch('/api/pre-orders', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preOrders),
  });
}

export async function preOrderAdd(preOrder: PreOrder): Promise<PreOrder[]> {
  await fetch('/api/pre-orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preOrder),
  });
  return preOrderGetAll();
}

export async function preOrderUpdate(id: string, patch: Partial<PreOrder>): Promise<PreOrder[]> {
  await fetch(`/api/pre-orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return preOrderGetAll();
}

export async function preOrderSetDeliveryMode(id: string, mode: 'direct' | 'consolidated'): Promise<PreOrder[]> {
  return preOrderUpdate(id, { deliveryMode: mode });
}

export async function preOrderComplete(id: string): Promise<PreOrder[]> {
  return preOrderUpdate(id, { status: 'COMPLETED' });
}

export async function preOrderClear(): Promise<void> {
  await fetch('/api/pre-orders/clear', { method: 'POST' });
}

export async function batchGetAll(): Promise<HarvestBatch[]> {
  const res = await fetch('/api/harvest-batches');
  if (!res.ok) return [];
  return res.json();
}

export async function batchGetById(id: string): Promise<HarvestBatch | undefined> {
  const res = await fetch(`/api/harvest-batches/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function batchSaveAll(batches: HarvestBatch[]): Promise<void> {
  await fetch('/api/harvest-batches', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batches),
  });
}

export async function batchAdd(batch: HarvestBatch): Promise<HarvestBatch[]> {
  await fetch('/api/harvest-batches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
  });
  return batchGetAll();
}

export async function batchUpdate(id: string, patch: Partial<HarvestBatch>): Promise<HarvestBatch[]> {
  await fetch(`/api/harvest-batches/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return batchGetAll();
}

export async function batchUpdateStatus(id: string, status: HarvestBatch['status']): Promise<HarvestBatch[]> {
  return batchUpdate(id, { status });
}

export async function batchClear(): Promise<void> {
  await fetch('/api/harvest-batches/clear', { method: 'POST' });
}
