/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PATCH /api/pre-orders/[id] — update satu pre-order
 */

import { NextRequest, NextResponse } from 'next/server';
import { preOrderUpdate } from '@/services';
import { PreOrder } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as Partial<PreOrder>;

    const updated = preOrderUpdate(id, body);
    return NextResponse.json({ data: updated.find(po => po.id === id) });
  } catch {
    return NextResponse.json({ error: 'Gagal update pre-order' }, { status: 500 });
  }
}
