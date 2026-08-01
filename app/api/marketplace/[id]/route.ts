import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    await db
      .update(marketplaceListings)
      .set(body)
      .where(eq(marketplaceListings.id, id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH /api/marketplace/[id] error:", err);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await db
      .delete(marketplaceListings)
      .where(eq(marketplaceListings.id, id));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/marketplace/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
