import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { preOrders, harvests, demands, marketPrices } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

/**
 * AI Q&A — Gemini API + rule-based fallback.
 * Gemini digrounding dengan data agregat real dari DB TaniLink.
 * Jika GEMINI_API_KEY tidak ada, fallback ke rule-based.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";

async function askGemini(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  // Models to try in order
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
          }),
          signal: AbortSignal.timeout(15000),
        }
      );
      if (res.status === 429 || res.status === 503) continue; // quota/overload, try next
      if (res.status === 404) continue; // model not found, try next
      if (!res.ok) return null;
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    const q = String(question ?? "").trim();
    if (!q) return NextResponse.json({ answer: "Pertanyaan tidak boleh kosong." });

    // ── Ambil data agregat dari DB ──
    const [allPO, allHarvests, allDemands, allPrices] = await Promise.all([
      db.select().from(preOrders),
      db.select().from(harvests),
      db.select().from(demands),
      db.select().from(marketPrices).orderBy(asc(marketPrices.dateRecorded)),
    ]);

    const completedPOs = allPO.filter((p) => p.status === "COMPLETED");
    const totalVolumeKg = completedPOs.reduce((s, p) => s + p.agreedVolumeKg, 0);
    const totalValue = completedPOs.reduce((s, p) => s + p.agreedVolumeKg * p.agreedPricePerKg, 0);
    const activeHarvests = allHarvests.filter((h) => h.status !== "EXPIRED");
    const activeDemands = allDemands.filter((d) => d.status !== "CANCELLED");

    // Komoditas breakdown
    const byCommodity = new Map<string, number>();
    completedPOs.forEach((p) =>
      byCommodity.set(p.commodity, (byCommodity.get(p.commodity) ?? 0) + p.agreedVolumeKg)
    );
    const topCommodities = [...byCommodity.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([c, v]) => `${c}: ${(v/1000).toFixed(1)} ton`)
      .join(", ");

    // Wilayah breakdown
    const harvestByRegion = new Map<string, number>();
    const demandByRegion = new Map<string, number>();
    activeHarvests.forEach((h) =>
      harvestByRegion.set(h.region, (harvestByRegion.get(h.region) ?? 0) + h.expectedVolume)
    );
    activeDemands.forEach((d) =>
      demandByRegion.set(d.region, (demandByRegion.get(d.region) ?? 0) + d.requiredVolume)
    );
    const regionRows = [...new Set([...harvestByRegion.keys(), ...demandByRegion.keys()])]
      .map((r) => {
        const hv = harvestByRegion.get(r) ?? 0;
        const dm = demandByRegion.get(r) ?? 0;
        const diff = hv - dm;
        const status = diff > 0 ? "surplus" : diff < 0 ? "defisit" : "seimbang";
        return `${r}: ${status} (pasokan ${(hv/1000).toFixed(1)}t vs permintaan ${(dm/1000).toFixed(1)}t)`;
      })
      .join("; ");

    // Harga terkini per komoditas
    const latestPrices = new Map<string, number>();
    allPrices.forEach((p) => latestPrices.set(p.commodity, p.pricePerKg));
    const priceStr = [...latestPrices.entries()]
      .map(([c, p]) => `${c}: Rp${p.toLocaleString("id-ID")}/kg`)
      .join(", ");

    // ── Coba Gemini dulu ──
    if (GEMINI_API_KEY) {
      const systemContext = `Kamu adalah asisten AI platform pertanian TaniLink yang membantu menjawab pertanyaan publik tentang data pangan Indonesia.

DATA REAL TANILINK SAAT INI:
- Total transaksi PO: ${allPO.length} (selesai: ${completedPOs.length})
- Total pangan diselamatkan: ${(totalVolumeKg/1000).toFixed(2)} ton (Rp${(totalValue/1_000_000).toFixed(1)} juta)
- Lahan aktif terdaftar: ${activeHarvests.length}
- Permintaan pembeli aktif: ${activeDemands.length}
- Top komoditas (volume transaksi): ${topCommodities || "belum ada"}
- Status wilayah: ${regionRows || "belum ada data wilayah"}
- Harga pasar terkini: ${priceStr || "belum ada data harga"}

INSTRUKSI:
- Jawab dalam Bahasa Indonesia yang ramah dan profesional
- Gunakan data di atas sebagai referensi utama
- Jika pertanyaan di luar konteks pangan/pertanian, arahkan kembali ke topik TaniLink
- Maksimal 3 paragraf, langsung ke inti jawaban
- Jika data belum tersedia, katakan secara jujur

PERTANYAAN PENGGUNA: ${q}`;

      const geminiAnswer = await askGemini(systemContext);
      if (geminiAnswer) {
        return NextResponse.json({ answer: geminiAnswer, source: "gemini" });
      }
    }

    // ── Fallback rule-based ──
    const ql = q.toLowerCase();

    if (ql.includes("tonase") || ql.includes("diselamat") || ql.includes("total pangan")) {
      return NextResponse.json({
        answer: `Total pangan yang berhasil diselamatkan melalui TaniLink: ${totalVolumeKg.toLocaleString("id-ID")} kg (${(totalVolumeKg/1000).toFixed(2)} ton), setara nilai Rp${totalValue.toLocaleString("id-ID")} dari ${completedPOs.length} transaksi PO selesai.`,
        source: "rule-based",
      });
    }

    if (ql.includes("komoditas") || ql.includes("terbanyak") || ql.includes("teratas")) {
      return NextResponse.json({
        answer: topCommodities
          ? `Komoditas dengan volume transaksi terbanyak di TaniLink: ${topCommodities}.`
          : "Belum ada data transaksi selesai.",
        source: "rule-based",
      });
    }

    if (ql.includes("wilayah") || ql.includes("surplus") || ql.includes("defisit")) {
      return NextResponse.json({
        answer: regionRows
          ? `Status pasokan per wilayah: ${regionRows}.`
          : "Belum ada data wilayah.",
        source: "rule-based",
      });
    }

    if (ql.includes("harga")) {
      const commodityNames = ["bawang merah", "cabai", "tomat", "kentang", "kubis", "padi", "jagung"];
      const found = commodityNames.find((c) => ql.includes(c));
      if (found) {
        const map: Record<string, string> = {
          "bawang merah": "Bawang Merah", cabai: "Cabai Merah", tomat: "Tomat",
          kentang: "Kentang", kubis: "Kubis", padi: "Padi", jagung: "Jagung",
        };
        const commodity = map[found];
        const price = latestPrices.get(commodity);
        return NextResponse.json({
          answer: price
            ? `Harga ${commodity} terkini: Rp${price.toLocaleString("id-ID")}/kg. Prediksi 14 hari tersedia di dashboard petani.`
            : `Belum ada data harga terbaru untuk ${commodity}.`,
          source: "rule-based",
        });
      }
      return NextResponse.json({
        answer: priceStr
          ? `Harga pasar terkini: ${priceStr}.`
          : "Belum ada data harga.",
        source: "rule-based",
      });
    }

    if (ql.includes("transaksi") || ql.includes("berapa") || ql.includes("po")) {
      return NextResponse.json({
        answer: `TaniLink mencatat ${allPO.length} pre-order total, ${completedPOs.length} selesai, dengan total ${(totalVolumeKg/1000).toFixed(2)} ton pangan diselamatkan.`,
        source: "rule-based",
      });
    }

    // Default
    return NextResponse.json({
      answer: `Data TaniLink: ${activeHarvests.length} lahan aktif, ${activeDemands.length} permintaan pembeli, ${completedPOs.length} transaksi selesai (${(totalVolumeKg/1000).toFixed(2)} ton diselamatkan). ${GEMINI_API_KEY ? "" : "Tambahkan GEMINI_API_KEY untuk jawaban lebih cerdas. "}Coba tanya: "Berapa tonase diselamatkan?", "Komoditas terbanyak?", atau "Harga Bawang Merah?"`,
      source: "rule-based",
    });
  } catch (err) {
    console.error("POST /api/qa error:", err);
    return NextResponse.json({ error: "Gagal memproses pertanyaan." }, { status: 500 });
  }
}
