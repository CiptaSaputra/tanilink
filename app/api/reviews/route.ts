import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const data = await db.select().from(reviews);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal mengambil data reviews' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.preOrderId || !body.reviewerUserId || !body.rating) {
      return NextResponse.json({ error: 'Data review tidak lengkap' }, { status: 400 });
    }

    await db.insert(reviews).values({
      id: body.id,
      preOrderId: body.preOrderId,
      reviewerUserId: body.reviewerUserId,
      revieweeUserId: body.revieweeUserId,
      rating: body.rating,
      comment: body.comment || null,
      createdAt: body.createdAt ? new Date(body.createdAt) : undefined,
    });

    const [updated] = await db.select().from(reviews).where(eq(reviews.id, body.id));
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Gagal menambah review' }, { status: 500 });
  }
}
