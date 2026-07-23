import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { demands } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const [data] = await db
      .select()
      .from(demands)
      .where(eq(demands.id, (await params).id));
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
      .insert(demands)
      .values(body)
      .onConflictDoUpdate({ target: demands.id, set: body });
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
      .update(demands)
      .set(body)
      .where(eq(demands.id, (await params).id));
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
    await db.delete(demands).where(eq(demands.id, (await params).id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
