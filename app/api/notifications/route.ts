import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const data = userId
      ? await db
          .select()
          .from(notifications)
          .where(eq(notifications.userId, userId))
          .orderBy(desc(notifications.createdAt))
      : await db.select().from(notifications).orderBy(desc(notifications.createdAt));

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const notif = {
      ...body,
      id: body.id ?? `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: body.read ?? false,
      createdAt: new Date(),
    };

    await db.insert(notifications).values(notif);

    return NextResponse.json(notif);
  } catch (err) {
    console.error("POST /api/notifications error:", err);
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 });
  }
}
