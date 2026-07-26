import { db } from "@/db";
import { harvests, demands, matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { scoreMatch } from "./matching";

export async function runMatchingForHarvest(newHarvest: any) {
  // Find all active demands for this commodity
  const allDemands = await db.select().from(demands).where(eq(demands.commodity, newHarvest.commodity));
  
  for (const demand of allDemands) {
    if (demand.status === "CANCELLED" || demand.status === "FULFILLED") continue;
    
    // Convert schema records to Match type format required by scoreMatch
    const harvestAdapter = {
      id: newHarvest.id,
      commodity: newHarvest.commodity as any,
      expectedVolume: newHarvest.expectedVolume,
      askingPrice: newHarvest.askingPrice,
      latitude: newHarvest.latitude,
      longitude: newHarvest.longitude,
    };
    
    const demandAdapter = {
      id: demand.id,
      commodity: demand.commodity as any,
      requiredVolume: demand.requiredVolume,
      offerPrice: demand.offerPrice,
      latitude: demand.latitude,
      longitude: demand.longitude,
    };

    const matchResult = scoreMatch(harvestAdapter as any, demandAdapter as any);
    
    // Save match to db
    await db.insert(matches).values({
      id: matchResult.id,
      harvestId: matchResult.harvestId,
      demandId: matchResult.demandId,
      score: matchResult.score,
      distanceKm: matchResult.distanceKm,
      scoreDetails: matchResult.scoreDetails,
      status: matchResult.status,
      createdAt: new Date(matchResult.createdAt),
    }).onConflictDoNothing();
  }
}

export async function runMatchingForDemand(newDemand: any) {
  // Find all active/published harvests for this commodity
  const allHarvests = await db.select().from(harvests).where(eq(harvests.commodity, newDemand.commodity));
  
  for (const harvest of allHarvests) {
    if (harvest.status === "EXPIRED" || harvest.status === "HARVESTED" || !harvest.isPublished) continue;
    
    const harvestAdapter = {
      id: harvest.id,
      commodity: harvest.commodity as any,
      expectedVolume: harvest.expectedVolume,
      askingPrice: harvest.askingPrice,
      latitude: harvest.latitude,
      longitude: harvest.longitude,
    };
    
    const demandAdapter = {
      id: newDemand.id,
      commodity: newDemand.commodity as any,
      requiredVolume: newDemand.requiredVolume,
      offerPrice: newDemand.offerPrice,
      latitude: newDemand.latitude,
      longitude: newDemand.longitude,
    };

    const matchResult = scoreMatch(harvestAdapter as any, demandAdapter as any);
    
    // Save match to db
    await db.insert(matches).values({
      id: matchResult.id,
      harvestId: matchResult.harvestId,
      demandId: matchResult.demandId,
      score: matchResult.score,
      distanceKm: matchResult.distanceKm,
      scoreDetails: matchResult.scoreDetails,
      status: matchResult.status,
      createdAt: new Date(matchResult.createdAt),
    }).onConflictDoNothing();
  }
}
