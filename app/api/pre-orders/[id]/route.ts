import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { preOrders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await db.update(preOrders)
      .set(body) // Update partial fields like deliveryMode or status
      .where(eq(preOrders.id, id));

    const [updated] = await db.select().from(preOrders).where(eq(preOrders.id, id));

    if (!updated) {
      return NextResponse.json({ error: `Pre-order ${id} tidak ditemukan` }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal update pre-order' }, { status: 500 });
  }
}
