import { NextResponse } from 'next/server';
import { db } from '@/db';
import { matches } from '@/db/schema';

export async function GET() {
  try {
    const data = await db.select().from(matches);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil data matches' }, { status: 500 });
  }
}
