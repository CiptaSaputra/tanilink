import { NextResponse } from "next/server";
import { db } from "@/db";
import { demands } from "@/db/schema";
export async function POST() {
  await db.delete(demands);
  return NextResponse.json({ success: true });
}
