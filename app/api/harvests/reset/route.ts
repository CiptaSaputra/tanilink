import { NextResponse } from "next/server";
import { db } from "@/db";
import { harvests } from "@/db/schema";
export async function POST() {
  await db.delete(harvests);
  return NextResponse.json({ success: true });
}
