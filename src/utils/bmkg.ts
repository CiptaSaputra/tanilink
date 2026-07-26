import { Komoditas } from "../types";
import { COMMODITY_LIST } from "../constants/commodities";

export type WeatherRiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface BMKGResponse {
  riskLevel: WeatherRiskLevel;
  forecastedHarvestDate: string;
}

/**
 * Simulasi pemanggilan API BMKG
 * Di fase MVP, kita membuat fungsi yang mencoba menarik XML BMKG. 
 * Jika gagal/timeout, kita menggunakan heuristic statis (fallback).
 */
export async function getBMKGWeatherRisk(
  region: string,
  commodity: Komoditas,
  plantingDate: string
): Promise<BMKGResponse> {
  const metadata = COMMODITY_LIST[commodity];
  
  // Base calculation
  const pDate = new Date(plantingDate);
  pDate.setDate(pDate.getDate() + metadata.typicalDurationDays);
  let expectedHarvestDate = pDate.toISOString().split("T")[0];
  
  let riskLevel: WeatherRiskLevel = "LOW";

  try {
    // Simulasi pemanggilan API (misalnya: fetch('https://data.bmkg.go.id/...'))
    // Untuk MVP kita menggunakan heuristic sederhana berdasarkan bulan panen
    const harvestMonth = pDate.getMonth(); // 0-11
    
    // Indonesia weather heuristic:
    // Dec-Feb (11, 0, 1): Musim Hujan lebat
    // Mar-May (2, 3, 4): Peralihan
    // Jun-Aug (5, 6, 7): Kemarau
    // Sep-Nov (8, 9, 10): Peralihan
    
    const isHeavyRain = harvestMonth === 11 || harvestMonth === 10 || harvestMonth === 0 || harvestMonth === 1;
    const isDry = harvestMonth >= 5 && harvestMonth <= 7;
    
    // Commodity sensitivity to rain vs dry
    if (isHeavyRain) {
      if (commodity === "Bawang Merah" || commodity === "Cabai Merah" || commodity === "Tomat") {
        riskLevel = "HIGH"; // Sayuran rentan busuk saat hujan lebat
        pDate.setDate(pDate.getDate() - 3); // Panen dipercepat untuk hindari busuk
      } else if (commodity === "Padi") {
        riskLevel = "LOW"; // Padi butuh banyak air
      } else {
        riskLevel = "MEDIUM";
      }
    } else if (isDry) {
      if (commodity === "Padi") {
        riskLevel = "HIGH"; // Padi rentan kekeringan
        pDate.setDate(pDate.getDate() + 5); // Tumbuh melambat
      } else {
        riskLevel = "LOW"; 
      }
    } else {
      riskLevel = "LOW"; // Cuaca normal/peralihan
    }
    
    expectedHarvestDate = pDate.toISOString().split("T")[0];
    
  } catch (error) {
    console.error("BMKG API Fetch Error (Fallback to default):", error);
    // Fallback to LOW risk and standard harvest date
    riskLevel = "LOW";
  }

  return {
    riskLevel,
    forecastedHarvestDate: expectedHarvestDate
  };
}
