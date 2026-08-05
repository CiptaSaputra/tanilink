import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { preOrders, harvests, demands, marketPrices } from "@/db/schema";
import { asc } from "drizzle-orm";

/**
 * AI Q&A — Multi-provider (Gemini → OpenRouter → rule-based).
 * - Topic guard server-side: tolak pertanyaan non-TaniLink sebelum panggil AI.
 * - finish_reason check: tidak return jawaban terpotong.
 * - Suggestion chips: kembalikan 3 pertanyaan lanjutan yang relevan.
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const OPENROUTER_QNA_MODEL =
  process.env.OPENROUTER_QNA_MODEL ?? "meta-llama/llama-3.3-70b-instruct:free";

// ── Types ──────────────────────────────────────────────────────────────────────

interface HistoryItem {
  question: string;
  answer: string;
}

// ── Topic Guard ────────────────────────────────────────────────────────────────

/** Kata kunci yang menandakan pertanyaan masih dalam cakupan TaniLink */
const TANILINK_KEYWORDS = [
  "tanilink", "tonase", "diselamat", "pangan", "komoditas", "harga",
  "wilayah", "surplus", "defisit", "transaksi", "pre-order", "preorder",
  "lahan", "petani", "pembeli", "permintaan", "pasokan", "pertanian",
  "bawang", "cabai", "tomat", "kentang", "kubis", "padi", "jagung",
  "berapa", "total", "platform", "po", "data", "tren", "produk",
  "panen", "hasil", "distribusi", "nilai", "selamat",
];

function isOnTopic(question: string): boolean {
  const q = question.toLowerCase();
  return TANILINK_KEYWORDS.some((kw) => q.includes(kw));
}

// ── Suggestions ────────────────────────────────────────────────────────────────

const SUGGESTION_POOL: Record<string, string[]> = {
  volume: [
    "Berapa tonase pangan yang diselamatkan?",
    "Berapa total nilai transaksi TaniLink?",
    "Berapa jumlah pre-order yang selesai?",
  ],
  commodity: [
    "Komoditas apa yang paling banyak ditransaksikan?",
    "Komoditas mana yang harganya paling tinggi?",
    "Ada berapa jenis komoditas di TaniLink?",
  ],
  price: [
    "Harga Bawang Merah terkini?",
    "Harga Cabai Merah saat ini?",
    "Harga Tomat di TaniLink?",
    "Bagaimana tren harga komoditas bulan ini?",
  ],
  region: [
    "Wilayah mana yang mengalami surplus pasokan?",
    "Wilayah mana yang defisit?",
    "Bagaimana distribusi pasokan antar wilayah?",
  ],
  platform: [
    "Berapa lahan aktif yang terdaftar?",
    "Berapa permintaan pembeli aktif saat ini?",
    "Bagaimana performa TaniLink secara keseluruhan?",
  ],
};

function detectTopic(q: string): string {
  const ql = q.toLowerCase();
  if (/ton|diselamat|total pangan|nilai transaksi|berapa (total|jumlah)/.test(ql)) return "volume";
  if (/komoditas|terbanyak|teratas|jenis produk/.test(ql)) return "commodity";
  if (/harga|rp|rupiah|bawang|cabai|tomat|kentang|kubis|padi|jagung|tren harga/.test(ql)) return "price";
  if (/wilayah|surplus|defisit|pasokan|daerah|distribusi/.test(ql)) return "region";
  return "platform";
}

function generateSuggestions(currentQ: string, history: HistoryItem[]): string[] {
  const alreadyAsked = new Set([
    ...history.map((h) => h.question),
    currentQ,
  ]);
  const currentTopic = detectTopic(currentQ);

  // Kumpulkan kandidat: prioritaskan topik lain dulu (variasi), lalu topik saat ini
  const otherTopics = Object.keys(SUGGESTION_POOL).filter((t) => t !== currentTopic);
  const candidates: string[] = [];

  for (const topic of [...otherTopics, currentTopic]) {
    for (const s of SUGGESTION_POOL[topic]) {
      if (!alreadyAsked.has(s) && !candidates.includes(s)) {
        candidates.push(s);
      }
    }
  }

  return candidates.slice(0, 3);
}

// ── AI Providers ───────────────────────────────────────────────────────────────

async function askGemini(
  systemContext: string,
  history: HistoryItem[],
  currentQuestion: string
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;
  const models = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-2.5-flash"];

  // Multi-turn contents
  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const h of history) {
    contents.push({ role: "user", parts: [{ text: h.question }] });
    contents.push({ role: "model", parts: [{ text: h.answer }] });
  }
  contents.push({ role: "user", parts: [{ text: currentQuestion }] });

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemContext }] },
            contents,
            // Tanpa maxOutputTokens — biarkan model selesaikan jawaban
            generationConfig: { temperature: 0.4 },
          }),
          signal: AbortSignal.timeout(20000),
        }
      );
      if (res.status === 429 || res.status === 503 || res.status === 404) continue;
      if (!res.ok) continue;
      const data = await res.json();
      const candidate = data?.candidates?.[0];
      const finishReason = candidate?.finishReason as string | undefined;
      const text: string | undefined = candidate?.content?.parts?.[0]?.text;

      // Hanya return jika kalimat benar-benar selesai
      if (text && finishReason === "STOP") return text;
      // MAX_TOKENS / SAFETY / RECITATION → coba model berikutnya
      console.warn(`[askGemini] ${model} finishReason=${finishReason}, skip.`);
    } catch { continue; }
  }
  return null;
}

