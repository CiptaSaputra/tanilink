import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { messages } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await db.select().from(messages).where(eq(messages.conversationId, id));
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil data messages' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.id || !body.senderUserId || !body.content) {
      return NextResponse.json({ error: 'Data message tidak lengkap' }, { status: 400 });
    }

    await db.insert(messages).values({
      id: body.id,
      conversationId: id,
      senderUserId: body.senderUserId,
      content: body.content,
      sentAt: body.sentAt ? new Date(body.sentAt) : undefined, // drizzle defaultNow handles if omitted, but schema maps to Date
    });

    return NextResponse.json({ data: { ...body, conversationId: id } }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambah message' }, { status: 500 });
  }
}
