import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { matches } from '@/db/schema';
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

    await db.update(matches)
      .set({ status: body.status })
      .where(eq(matches.id, id));

    const [updated] = await db.select().from(matches).where(eq(matches.id, id));
    
    if (!updated) {
      return NextResponse.json({ error: `Match ${id} tidak ditemukan` }, { status: 404 });
    }

    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal update status match' }, { status: 500 });
  }
}
