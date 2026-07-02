/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET  /api/conversations — ambil semua conversation
 * POST /api/conversations — buat conversation baru (idempotent by matchId)
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationGetAll, conversationAdd } from '@/services';
import { Conversation } from '@/types';

export async function GET() {
  try {
    return NextResponse.json({ data: conversationGetAll() });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Conversation;

    if (!body.matchId || !body.farmerUserId || !body.buyerUserId) {
      return NextResponse.json({ error: 'Data conversation tidak lengkap' }, { status: 400 });
    }

    const { conversation, isNew } = conversationAdd(body);
    return NextResponse.json({ data: conversation }, { status: isNew ? 201 : 200 });
  } catch {
    return NextResponse.json({ error: 'Gagal membuat conversation' }, { status: 500 });
  }
}
