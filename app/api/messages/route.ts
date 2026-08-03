import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.select().from(messages);
    return NextResponse.json({ data: data || [] }); // frontend expects array inside 'data' or directly array?
    // Wait, frontend fetch('/api/harvests').then(r=>r.json()) -> expects array directly!
    // Let me check frontend services. Oh, in harvestService: res.json() returns the array itself?
    // Wait, earlier I saw GET in api/harvests/route.ts returning { data }. Let me fix it to return data directly.
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const normalized = {
      ...body,
      sentAt: body.sentAt ? new Date(body.sentAt) : new Date(),
    };
    await db
      .insert(messages)
      .values(normalized)
      .onConflictDoUpdate({ target: messages.id, set: normalized });
    return NextResponse.json(normalized);
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      for (const item of body) {
        await db
          .insert(messages)
          .values(item)
          .onConflictDoUpdate({ target: messages.id, set: item });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
