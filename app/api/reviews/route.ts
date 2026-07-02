/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET  /api/reviews — ambil semua review
 * POST /api/reviews — tambah review baru
 */

import { NextRequest, NextResponse } from 'next/server';
import { reviewGetAll, reviewAdd } from '@/services';
import { Review } from '@/types';

export async function GET() {
  try {
    return NextResponse.json({ data: reviewGetAll() });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Omit<Review, 'id' | 'createdAt'>;

    if (!body.preOrderId || !body.reviewerUserId || !body.revieweeUserId || !body.rating) {
      return NextResponse.json({ error: 'Data review tidak lengkap' }, { status: 400 });
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json({ error: 'Rating harus antara 1-5' }, { status: 400 });
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = reviewAdd(newReview);
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal menambah review' }, { status: 500 });
  }
}
