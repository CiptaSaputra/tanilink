import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { diseaseDetections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const plantingId = searchParams.get("plantingId");
    const data = plantingId
      ? await db
          .select()
          .from(diseaseDetections)
          .where(eq(diseaseDetections.plantingId, plantingId))
          .orderBy(desc(diseaseDetections.detectedAt))
      : await db
          .select()
          .from(diseaseDetections)
          .orderBy(desc(diseaseDetections.detectedAt));
    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("GET /api/disease-detections error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const detection = {
      ...body,
      id: body.id ?? `dis-${Date.now()}`,
      detectedAt: new Date(),
    };

    await db
      .insert(diseaseDetections)
      .values(detection)
      .onConflictDoUpdate({
        target: diseaseDetections.id,
        set: detection,
      });

    return NextResponse.json(detection);
  } catch (err) {
    console.error("POST /api/disease-detections error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
