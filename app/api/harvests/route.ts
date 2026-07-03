import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { harvests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.select().from(harvests);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil data harvest' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.commodity || !body.farmerId) {
      return NextResponse.json({ error: 'Data harvest tidak lengkap' }, { status: 400 });
    }

    await db.insert(harvests).values({
      id: body.id,
      farmerId: body.farmerId,
      farmerName: body.farmerName,
      commodity: body.commodity,
      landArea: body.landArea,
      expectedVolume: body.expectedVolume,
      askingPrice: body.askingPrice,
      latitude: body.latitude,
      longitude: body.longitude,
      region: body.region,
      plantingDate: body.plantingDate,
      expectedHarvestDate: body.expectedHarvestDate,
      isPublished: body.isPublished ?? true,
      status: body.status || 'ACTIVE',
      notes: body.notes || null,
    });

    const [updated] = await db.select().from(harvests).where(eq(harvests.id, body.id));
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambah harvest' }, { status: 500 });
  }
}
