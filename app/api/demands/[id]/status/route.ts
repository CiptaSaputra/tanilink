import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { demands } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    await db
      .update(demands)
      .set({ status: body.status })
      .where(eq(demands.id, (await params).id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
