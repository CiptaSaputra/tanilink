import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { paymentConfirmations } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await db.update(paymentConfirmations)
      .set({ status: body.status || 'confirmed' })
      .where(eq(paymentConfirmations.id, id));

    const [updated] = await db.select().from(paymentConfirmations).where(eq(paymentConfirmations.id, id));

    if (!updated) {
      return NextResponse.json({ error: `Payment ${id} tidak ditemukan` }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal update status payment' }, { status: 500 });
  }
}
