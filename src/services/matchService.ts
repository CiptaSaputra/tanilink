/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/matchService.ts
 */
import { Match } from '../types';

export async function matchGetAll(): Promise<Match[]> {
  const res = await fetch('/api/matches');
  if (!res.ok) return [];
  return res.json();
}

export async function matchGetById(id: string): Promise<Match | undefined> {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function matchSaveAll(matches: Match[]): Promise<void> {
  await fetch('/api/matches', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(matches),
  });
}

export async function matchUpdateStatus(id: string, status: Match['status']): Promise<void> {
  await fetch(`/api/matches/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

export async function matchUpsert(match: Match): Promise<void> {
  await fetch(`/api/matches/${match.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(match),
  });
}

export async function matchClear(): Promise<void> {
  await fetch('/api/matches/clear', { method: 'POST' });
}
