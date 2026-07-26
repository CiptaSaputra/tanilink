import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { harvests } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db.select().from(harvests);
    return NextResponse.json({ data: data || [] }); // frontend expects array inside 'data' or directly array?
    // Wait, frontend fetch('/api/harvests').then(r=>r.json()) -> expects array directly!
    // Let me check frontend services. Oh, in harvestService: res.json() returns the array itself?
    // Wait, earlier I saw GET in api/harvests/route.ts returning { data }. Let me fix it to return data directly.
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

import { getBMKGWeatherRisk } from "@/utils/bmkg";
import { runMatchingForHarvest } from "@/utils/matchingEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Call BMKG Util to get weather risk
    const bmkgData = await getBMKGWeatherRisk(
      body.region,
      body.commodity,
      body.plantingDate
    );
    
    body.weatherRiskLevel = bmkgData.riskLevel;
    
    await db
      .insert(harvests)
      .values(body)
      .onConflictDoUpdate({ target: harvests.id, set: body });
      
    // Trigger Match Engine
    await runMatchingForHarvest(body);
    
    return NextResponse.json(body);
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      for (const item of body) {
        await db
          .insert(harvests)
          .values(item)
          .onConflictDoUpdate({ target: harvests.id, set: item });
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
