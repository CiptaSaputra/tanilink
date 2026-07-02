/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET  /api/demands — ambil semua demand
 * POST /api/demands — tambah demand baru
 */

import { NextRequest, NextResponse } from 'next/server';
import { demandGetAll, demandAdd } from '@/services';
import { Demand } from '@/types';

export async function GET() {
  try {
    const demands = demandGetAll();
    return NextResponse.json({ data: demands });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data demand' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Demand;

    if (!body.id || !body.commodity || !body.buyerId) {
      return NextResponse.json({ error: 'Data demand tidak lengkap' }, { status: 400 });
    }

    const updated = demandAdd(body);
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal menambah demand' }, { status: 500 });
  }
}
