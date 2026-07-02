/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PATCH /api/payments/[id]/confirm — konfirmasi pembayaran
 */

import { NextRequest, NextResponse } from 'next/server';
import { paymentConfirm } from '@/services';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updated = paymentConfirm(id);
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Gagal konfirmasi payment' }, { status: 500 });
  }
}
