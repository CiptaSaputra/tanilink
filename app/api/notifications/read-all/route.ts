import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/notifications/read-all error:", err);
    return NextResponse.json({ error: "Failed to mark all read" }, { status: 500 });
  }
}
