import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
export async function POST() {
  await db.delete(matches);
  return NextResponse.json({ success: true });
}
