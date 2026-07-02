/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET  /api/pre-orders — ambil semua pre-order
 * POST /api/pre-orders — buat pre-order baru
 */

import { NextRequest, NextResponse } from 'next/server';
import { preOrderGetAll, preOrderAdd } from '@/services';
import { PreOrder } from '@/types';

export async function GET() {
  try {
    return NextResponse.json({ data: preOrderGetAll() });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil pre-orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PreOrder;

    if (!body.id || !body.matchId || !body.harvestId || !body.demandId) {
      return NextResponse.json({ error: 'Data pre-order tidak lengkap' }, { status: 400 });
    }

    const updated = preOrderAdd(body);
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal membuat pre-order' }, { status: 500 });
  }
}
