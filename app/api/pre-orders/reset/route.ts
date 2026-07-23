import { NextResponse } from "next/server";
import { db } from "@/db";
import { preOrders } from "@/db/schema";
export async function POST() {
  await db.delete(preOrders);
  return NextResponse.json({ success: true });
}
