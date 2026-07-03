import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { harvestBatches } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json({ error: 'Status wajib diisi' }, { status: 400 });
    }

    await db.update(harvestBatches)
      .set({ status: body.status })
      .where(eq(harvestBatches.id, id));

    const [updated] = await db.select().from(harvestBatches).where(eq(harvestBatches.id, id));

    if (!updated) {
      return NextResponse.json({ error: `Batch ${id} tidak ditemukan` }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal update status batch' }, { status: 500 });
  }
}
