import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { salesLedger } from "@/db/schema";
import { desc } from "drizzle-orm";
import { computeHash } from "@/utils/ledger";

export async function GET() {
  try {
    const data = await db.select().from(salesLedger);
    return NextResponse.json({ data: data || [] });
  } catch (err) {
    console.error("GET /api/ledger error:", err);
    return NextResponse.json({ error: "Failed to fetch ledger" }, { status: 500 });
  }
}

/**
 * POST /api/ledger — buat entri hash-chain.
 * Body: { preOrderId, recordData }
 * Mengambil hash entri terakhir sebagai previousHash, lalu hitung currentHash.
 */
export async function POST(req: NextRequest) {
  try {
    const { preOrderId, recordData } = await req.json();
    if (!preOrderId || !recordData) {
      return NextResponse.json(
        { error: "preOrderId dan recordData wajib diisi" },
        { status: 400 },
      );
    }

    // Entri terakhir (berdasarkan waktu dibuat)
    const [last] = await db
      .select()
      .from(salesLedger)
      .orderBy(desc(salesLedger.createdAt))
      .limit(1);

    const previousHash = last?.currentHash ?? "GENESIS";
    const currentHash = await computeHash(recordData, previousHash);

    const entry = {
      id: `ledger-${Date.now()}`,
      preOrderId,
      recordData,
      previousHash,
      currentHash,
      createdAt: new Date(),
    };

    await db.insert(salesLedger).values(entry);

    return NextResponse.json(entry);
  } catch (err) {
    console.error("POST /api/ledger error:", err);
    return NextResponse.json({ error: "Failed to add ledger entry" }, { status: 500 });
  }
}
