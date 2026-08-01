import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { preOrders, harvests, demands } from "@/db/schema";
import { toCSV } from "@/utils/csv";

type ExportType = "preOrders" | "harvests" | "demands";
type ExportFormat = "csv" | "json";

const TYPE_MAP: Record<ExportType, unknown> = {
  preOrders,
  harvests,
  demands,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = (searchParams.get("format") ?? "csv") as ExportFormat;
    const type = (searchParams.get("type") ?? "preOrders") as ExportType;

    const table = TYPE_MAP[type];
    if (!table) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const data = await db.select().from(table as never);

    if (format === "json") {
      return NextResponse.json({ data });
    }

    const csv = toCSV(data as unknown as Record<string, unknown>[]);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tanilink-${type}.csv"`,
      },
    });
  } catch (err) {
    console.error("GET /api/export error:", err);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
