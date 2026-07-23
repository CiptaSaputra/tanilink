import { NextResponse } from "next/server";
import { db } from "@/db";
import { harvestBatches } from "@/db/schema";
export async function POST() {
  await db.delete(harvestBatches);
  return NextResponse.json({ success: true });
}
