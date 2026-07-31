import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { matches, harvests, demands, preOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { matchId, bidVolume, bidPrice } = await req.json();

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    // 1. Fetch the Match
    const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    if (match.status === "CONFIRMED") {
      return NextResponse.json({ error: "Match already confirmed" }, { status: 400 });
    }

    // 2. Fetch Harvest and Demand
    const [harvest] = await db.select().from(harvests).where(eq(harvests.id, match.harvestId));
    const [demand] = await db.select().from(demands).where(eq(demands.id, match.demandId));

    if (!harvest || !demand) {
      return NextResponse.json({ error: "Harvest or Demand not found" }, { status: 404 });
    }

    // 3. Use bid data (Advanced mode) or fallback to harvest/demand defaults
    const agreedVolumeKg = bidVolume ?? match.bidVolume ?? Math.min(harvest.expectedVolume, demand.requiredVolume);
    const agreedPricePerKg = bidPrice ?? match.bidPrice ?? demand.offerPrice;
    const preOrderId = `po-${Date.now()}`;

    // 4. Atomic Updates using Transaction
    await db.transaction(async (tx) => {
      await tx.update(harvests).set({ status: "MATCHED" }).where(eq(harvests.id, harvest.id));
      await tx.update(demands).set({ status: "FULFILLED" }).where(eq(demands.id, demand.id));
      await tx.update(matches).set({ status: "CONFIRMED" }).where(eq(matches.id, match.id));

      await tx.insert(preOrders).values({
        id: preOrderId,
        matchId: match.id,
        harvestId: harvest.id,
        demandId: demand.id,
        agreedPricePerKg,
        agreedVolumeKg,
        farmerName: harvest.farmerName,
        buyerName: demand.buyerName,
        commodity: harvest.commodity,
        deliveryMode: "direct",
        status: "CONFIRMED",
        createdAt: new Date(),
      });
    });

    return NextResponse.json({ success: true, preOrderId });
  } catch (err) {
    console.error("Error confirming match:", err);
    return NextResponse.json({ error: "Failed to confirm match" }, { status: 500 });
  }
}
