import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketplaceListings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const data = status
      ? await db
          .select()
          .from(marketplaceListings)
          .where(eq(marketplaceListings.status, status))
      : await db.select().from(marketplaceListings);

    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("GET /api/marketplace error:", err);
    return NextResponse.json({ error: "Failed to fetch marketplace" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const listing = {
      ...body,
      id: body.id ?? `mp-${Date.now()}`,
      status: body.status ?? "open",
      listedAt: new Date(),
    };

    await db
      .insert(marketplaceListings)
      .values(listing)
      .onConflictDoUpdate({ target: marketplaceListings.id, set: listing });

    return NextResponse.json(listing);
  } catch (err) {
    console.error("POST /api/marketplace error:", err);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
