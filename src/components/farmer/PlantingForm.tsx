import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { COMMODITY_LIST, Komoditas } from '../../types';
import { useApp } from '../../context/AppContext';

interface PlantingFormProps {
  mapLat?: number;
  mapLng?: number;
  mapRegion?: string;
  clearMapSelection?: () => void;
}

export const PlantingForm: React.FC<PlantingFormProps> = ({ mapLat, mapLng, mapRegion, clearMapSelection }) => {
  const { addHarvest, showNotification } = useApp();

  const [commodity, setCommodity] = useState<Komoditas>('Bawang Merah');
  const [landArea, setLandArea] = useState<number>(1.0);
  const [expectedVolume, setExpectedVolume] = useState<number>(10000);
  const [askingPrice, setAskingPrice] = useState<number>(25000);
  const [plantingDate, setPlantingDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [latitude, setLatitude] = useState<number>(-6.871);
  const [longitude, setLongitude] = useState<number>(109.042);
  const [region, setRegion] = useState<string>('Brebes');
  const [notes, setNotes] = useState<string>('');
  const [isPublished, setIsPublished] = useState<boolean>(true);

  // Auto update coordinates and region if selected on map
  useEffect(() => {
    if (mapLat && mapLng && mapRegion) {
      setLatitude(mapLat);
      setLongitude(mapLng);
      setRegion(mapRegion);
      showNotification(`Koordinat terpilih dari peta: ${mapLat}, ${mapLng} (${mapRegion})`, 'info');
    }
  }, [mapLat, mapLng, mapRegion, showNotification]);

  const handleLandAreaChange = (val: number) => {
    setLandArea(val);
    const metadata = COMMODITY_LIST[commodity];
    if (metadata) {
      setExpectedVolume(Math.round(val * metadata.typicalYieldKgPerHectare));
    }
  };

  const handleCommodityChange = (crop: Komoditas) => {
    setCommodity(crop);
    const metadata = COMMODITY_LIST[crop];
    if (metadata) {
      setAskingPrice(metadata.averagePricePerKg);
      setExpectedVolume(Math.round(landArea * metadata.typicalYieldKgPerHectare));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const metadata = COMMODITY_LIST[commodity];
    const pDate = new Date(plantingDate);
    pDate.setDate(pDate.getDate() + metadata.typicalDurationDays);
    const expectedHarvestDate = pDate.toISOString().split('T')[0];

    addHarvest({
      commodity,
      landArea,
      expectedVolume,
      askingPrice,
      latitude,
      longitude,
      region,
      plantingDate,
      expectedHarvestDate,
      isPublished,
      notes,
    });

    if (clearMapSelection) clearMapSelection();
    setNotes('');
  };

  return (
    <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm flex flex-col space-y-4">
      <div className="pb-2 border-b border-nat-light-cream">
        <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-nat-green" />
          Lapor Rencana Tanam
        </h3>
        <p className="text-[10px] text-nat-sage mt-1">Data diinput sendiri oleh petani. Publikasi bersifat opt-in.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tanggal Tanam */}
        <div>
          <label className="block text-xs font-bold text-nat-text mb-1">Tanggal Tanam</label>
          <input
            type="date"
            value={plantingDate}
            onChange={(e) => setPlantingDate(e.target.value)}
            className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-nat-text mb-1">Komoditas</label>
          <select
            value={commodity}
            onChange={(e) => handleCommodityChange(e.target.value as Komoditas)}
            className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
          >
            {Object.keys(COMMODITY_LIST).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-nat-text mb-1">Luas Lahan (Ha)</label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={landArea}
              onChange={(e) => handleLandAreaChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-nat-text mb-1">Estimasi Hasil (Kg)</label>
            <input
              type="number"
              value={expectedVolume}
              onChange={(e) => setExpectedVolume(parseInt(e.target.value) || 0)}
              className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-nat-text mb-1">Lat</label>
            <input type="number" step="0.001" value={latitude} onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-nat-border rounded-lg px-3 py-2 text-[10px] text-nat-dark" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-nat-text mb-1">Lng</label>
            <input type="number" step="0.001" value={longitude} onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-nat-border rounded-lg px-3 py-2 text-[10px] text-nat-dark" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-nat-text mb-1">Catatan Opsional</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Varietas, kendala air, dll..."
            rows={2}
            className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-nat-green text-white text-xs font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer"
        >
          Simpan Laporan
        </button>
      </form>
    </div>
  );
};
