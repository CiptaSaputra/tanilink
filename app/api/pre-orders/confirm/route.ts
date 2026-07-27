import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { matches, harvests, demands, preOrders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { matchId } = await req.json();

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

    // Prepare PreOrder data
    const preOrderId = `po-${Date.now()}`;
    const agreedVolumeKg = Math.min(harvest.expectedVolume, demand.requiredVolume);
    const agreedPricePerKg = demand.offerPrice;

    // 3. Atomic Updates using Transaction
    await db.transaction(async (tx) => {
      // Update Harvest
      await tx.update(harvests).set({ status: "MATCHED" }).where(eq(harvests.id, harvest.id));

      // Update Demand
      await tx.update(demands).set({ status: "FULFILLED" }).where(eq(demands.id, demand.id));

      // Update Match
      await tx.update(matches).set({ status: "CONFIRMED" }).where(eq(matches.id, match.id));

      // Insert PreOrder
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