async function askOpenRouter(
  systemPrompt: string,
  history: HistoryItem[],
  userQuestion: string
): Promise<string | null> {
  if (!OPENROUTER_API_KEY) return null;
  try {
    // Multi-turn messages
    const messages: { role: string; content: string }[] = [
      { role: "system", content: systemPrompt },
    ];
    for (const h of history) {
      messages.push({ role: "user", content: h.question });
      messages.push({ role: "assistant", content: h.answer });
    }
    messages.push({ role: "user", content: userQuestion });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://tanilink.vercel.app",
        "X-Title": "TaniLink",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENROUTER_QNA_MODEL,
        messages,
        // Tanpa max_tokens — biarkan model selesaikan jawaban secara natural
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;

    const choice = data?.choices?.[0];
    const finishReason = choice?.finish_reason as string | undefined;
    const text: string | undefined = choice?.message?.content;

    // Hanya return jika kalimat selesai secara natural
    if (text && finishReason === "stop") return text;
    console.warn(`[askOpenRouter] finishReason=${finishReason}, fallback.`);
    return null;
  } catch {
    return null;
  }
}

// ── POST Handler ───────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { question, history: rawHistory } = await req.json();
    const q = String(question ?? "").trim();
    if (!q) return NextResponse.json({ answer: "Pertanyaan tidak boleh kosong." });

    // ── Topic Guard: tolak sebelum panggil AI ──
    if (!isOnTopic(q)) {
      return NextResponse.json({
        answer:
          "Maaf, saya hanya dapat menjawab pertanyaan seputar data platform TaniLink — seperti tonase pangan, harga komoditas, status wilayah, atau statistik transaksi.",
        source: "guard",
        suggestions: [
          "Berapa tonase pangan yang diselamatkan?",
          "Komoditas apa yang paling banyak?",
          "Wilayah mana yang surplus?",
        ],
      });
    }

    // ── Validasi & sanitasi history ──
    const history: HistoryItem[] = Array.isArray(rawHistory)
      ? rawHistory
          .slice(-6)
          .filter(
            (h): h is HistoryItem =>
              typeof h?.question === "string" && typeof h?.answer === "string"
          )
          .map((h) => ({
            question: h.question.slice(0, 500),
            answer: h.answer.slice(0, 1000),
          }))
      : [];

    // ── Ambil data agregat dari DB ──
    const [allPO, allHarvests, allDemands, allPrices] = await Promise.all([
      db.select().from(preOrders),
      db.select().from(harvests),
      db.select().from(demands),
      db.select().from(marketPrices).orderBy(asc(marketPrices.dateRecorded)),
    ]);

    const completedPOs = allPO.filter((p) => p.status === "COMPLETED");
    const totalVolumeKg = completedPOs.reduce((s, p) => s + p.agreedVolumeKg, 0);
    const totalValue = completedPOs.reduce(
      (s, p) => s + p.agreedVolumeKg * p.agreedPricePerKg,
      0
    );
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
      .map(([c, v]) => `${c}: ${(v / 1000).toFixed(1)} ton`)
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
        return `${r}: ${status} (pasokan ${(hv / 1000).toFixed(1)}t vs permintaan ${(dm / 1000).toFixed(1)}t)`;
      })
      .join("; ");

    // Harga terkini per komoditas
    const latestPrices = new Map<string, number>();
    allPrices.forEach((p) => latestPrices.set(p.commodity, p.pricePerKg));
    const priceStr = [...latestPrices.entries()]
      .map(([c, p]) => `${c}: Rp${p.toLocaleString("id-ID")}/kg`)
      .join(", ");

    // ── System prompt — ketat, hanya TaniLink ──
    const systemContext = `Kamu adalah asisten AI khusus platform pertanian TaniLink Indonesia.

TOPIK YANG BOLEH DIJAWAB (hanya ini):
- Statistik transaksi pre-order (PO) di TaniLink
- Volume/tonase pangan yang diselamatkan
- Harga komoditas pertanian (bawang merah, cabai, tomat, kentang, kubis, padi, jagung)
- Status pasokan & permintaan per wilayah (surplus/defisit)
- Jumlah lahan aktif, pembeli aktif, dan data platform TaniLink

DATA REAL TANILINK SAAT INI:
- Total transaksi PO: ${allPO.length} (selesai: ${completedPOs.length})
- Total pangan diselamatkan: ${(totalVolumeKg / 1000).toFixed(2)} ton (Rp${(totalValue / 1_000_000).toFixed(1)} juta)
- Lahan aktif: ${activeHarvests.length} | Permintaan pembeli aktif: ${activeDemands.length}
- Top komoditas: ${topCommodities || "belum ada data"}
- Status wilayah: ${regionRows || "belum ada data wilayah"}
- Harga pasar terkini: ${priceStr || "belum ada data harga"}

ATURAN MUTLAK:
1. Jawab dalam Bahasa Indonesia yang profesional dan ramah
2. Gunakan DATA DI ATAS sebagai referensi utama — jangan mengarang angka
3. Pertanyaan di luar topik TaniLink → tolak dengan: "Maaf, saya hanya menjawab seputar data TaniLink."
4. Langsung ke jawaban — tanpa salam pembuka atau basa-basi
5. Jawaban harus SELESAI — jangan berhenti di tengah kalimat
6. Jika data belum tersedia, sampaikan jujur dan singkat`;

    // Suggestions relevan berdasarkan topik pertanyaan
    const suggestions = generateSuggestions(q, history);

    // ── Coba Gemini dulu ──
    if (GEMINI_API_KEY) {
      const geminiAnswer = await askGemini(systemContext, history, q);
      if (geminiAnswer) {
        return NextResponse.json({ answer: geminiAnswer, source: "gemini", suggestions });
      }
    }

    // ── Fallback ke OpenRouter ──
    if (OPENROUTER_API_KEY) {
      const orAnswer = await askOpenRouter(systemContext, history, q);
      if (orAnswer) {
        return NextResponse.json({ answer: orAnswer, source: "openrouter", suggestions });
      }
    }

    // ── Fallback rule-based (selalu complete) ──
    const ql = q.toLowerCase();

    if (ql.includes("tonase") || ql.includes("diselamat") || ql.includes("total pangan")) {
      return NextResponse.json({
        answer: `Total pangan yang berhasil diselamatkan melalui TaniLink: ${totalVolumeKg.toLocaleString("id-ID")} kg (${(totalVolumeKg / 1000).toFixed(2)} ton), setara nilai Rp${totalValue.toLocaleString("id-ID")} dari ${completedPOs.length} transaksi PO selesai.`,
        source: "rule-based",
        suggestions,
      });
    }

    if (ql.includes("komoditas") || ql.includes("terbanyak") || ql.includes("teratas")) {
      return NextResponse.json({
        answer: topCommodities
          ? `Komoditas dengan volume transaksi terbanyak di TaniLink: ${topCommodities}.`
          : "Belum ada data transaksi selesai.",
        source: "rule-based",
        suggestions,
      });
    }

    if (ql.includes("wilayah") || ql.includes("surplus") || ql.includes("defisit")) {
      return NextResponse.json({
        answer: regionRows
          ? `Status pasokan per wilayah: ${regionRows}.`
          : "Belum ada data wilayah.",
        source: "rule-based",
        suggestions,
      });
    }

    if (ql.includes("harga")) {
      const commodityNames = ["bawang merah", "cabai", "tomat", "kentang", "kubis", "padi", "jagung"];
      const found = commodityNames.find((c) => ql.includes(c));
      if (found) {
        const map: Record<string, string> = {
          "bawang merah": "Bawang Merah",
          cabai: "Cabai Merah",
          tomat: "Tomat",
          kentang: "Kentang",
          kubis: "Kubis",
          padi: "Padi",
          jagung: "Jagung",
        };
        const commodity = map[found];
        const price = latestPrices.get(commodity);
        return NextResponse.json({
          answer: price
            ? `Harga ${commodity} terkini: Rp${price.toLocaleString("id-ID")}/kg.`
            : `Belum ada data harga terbaru untuk ${commodity}.`,
          source: "rule-based",
          suggestions,
        });
      }
      return NextResponse.json({
        answer: priceStr ? `Harga pasar terkini: ${priceStr}.` : "Belum ada data harga.",
        source: "rule-based",
        suggestions,
      });
    }

    if (ql.includes("transaksi") || ql.includes("berapa") || ql.includes("po")) {
      return NextResponse.json({
        answer: `TaniLink mencatat ${allPO.length} pre-order total, ${completedPOs.length} selesai, dengan total ${(totalVolumeKg / 1000).toFixed(2)} ton pangan diselamatkan.`,
        source: "rule-based",
        suggestions,
      });
    }

    // Default
    return NextResponse.json({
      answer: `Data TaniLink: ${activeHarvests.length} lahan aktif, ${activeDemands.length} permintaan pembeli, ${completedPOs.length} transaksi selesai (${(totalVolumeKg / 1000).toFixed(2)} ton diselamatkan). Coba tanya hal di bawah ini!`,
      source: "rule-based",
      suggestions,
    });
  } catch (err) {
    console.error("POST /api/qa error:", err);
    return NextResponse.json({ error: "Gagal memproses pertanyaan." }, { status: 500 });
  }
}
