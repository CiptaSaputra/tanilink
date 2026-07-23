import { NextResponse } from "next/server";
import { db } from "@/db";
import { conversations } from "@/db/schema";
export async function POST() {
  await db.delete(conversations);
  return NextResponse.json({ success: true });
}
