import { NextResponse } from "next/server";
import { db } from "@/db";
import { paymentConfirmations } from "@/db/schema";
export async function POST() {
  await db.delete(paymentConfirmations);
  return NextResponse.json({ success: true });
}
