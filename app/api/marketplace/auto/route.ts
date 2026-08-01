import { NextResponse } from "next/server";
import { db } from "@/db";
import { harvests, matches, marketplaceListings } from "@/db/schema";
import { findUnmatchedHarvests, harvestsWithoutListing } from "@/utils/marketplaceAuto";

/**
 * POST /api/marketplace/auto
 * Otomatis publish harvest yang tak ter-match & sudah overdue ke marketplace.
 * Idempotent — tidak membuat duplikat untuk harvestId yang sudah listing.
 */
export async function POST() {
  try {
    const allHarvests = await db.select().from(harvests);
    const allMatches = await db.select().from(matches);
    const allListings = await db.select().from(marketplaceListings);

    const unmatched = findUnmatchedHarvests(
      allHarvests as never,
      allMatches as never,
    );
    const toPublish = harvestsWithoutListing(unmatched, allListings as never);

    const created = [];
    for (const h of toPublish) {
      const listing = {
        id: `mp-auto-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        harvestId: h.id,
        farmerId: h.farmerId,
        farmerName: h.farmerName,
        commodity: h.commodity,
        volumeKg: h.expectedVolume,
        pricePerKg: h.askingPrice,
        region: h.region,
        latitude: h.latitude,
        longitude: h.longitude,
        status: "open",
        notes: "Otomatis dipindah ke marketplace (tidak ter-match)",
        listedAt: new Date(),
      };
      await db.insert(marketplaceListings).values(listing);
      created.push(listing.id);
    }

    return NextResponse.json({
      success: true,
      created: created.length,
      checked: unmatched.length,
    });
  } catch (err) {
    console.error("POST /api/marketplace/auto error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
