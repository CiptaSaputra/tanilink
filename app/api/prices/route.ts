import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { marketPrices } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodity = searchParams.get("commodity");
    const region = searchParams.get("region");

    if (!commodity || !region) {
      return NextResponse.json(
        { error: "Commodity and region are required" },
        { status: 400 }
      );
    }

    // Ambil data harga historis (sekitar 30 hari terakhir) dari DB
    const data = await db
      .select()
      .from(marketPrices)
      .where(and(eq(marketPrices.commodity, commodity), eq(marketPrices.region, region)))
      .orderBy(asc(marketPrices.dateRecorded));

    if (data.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Format historical data
    const historical = data.map((d) => ({
      date: d.dateRecorded,
      price: d.pricePerKg,
      isPrediction: false,
    }));

    // Generate Prediksi AI (Simulasi menggunakan Simple Moving Average / Tren Linier)
    // Untuk 14 hari ke depan
    const predictions = [];
    const lastPrice = historical[historical.length - 1].price;
    const lastDate = new Date(historical[historical.length - 1].date);
    
    // Hitung rata-rata perubahan harga (trend)
    let totalChange = 0;
    for (let i = 1; i < historical.length; i++) {
      totalChange += (historical[i].price - historical[i - 1].price);
    }
    const avgChangePerDay = totalChange / historical.length;

    let currentPredPrice = lastPrice;
    for (let i = 1; i <= 14; i++) {
      const predDate = new Date(lastDate);
      predDate.setDate(predDate.getDate() + i);
      
      // Tambahkan noise random kecil agar grafik terlihat natural, namun mengikuti tren
      const noise = (Math.random() - 0.5) * (lastPrice * 0.05); 
      currentPredPrice += avgChangePerDay + noise;

      predictions.push({
        date: predDate.toISOString().split("T")[0],
        price: Math.round(currentPredPrice),
        isPrediction: true,
      });
    }

    // Gabungkan historical dan predictions
    const responseData = [...historical, ...predictions];

    return NextResponse.json({ data: responseData });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}
