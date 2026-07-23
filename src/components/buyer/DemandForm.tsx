import React, { useState, useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import { COMMODITY_LIST } from "../../constants/commodities";
import type { Komoditas } from "../../types";
import { useData } from "../../context/DataContext";
import { useUI } from "../../context/UIContext";

interface DemandFormProps {
  mapLat?: number;
  mapLng?: number;
  mapRegion?: string;
  clearMapSelection?: () => void;
}

export const DemandForm: React.FC<DemandFormProps> = ({
  mapLat,
  mapLng,
  mapRegion,
  clearMapSelection,
}) => {
  const { addDemand } = useData();
  const { showNotification } = useUI();

  const [commodity, setCommodity] = useState<Komoditas>("Bawang Merah");
  const [requiredVolume, setRequiredVolume] = useState<number>(10000);
  const [offerPrice, setOfferPrice] = useState<number>(27000);
  const [dateRequired, setDateRequired] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [latitude, setLatitude] = useState<number>(-6.865);
  const [longitude, setLongitude] = useState<number>(109.035);
  const [region, setRegion] = useState<string>("Brebes");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (mapLat && mapLng && mapRegion) {
      setLatitude(mapLat);
      setLongitude(mapLng);
      setRegion(mapRegion);
      showNotification(
        `Koordinat terpilih dari peta: ${mapLat}, ${mapLng} (${mapRegion})`,
        "info",
      );
    }
  }, [mapLat, mapLng, mapRegion, showNotification]);

  const handleCommodityChange = (crop: Komoditas) => {
    setCommodity(crop);
    const metadata = COMMODITY_LIST[crop];
    if (metadata) {
      setOfferPrice(metadata.averagePricePerKg + 2000);
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = Math.round(position.coords.latitude * 1000) / 1000;
          const lng = Math.round(position.coords.longitude * 1000) / 1000;
          setLatitude(lat);
          setLongitude(lng);
          showNotification("Lokasi GPS Anda berhasil disinkronkan!", "success");
        },
        () => {
          showNotification(
            "Gagal mendapatkan lokasi GPS. Silakan tentukan manual atau klik pada peta.",
            "warning",
          );
        },
      );
    } else {
      showNotification("Fitur GPS tidak didukung di peramban ini.", "warning");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDemand({
      commodity,
      requiredVolume,
      offerPrice,
      dateRequired,
      latitude,
      longitude,
      region,
      notes,
    });
    if (clearMapSelection) clearMapSelection();
    setNotes("");
  };

  return (
    <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
      <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
        <Plus className="w-4 h-4 text-nat-green" />
        Rilis Kebutuhan Pasokan Baru
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-nat-text mb-1">
            Pilih Komoditas
          </label>
          <select
            value={commodity}
            onChange={(e) => handleCommodityChange(e.target.value as Komoditas)}
            className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
          >
            {Object.keys(COMMODITY_LIST).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-nat-text mb-1">
              Volume Dibutuhkan (Kg)
            </label>
            <input
              type="number"
              min="50"
              step="500"
              value={requiredVolume}
              onChange={(e) =>
                setRequiredVolume(parseInt(e.target.value) || 1000)
              }
              className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-nat-text mb-1">
              Harga Penawaran (Rp/Kg)
            </label>
            <input
              type="number"
              step="500"
              min="1000"
              value={offerPrice}
              onChange={(e) => setOfferPrice(parseInt(e.target.value) || 1000)}
              className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-nat-text mb-1">
            Dibutuhkan Paling Lambat
          </label>
          <input
            type="date"
            value={dateRequired}
            onChange={(e) => setDateRequired(e.target.value)}
            className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
          />
        </div>

        {/* Coordinates Section */}
        <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border space-y-3">
          <span className="text-xs font-bold text-nat-dark flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-nat-brown" />
            Lokasi Penerimaan Gudang
          </span>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-nat-sage font-semibold block">
                Latitude
              </span>
              <input
                type="number"
                step="0.001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-nat-border rounded px-2 py-1 text-nat-dark font-mono focus:outline-none focus:ring-1 focus:ring-nat-green"
              />
            </div>
            <div>
              <span className="text-nat-sage font-semibold block">
                Longitude
              </span>
              <input
                type="number"
                step="0.001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-nat-border rounded px-2 py-1 text-nat-dark font-mono focus:outline-none focus:ring-1 focus:ring-nat-green"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-nat-sage font-semibold block">
                Nama Wilayah
              </span>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-white border border-nat-border rounded px-2 py-1 text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleGetLocation}
                className="w-full bg-nat-dark text-white rounded px-2 py-1 font-bold border border-nat-dark hover:bg-slate-800 transition-colors"
              >
                Gunakan GPS
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-nat-text mb-1">
            Catatan Tambahan (Opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Grade prioritas, akses kontainer, dll..."
            rows={2}
            className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-nat-green text-white text-xs font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer"
        >
          Publikasikan Demand Pasok
        </button>
      </form>
    </div>
  );
};
