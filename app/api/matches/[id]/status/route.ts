import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await req.json();
    const updateData: Record<string, unknown> = { status: body.status };
    // Support bid fields for farmer's custom proposal
    if (body.bidVolume !== undefined) updateData.bidVolume = body.bidVolume;
    if (body.bidPrice !== undefined) updateData.bidPrice = body.bidPrice;

    await db
      .update(matches)
      .set(updateData)
      .where(eq(matches.id, (await params).id));
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
