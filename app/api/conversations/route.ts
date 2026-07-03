import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { conversations } from '@/db/schema';

export async function GET() {
  try {
    const data = await db.select().from(conversations);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil data conversations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.matchId) {
      return NextResponse.json({ error: 'Data conversation tidak lengkap' }, { status: 400 });
    }

    await db.insert(conversations).values({
      id: body.id,
      matchId: body.matchId,
      farmerUserId: body.farmerUserId,
      buyerUserId: body.buyerUserId,
    });

    return NextResponse.json({ data: body }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambah conversation' }, { status: 500 });
  }
}
