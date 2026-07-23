import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { preOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const [data] = await db
      .select()
      .from(preOrders)
      .where(eq(preOrders.id, (await params).id));
    if (!data) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    await db
      .insert(preOrders)
      .values(body)
      .onConflictDoUpdate({ target: preOrders.id, set: body });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    await db
      .update(preOrders)
      .set(body)
      .where(eq(preOrders.id, (await params).id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await db.delete(preOrders).where(eq(preOrders.id, (await params).id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
