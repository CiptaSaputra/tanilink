/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/preOrderService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Service layer untuk operasi data PreOrder dan HarvestBatch.
 */

import { PreOrder, HarvestBatch } from '../types';
import { STORAGE_KEYS, storageReadArray, storageWrite, storageRemove } from './storage';

// ═══════════════════════════════════════════════════════════════════════════════
// PRE-ORDERS
// ═══════════════════════════════════════════════════════════════════════════════

export function preOrderGetAll(): PreOrder[] {
  return storageReadArray<PreOrder>(STORAGE_KEYS.PRE_ORDERS);
}

export function preOrderGetById(id: string): PreOrder | undefined {
  return preOrderGetAll().find(po => po.id === id);
}

export function preOrderSaveAll(preOrders: PreOrder[]): void {
  storageWrite(STORAGE_KEYS.PRE_ORDERS, preOrders);
}

export function preOrderAdd(preOrder: PreOrder): PreOrder[] {
  const updated = [preOrder, ...preOrderGetAll()];
  preOrderSaveAll(updated);
  return updated;
}

export function preOrderUpdate(id: string, patch: Partial<PreOrder>): PreOrder[] {
  const updated = preOrderGetAll().map(po => po.id === id ? { ...po, ...patch } : po);
  preOrderSaveAll(updated);
  return updated;
}

/** Update delivery mode untuk satu pre-order. */
export function preOrderSetDeliveryMode(id: string, mode: 'direct' | 'consolidated'): PreOrder[] {
  return preOrderUpdate(id, { deliveryMode: mode });
}

/** Tandai pre-order sebagai COMPLETED. */
export function preOrderComplete(id: string): PreOrder[] {
  return preOrderUpdate(id, { status: 'COMPLETED' });
}

export function preOrderClear(): void {
  storageRemove(STORAGE_KEYS.PRE_ORDERS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// HARVEST BATCHES
// ═══════════════════════════════════════════════════════════════════════════════

export function batchGetAll(): HarvestBatch[] {
  return storageReadArray<HarvestBatch>(STORAGE_KEYS.HARVEST_BATCHES);
}

export function batchGetById(id: string): HarvestBatch | undefined {
  return batchGetAll().find(b => b.id === id);
}

export function batchSaveAll(batches: HarvestBatch[]): void {
  storageWrite(STORAGE_KEYS.HARVEST_BATCHES, batches);
}

export function batchAdd(batch: HarvestBatch): HarvestBatch[] {
  const updated = [batch, ...batchGetAll()];
  batchSaveAll(updated);
  return updated;
}

export function batchUpdate(id: string, patch: Partial<HarvestBatch>): HarvestBatch[] {
  const updated = batchGetAll().map(b => b.id === id ? { ...b, ...patch } : b);
  batchSaveAll(updated);
  return updated;
}

export function batchUpdateStatus(id: string, status: HarvestBatch['status']): HarvestBatch[] {
  return batchUpdate(id, { status });
}

export function batchClear(): void {
  storageRemove(STORAGE_KEYS.HARVEST_BATCHES);
}
