/**
 * Geocoding helper for Indonesian regions and coordinates lookup
 * @license Apache-2.0
 */

export const INDONESIA_REGIONS: Record<string, { lat: number; lng: number; name: string }> = {
  brebes: { lat: -6.871, lng: 109.042, name: "Brebes" },
  garut: { lat: -7.227, lng: 107.908, name: "Garut" },
  malang: { lat: -7.982, lng: 112.63, name: "Malang" },
  cianjur: { lat: -6.822, lng: 107.138, name: "Cianjur" },
  lampung: { lat: -5.402, lng: 105.263, name: "Lampung" },
  jakarta: { lat: -6.208, lng: 106.845, name: "Jakarta" },
  surabaya: { lat: -7.257, lng: 112.752, name: "Surabaya" },
  bandung: { lat: -6.917, lng: 107.619, name: "Bandung" },
  semarang: { lat: -6.993, lng: 110.42, name: "Semarang" },
  yogyakarta: { lat: -7.795, lng: 110.369, name: "Yogyakarta" },
  jogja: { lat: -7.795, lng: 110.369, name: "Yogyakarta" },
  wonogiri: { lat: -7.817, lng: 110.925, name: "Wonogiri" },
  solo: { lat: -7.575, lng: 110.824, name: "Solo" },
  surakarta: { lat: -7.575, lng: 110.824, name: "Surakarta" },
  kediri: { lat: -7.848, lng: 112.017, name: "Kediri" },
  probolinggo: { lat: -7.754, lng: 113.216, name: "Probolinggo" },
  banyuwangi: { lat: -8.219, lng: 114.369, name: "Banyuwangi" },
  nganjuk: { lat: -7.602, lng: 111.901, name: "Nganjuk" },
  demak: { lat: -6.894, lng: 110.638, name: "Demak" },
  kudus: { lat: -6.805, lng: 110.841, name: "Kudus" },
  pati: { lat: -6.755, lng: 111.038, name: "Pati" },
  rembang: { lat: -6.708, lng: 111.344, name: "Rembang" },
  blora: { lat: -6.97, lng: 111.417, name: "Blora" },
  grobogan: { lat: -7.086, lng: 110.916, name: "Grobogan" },
  sragen: { lat: -7.427, lng: 111.022, name: "Sragen" },
  boyolali: { lat: -7.531, lng: 110.596, name: "Boyolali" },
  klaten: { lat: -7.705, lng: 110.602, name: "Klaten" },
  sukoharjo: { lat: -7.683, lng: 110.835, name: "Sukoharjo" },
  karanganyar: { lat: -7.597, lng: 110.95, name: "Karanganyar" },
  magelang: { lat: -7.47, lng: 110.217, name: "Magelang" },
  temanggung: { lat: -7.315, lng: 110.174, name: "Temanggung" },
  wonosobo: { lat: -7.363, lng: 109.901, name: "Wonosobo" },
  purworejo: { lat: -7.714, lng: 109.999, name: "Purworejo" },
  kebumen: { lat: -7.669, lng: 109.652, name: "Kebumen" },
  banjarnegara: { lat: -7.397, lng: 109.697, name: "Banjarnegara" },
  purbalingga: { lat: -7.388, lng: 109.364, name: "Purbalingga" },
  banyumas: { lat: -7.514, lng: 109.294, name: "Banyumas" },
  purwokerto: { lat: -7.424, lng: 109.239, name: "Purwokerto" },
  cilacap: { lat: -7.705, lng: 109.015, name: "Cilacap" },
  tegal: { lat: -6.869, lng: 109.14, name: "Tegal" },
  pemalang: { lat: -6.89, lng: 109.38, name: "Pemalang" },
  pekalongan: { lat: -6.889, lng: 109.675, name: "Pekalongan" },
  batang: { lat: -6.904, lng: 109.73, name: "Batang" },
  kendal: { lat: -6.921, lng: 110.204, name: "Kendal" },
  salatiga: { lat: -7.33, lng: 110.508, name: "Salatiga" },
  majalengka: { lat: -6.836, lng: 108.227, name: "Majalengka" },
  kuningan: { lat: -6.976, lng: 108.483, name: "Kuningan" },
  cirebon: { lat: -6.732, lng: 108.552, name: "Cirebon" },
  indramayu: { lat: -6.327, lng: 108.32, name: "Indramayu" },
  subang: { lat: -6.571, lng: 107.759, name: "Subang" },
  purwakarta: { lat: -6.556, lng: 107.443, name: "Purwakarta" },
  karawang: { lat: -6.307, lng: 107.302, name: "Karawang" },
  bekasi: { lat: -6.238, lng: 106.975, name: "Bekasi" },
  bogor: { lat: -6.597, lng: 106.799, name: "Bogor" },
  sukabumi: { lat: -6.927, lng: 106.93, name: "Sukabumi" },
  tasikmalaya: { lat: -7.327, lng: 108.22, name: "Tasikmalaya" },
  ciamis: { lat: -7.326, lng: 108.354, name: "Ciamis" },
  pangandaran: { lat: -7.683, lng: 108.483, name: "Pangandaran" },
  sumedang: { lat: -6.858, lng: 107.921, name: "Sumedang" },
  banten: { lat: -6.12, lng: 106.15, name: "Banten" },
  serang: { lat: -6.12, lng: 106.15, name: "Serang" },
  tangerang: { lat: -6.178, lng: 106.63, name: "Tangerang" },
  cilegon: { lat: -6.017, lng: 106.053, name: "Cilegon" },
  pandeglang: { lat: -6.308, lng: 106.107, name: "Pandeglang" },
  lebak: { lat: -6.562, lng: 106.257, name: "Lebak" },
  rangkasbitung: { lat: -6.36, lng: 106.251, name: "Rangkasbitung" },
  medan: { lat: -3.595, lng: 98.672, name: "Medan" },
  palembang: { lat: -2.99, lng: 104.756, name: "Palembang" },
  makassar: { lat: -5.147, lng: 119.432, name: "Makassar" },
  denpasar: { lat: -8.67, lng: 115.212, name: "Denpasar" },
  banjarmasin: { lat: -3.318, lng: 114.591, name: "Banjarmasin" },
  pontianak: { lat: -0.026, lng: 109.342, name: "Pontianak" },
  samarinda: { lat: -0.502, lng: 117.153, name: "Samarinda" },
};

/**
 * Fast local lookup or Nominatim geocoding fallback for Indonesian region names
 */
export async function findCoordinatesForRegion(
  query: string,
): Promise<{ lat: number; lng: number; name: string } | null> {
  if (!query || query.trim().length < 2) return null;

  const normalized = query
    .toLowerCase()
    .replace(/(kabupaten|kab\.|kota|regency|city|kecamatan|distrik)\s+/gi, "")
    .trim();

  // 1. Exact match in local dictionary
  if (INDONESIA_REGIONS[normalized]) {
    return INDONESIA_REGIONS[normalized];
  }

  // 2. Partial match in local dictionary
  for (const [key, val] of Object.entries(INDONESIA_REGIONS)) {
    if (key.includes(normalized) || normalized.includes(key)) {
      return val;
    }
  }

  // 3. Fallback to Nominatim OpenStreetMap Search API
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        query + ", Indonesia",
      )}&limit=1`,
      { headers: { "Accept-Language": "id,en" } },
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = Math.round(parseFloat(data[0].lat) * 1000) / 1000;
        const lng = Math.round(parseFloat(data[0].lon) * 1000) / 1000;
        return { lat, lng, name: query };
      }
    }
  } catch (err) {
    console.warn("Geocoding lookup failed:", err);
  }

  return null;
}
