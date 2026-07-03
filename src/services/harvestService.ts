/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/harvestService.ts
 */
import { Harvest } from '../types';

export async function harvestGetAll(): Promise<Harvest[]> {
  const res = await fetch('/api/harvests');
  if (!res.ok) return [];
  return res.json();
}

export async function harvestGetById(id: string): Promise<Harvest | undefined> {
  const res = await fetch(`/api/harvests/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function harvestSaveAll(harvests: Harvest[]): Promise<void> {
  await fetch('/api/harvests', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(harvests),
  });
}

export async function harvestAdd(harvest: Harvest): Promise<Harvest[]> {
  await fetch('/api/harvests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(harvest),
  });
  return harvestGetAll();
}

export async function harvestUpdate(id: string, patch: Partial<Harvest>): Promise<Harvest[]> {
  await fetch(`/api/harvests/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return harvestGetAll();
}

export async function harvestRemove(id: string): Promise<Harvest[]> {
  await fetch(`/api/harvests/${id}`, { method: 'DELETE' });
  return harvestGetAll();
}

export async function harvestReset(): Promise<Harvest[]> {
  await fetch('/api/harvests/reset', { method: 'POST' });
  return harvestGetAll();
}
