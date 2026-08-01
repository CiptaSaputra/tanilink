import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await db
      .update(notifications)
      .set(body)
      .where(eq(notifications.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/notifications/[id] error:", err);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
