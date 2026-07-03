import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentConfirmations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.select().from(paymentConfirmations);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil data payments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.preOrderId) {
      return NextResponse.json({ error: 'Data payment tidak lengkap' }, { status: 400 });
    }

    await db.insert(paymentConfirmations).values({
      id: body.id,
      preOrderId: body.preOrderId,
      proofImageUrl: body.proofImageUrl || null,
      status: body.status || 'not_submitted',
      notes: body.notes || null,
    });

    const [updated] = await db.select().from(paymentConfirmations).where(eq(paymentConfirmations.id, body.id));
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambah payment' }, { status: 500 });
  }
}
