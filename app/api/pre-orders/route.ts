import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { preOrders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.select().from(preOrders);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil data pre-orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.matchId) {
      return NextResponse.json({ error: 'Data pre-order tidak lengkap' }, { status: 400 });
    }

    await db.insert(preOrders).values({
      id: body.id,
      matchId: body.matchId,
      harvestId: body.harvestId,
      demandId: body.demandId,
      agreedPricePerKg: body.agreedPricePerKg,
      agreedVolumeKg: body.agreedVolumeKg,
      farmerName: body.farmerName,
      buyerName: body.buyerName,
      commodity: body.commodity,
      deliveryMode: body.deliveryMode,
      status: body.status || 'PENDING',
    });

    const [updated] = await db.select().from(preOrders).where(eq(preOrders.id, body.id));
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambah pre-order' }, { status: 500 });
  }
}
