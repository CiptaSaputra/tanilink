import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { harvestBatches } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.select().from(harvestBatches);
    return NextResponse.json({ data });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal mengambil data batches" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !body.plantingId) {
      return NextResponse.json(
        { error: "Data batch tidak lengkap" },
        { status: 400 },
      );
    }

    await db.insert(harvestBatches).values({
      id: body.id,
      plantingId: body.plantingId,
      farmerId: body.farmerId,
      farmerName: body.farmerName,
      commodity: body.commodity,
      region: body.region,
      latitude: body.latitude,
      longitude: body.longitude,
      preOrderId: body.preOrderId || null,
      actualVolumeKg: body.actualVolumeKg,
      harvestDate: body.harvestDate,
      shelfLifeDays: body.shelfLifeDays,
      priorityScore: body.priorityScore,
      status: body.status || "READY",
    });

    const [updated] = await db
      .select()
      .from(harvestBatches)
      .where(eq(harvestBatches.id, body.id));
    return NextResponse.json({ data: updated }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Gagal menambah batch" },
      { status: 500 },
    );
  }
}
