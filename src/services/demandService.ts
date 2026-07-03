/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/demandService.ts
 */
import { Demand } from '../types';

export async function demandGetAll(): Promise<Demand[]> {
  const res = await fetch('/api/demands');
  if (!res.ok) return [];
  return res.json();
}

export async function demandGetById(id: string): Promise<Demand | undefined> {
  const res = await fetch(`/api/demands/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function demandSaveAll(demands: Demand[]): Promise<void> {
  await fetch('/api/demands', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(demands),
  });
}

export async function demandAdd(demand: Demand): Promise<Demand[]> {
  await fetch('/api/demands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(demand),
  });
  return demandGetAll();
}

export async function demandUpdate(id: string, patch: Partial<Demand>): Promise<Demand[]> {
  await fetch(`/api/demands/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return demandGetAll();
}

export async function demandRemove(id: string): Promise<Demand[]> {
  await fetch(`/api/demands/${id}`, { method: 'DELETE' });
  return demandGetAll();
}

export async function demandReset(): Promise<Demand[]> {
  await fetch('/api/demands/reset', { method: 'POST' });
  return demandGetAll();
}
