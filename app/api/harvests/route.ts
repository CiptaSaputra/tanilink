/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET  /api/harvests — ambil semua harvest
 * POST /api/harvests — tambah harvest baru
 */

import { NextRequest, NextResponse } from 'next/server';
import { harvestGetAll, harvestAdd } from '@/services';
import { Harvest } from '@/types';

export async function GET() {
  try {
    const harvests = harvestGetAll();
    return NextResponse.json({ data: harvests });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data harvest' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Harvest;

    if (!body.id || !body.commodity || !body.farmerId) {
      return NextResponse.json({ error: 'Data harvest tidak lengkap' }, { status: 400 });
    }

    const updated = harvestAdd(body);
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal menambah harvest' }, { status: 500 });
  }
}
