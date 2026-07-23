import { NextResponse } from "next/server";
import { db } from "@/db";
import { messages } from "@/db/schema";
export async function POST() {
  await db.delete(messages);
  return NextResponse.json({ success: true });
}
