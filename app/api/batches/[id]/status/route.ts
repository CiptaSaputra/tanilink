/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PATCH /api/batches/[id]/status — update status harvest batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { batchUpdateStatus } from '@/services';
import { HarvestBatch } from '@/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as { status: HarvestBatch['status'] };

    if (!body.status) {
      return NextResponse.json({ error: 'Status wajib diisi' }, { status: 400 });
    }

    const updated = batchUpdateStatus(id, body.status);
    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: 'Gagal update status batch' }, { status: 500 });
  }
}
