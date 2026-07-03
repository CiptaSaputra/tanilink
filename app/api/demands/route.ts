import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { demands } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.select().from(demands);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil data demand' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.commodity || !body.buyerId) {
      return NextResponse.json({ error: 'Data demand tidak lengkap' }, { status: 400 });
    }

    await db.insert(demands).values({
      id: body.id,
      buyerId: body.buyerId,
      buyerName: body.buyerName,
      commodity: body.commodity,
      requiredVolume: body.requiredVolume,
      offerPrice: body.offerPrice,
      latitude: body.latitude,
      longitude: body.longitude,
      region: body.region,
      dateRequired: body.dateRequired,
      status: body.status || 'ACTIVE',
      notes: body.notes || null,
    });

    const [updated] = await db.select().from(demands).where(eq(demands.id, body.id));
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambah demand' }, { status: 500 });
  }
}
