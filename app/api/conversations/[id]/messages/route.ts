/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GET  /api/conversations/[id]/messages — ambil semua pesan dalam conversation
 * POST /api/conversations/[id]/messages — kirim pesan baru
 */

import { NextRequest, NextResponse } from 'next/server';
import { messageGetByConversation, messageAdd } from '@/services';
import { Message } from '@/types';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = messageGetByConversation(id);
    return NextResponse.json({ data: messages });
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json() as Omit<Message, 'conversationId'>;

    if (!body.senderUserId || !body.content) {
      return NextResponse.json({ error: 'Pesan tidak lengkap' }, { status: 400 });
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      conversationId: id,
      senderUserId: body.senderUserId,
      content: body.content,
      sentAt: new Date().toISOString(),
    };

    const updated = messageAdd(newMsg);
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Gagal mengirim pesan' }, { status: 500 });
  }
}
