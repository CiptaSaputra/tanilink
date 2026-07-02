/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PATCH /api/matches/[id]/status — update status satu match
 */

import { NextRequest, NextResponse } from 'next/server';
import { matchGetAll, matchSaveAll } from '@/services';
import { Match } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as { status: Match['status'] };

    if (!body.status) {
      return NextResponse.json({ error: 'Status wajib diisi' }, { status: 400 });
    }

    const all = matchGetAll();
    const match = all.find(m => m.id === id);

    if (!match) {
      return NextResponse.json({ error: `Match ${id} tidak ditemukan` }, { status: 404 });
    }

    const updated = all.map(m => m.id === id ? { ...m, status: body.status } : m);
    matchSaveAll(updated);

    return NextResponse.json({ data: updated.find(m => m.id === id) });
  } catch {
    return NextResponse.json({ error: 'Gagal update status match' }, { status: 500 });
  }
}
