import { NextResponse } from "next/server";
import { db } from "@/db";
import { reviews } from "@/db/schema";
export async function POST() {
  await db.delete(reviews);
  return NextResponse.json({ success: true });
}
