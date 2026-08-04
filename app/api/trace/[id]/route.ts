/**
 * app/api/trace/[id]/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Endpoint publik untuk verifikasi & lacak lahan/batch.
 * Tidak butuh autentikasi — dipakai oleh QR scan dari siapa saja.
 *
 * GET /api/trace/:id
 *   id = harvest.id
 *
 * Response:
 * {
 *   harvest, batches, preOrders, diseaseDetections,
 *   fingerprint, verifiedAt
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  harvests,
  harvestBatches,
  preOrders,
  diseaseDetections,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID diperlukan" }, { status: 400 });
    }

    /* ── 1. Harvest (lahan) ── */
    const harvestRows = await db
      .select()
      .from(harvests)
      .where(eq(harvests.id, id));

    if (harvestRows.length === 0) {
      return NextResponse.json(
        { error: "Lahan tidak ditemukan", id },
        { status: 404 }
      );
    }
    const harvest = harvestRows[0];

    /* ── 2. Harvest Batches untuk lahan ini ── */
    const batchRows = await db
      .select()
      .from(harvestBatches)
      .where(eq(harvestBatches.plantingId, id));

    /* ── 3. Pre-Orders yang terkait ── */
    const poRows = await db
      .select()
      .from(preOrders)
      .where(eq(preOrders.harvestId, id));

    /* ── 4. Disease Detections ── */
    const diseaseRows = await db
      .select({
        id: diseaseDetections.id,
        plantingId: diseaseDetections.plantingId,
        detectedCondition: diseaseDetections.detectedCondition,
        confidenceScore: diseaseDetections.confidenceScore,
        volumeAdjustmentPct: diseaseDetections.volumeAdjustmentPct,
        solution: diseaseDetections.solution,
        // imageBase64 sengaja dikecualikan dari endpoint publik (terlalu besar & privasi)
        detectedAt: diseaseDetections.detectedAt,
      })
      .from(diseaseDetections)
      .where(eq(diseaseDetections.plantingId, id));

    /* ── 5. Fingerprint integritas data ── */
    const fingerprintSource = JSON.stringify({
      id: harvest.id,
      farmerId: harvest.farmerId,
      commodity: harvest.commodity,
      plantingDate: harvest.plantingDate,
      expectedVolume: harvest.expectedVolume,
      region: harvest.region,
    });
    const fingerprint = crypto
      .createHash("sha256")
      .update(fingerprintSource)
      .digest("hex")
      .slice(0, 16)
      .toUpperCase();

    /* ── 6. Build timeline dari batches ── */
    const timeline = batchRows.map((b) => {
      const events: { status: string; label: string; ts: string }[] = [];

      // Created = READY
      events.push({
        status: "READY",
        label: "Batch dibuat — Siap dijemput",
        ts: b.createdAt instanceof Date
          ? b.createdAt.toISOString()
          : String(b.createdAt),
      });

      if (b.status === "IN_TRANSIT") {
        events.push({
          status: "IN_TRANSIT",
          label: "Dalam perjalanan ke titik kumpul",
          ts: "",
        });
      }
      if (b.status === "DELIVERED" || b.status === "PICKED_UP_DIRECTLY") {
        events.push({
          status: "IN_TRANSIT",
          label: "Dalam perjalanan ke titik kumpul",
          ts: "",
        });
        events.push({
          status: b.status,
          label:
            b.status === "PICKED_UP_DIRECTLY"
              ? "Dijemput langsung oleh pembeli"
              : "Terkirim ke titik kumpul",
          ts: "",
        });
      }

      return {
        batchId: b.id,
        commodity: b.commodity,
        actualVolumeKg: b.actualVolumeKg,
        harvestDate: b.harvestDate,
        shelfLifeDays: b.shelfLifeDays,
        priorityScore: b.priorityScore,
        currentStatus: b.status,
        preOrderId: b.preOrderId,
        events,
      };
    });

    return NextResponse.json({
      harvest: {
        id: harvest.id,
        farmerName: harvest.farmerName,
        commodity: harvest.commodity,
        landArea: harvest.landArea,
        expectedVolume: harvest.expectedVolume,
        askingPrice: harvest.askingPrice,
        region: harvest.region,
        plantingDate: harvest.plantingDate,
        expectedHarvestDate: harvest.expectedHarvestDate,
        weatherRiskLevel: harvest.weatherRiskLevel,
        status: harvest.status,
        notes: harvest.notes,
      },
      batches: timeline,
      preOrders: poRows.map((po) => ({
        id: po.id,
        buyerName: po.buyerName,
        commodity: po.commodity,
        agreedVolumeKg: po.agreedVolumeKg,
        agreedPricePerKg: po.agreedPricePerKg,
        status: po.status,
        createdAt: po.createdAt,
      })),
      diseaseDetections: diseaseRows.map((d) => ({
        id: d.id,
        detectedCondition: d.detectedCondition,
        confidenceScore: d.confidenceScore,
        volumeAdjustmentPct: d.volumeAdjustmentPct,
        solution: d.solution,
        detectedAt: d.detectedAt,
      })),
      fingerprint,
      verifiedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[GET /api/trace/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
