/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET  /api/payments            — ambil semua payment
 * POST /api/payments            — upload bukti bayar (upsert by preOrderId)
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymentGetAll, paymentUpsertByPreOrder } from '@/services';

export async function GET() {
  try {
    return NextResponse.json({ data: paymentGetAll() });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil payments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { preOrderId: string; proofImageUrl?: string; notes?: string };

    if (!body.preOrderId) {
      return NextResponse.json({ error: 'preOrderId wajib diisi' }, { status: 400 });
    }

    const updated = paymentUpsertByPreOrder(body.preOrderId, body.proofImageUrl, body.notes);
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal menyimpan payment' }, { status: 500 });
  }
}
