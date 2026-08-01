import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { preOrders, harvests, demands, marketPrices } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * AI Q&A — rule-based (tanpa LLM API key).
 * Parse keyword dari pertanyaan, jawab dari data agregat di DB.
 */
export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    const q = String(question ?? "").toLowerCase();

    const allPO = await db.select().from(preOrders);
    const allHarvests = await db.select().from(harvests);
    const allDemands = await db.select().from(demands);

    const completedPOs = allPO.filter((p) => p.status === "COMPLETED");
    const totalVolumeKg = completedPOs.reduce((s, p) => s + p.agreedVolumeKg, 0);
    const totalValue = completedPOs.reduce(
      (s, p) => s + p.agreedVolumeKg * p.agreedPricePerKg,
      0,
    );

    // 1. Tonase diselamatkan / total / dampak
    if (q.includes("tonase") || q.includes("diselamat") || q.includes("total")) {
      return NextResponse.json({
        answer: `Total pangan yang berhasil diselamatkan melalui TaniLink: ${totalVolumeKg.toLocaleString("id-ID")} kg (${(totalVolumeKg / 1000).toLocaleString("id-ID")} ton), setara nilai Rp${totalValue.toLocaleString("id-ID")} dari ${completedPOs.length} transaksi PO selesai.`,
      });
    }

    // 2. Komoditas teratas / terbanyak
    if (q.includes("komoditas") || q.includes("terbanyak") || q.includes("teratas")) {
      const byCommodity = new Map<string, number>();
      completedPOs.forEach((p) =>
        byCommodity.set(p.commodity, (byCommodity.get(p.commodity) ?? 0) + p.agreedVolumeKg),
      );
      const top = [...byCommodity.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
      if (top.length === 0) {
        return NextResponse.json({ answer: "Belum ada data transaksi selesai." });
      }
      const list = top.map(([c, v]) => `${c} (${v.toLocaleString("id-ID")} kg)`).join(", ");
      return NextResponse.json({
        answer: `Komoditas dengan volume transaksi terbanyak: ${list}.`,
      });
    }

    // 3. Harga komoditas (sebutkan nama komoditas)
    const commodityNames = ["bawang merah", "cabai", "tomat", "kentang", "kubis", "padi", "jagung"];
    const askedCommodity = commodityNames.find((c) => q.includes(c));
    if (q.includes("harga") && askedCommodity) {
      // Normalize ke nama komoditas
      const map: Record<string, string> = {
        "bawang merah": "Bawang Merah",
        cabai: "Cabai Merah",
        tomat: "Tomat",
        kentang: "Kentang",
        kubis: "Kubis",
        padi: "Padi",
        jagung: "Jagung",
      };
      const commodity = map[askedCommodity];
      const prices = await db
        .select()
        .from(marketPrices)
        .where(eq(marketPrices.commodity, commodity))
        .orderBy(asc(marketPrices.dateRecorded));
      if (prices.length === 0) {
        return NextResponse.json({
          answer: `Belum ada data harga untuk ${commodity}.`,
        });
      }
      const last = prices[prices.length - 1];
      const first = prices[0];
      const change = last.pricePerKg - first.pricePerKg;
      const trend = change > 0 ? "naik" : change < 0 ? "turun" : "stabil";
      return NextResponse.json({
        answer: `Harga ${commodity} saat ini sekitar Rp${last.pricePerKg.toLocaleString("id-ID")}/kg (data ${last.region}). Tren 30 hari: ${trend} (${change >= 0 ? "+" : ""}Rp${change.toLocaleString("id-ID")}). Prediksi 14 hari ke depan tersedia di dashboard petani.`,
      });
    }

    // 4. Wilayah surplus / risiko
    if (q.includes("wilayah") || q.includes("surplus") || q.includes("defisit") || q.includes("risiko")) {
      const activeHarvests = allHarvests.filter((h) => h.status !== "EXPIRED");
      const activeDemands = allDemands.filter((d) => d.status !== "CANCELLED");
      const harvestByRegion = new Map<string, number>();
      const demandByRegion = new Map<string, number>();
      activeHarvests.forEach((h) =>
        harvestByRegion.set(h.region, (harvestByRegion.get(h.region) ?? 0) + h.expectedVolume),
      );
      activeDemands.forEach((d) =>
        demandByRegion.set(d.region, (demandByRegion.get(d.region) ?? 0) + d.requiredVolume),
      );
      const regions = [...new Set([...harvestByRegion.keys(), ...demandByRegion.keys()])];
      const rows = regions
        .map((r) => {
          const hv = harvestByRegion.get(r) ?? 0;
          const dm = demandByRegion.get(r) ?? 0;
          return { r, hv, dm, diff: hv - dm };
        })
        .sort((a, b) => b.diff - a.diff);
      const top = rows.slice(0, 3);
      const list = top
        .map((x) => {
          const st = x.diff > 0 ? "surplus" : x.diff < 0 ? "defisit" : "seimbang";
          return `${x.r}: ${st} (${Math.abs(Math.round(x.diff / 1000))} ton)`;
        })
        .join(", ");
      return NextResponse.json({
        answer: `Status pasokan per wilayah (top ${top.length}): ${list || "Belum ada data wilayah."}.`,
      });
    }

    // 5. Jumlah transaksi / PO
    if (q.includes("transaksi") || q.includes("po") || q.includes("pre-order") || q.includes("berapa")) {
      return NextResponse.json({
        answer: `TaniLink mencatat ${allPO.length} pre-order total, ${completedPOs.length} di antaranya selesai, dengan total ${totalVolumeKg.toLocaleString("id-ID")} kg pangan diselamatkan.`,
      });
    }

    // Default: ringkasan data
    return NextResponse.json({
      answer: `Data pangan TaniLink: ${allHarvests.length} lahan tanam terdaftar, ${allDemands.length} permintaan pembeli, ${allPO.length} pre-order (${completedPOs.length} selesai, ${totalVolumeKg.toLocaleString("id-ID")} kg diselamatkan). Coba tanya: "Berapa tonase diselamatkan?", "Komoditas terbanyak?", atau "Harga Bawang Merah?".`,
    });
  } catch (err) {
    console.error("POST /api/qa error:", err);
    return NextResponse.json({ error: "Failed to process question" }, { status: 500 });
  }
}
