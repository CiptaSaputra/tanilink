import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { educationalContents } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const status = searchParams.get("status");

    const conditions = [];
    if (region) conditions.push(eq(educationalContents.region, region));
    if (status) conditions.push(eq(educationalContents.status, status));

    const data =
      conditions.length > 0
        ? await db
            .select()
            .from(educationalContents)
            .where(conditions.length === 1 ? conditions[0] : (and(...conditions) as never))
            .orderBy(desc(educationalContents.createdAt))
        : await db
            .select()
            .from(educationalContents)
            .orderBy(desc(educationalContents.createdAt));

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("GET /api/educational-contents error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const content = {
      ...body,
      id: body.id ?? `edu-${Date.now()}`,
      status: body.status ?? "pending",
      createdAt: new Date(),
    };

    await db
      .insert(educationalContents)
      .values(content)
      .onConflictDoUpdate({ target: educationalContents.id, set: content });

    return NextResponse.json(content);
  } catch (err) {
    console.error("POST /api/educational-contents error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
