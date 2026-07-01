/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { COMMODITY_LIST, Komoditas, Harvest } from '../types';
import {
  Users,
  Plus,
  MapPin,
  Calendar,
  Activity,
  Sprout,
  Trash2,
  CheckCircle,
  AlertCircle,
  Layers,
  ClipboardList,
  TrendingUp,
  Package,
} from 'lucide-react';

interface PPLViewProps {
  mapLat?: number;
  mapLng?: number;
  mapRegion?: string;
  clearMapSelection?: () => void;
}

export default function PPLView({ mapLat, mapLng, mapRegion, clearMapSelection }: PPLViewProps) {
  const { harvests, addHarvest, activeUser, showNotification, harvestBatches, preOrders } = useApp();

  // Batch entry rows
  const [batchRows, setBatchRows] = useState<{
    farmerName: string;
    commodity: Komoditas;
    landArea: number;
    expectedVolume: number;
    askingPrice: number;
  }[]>([
    { farmerName: '', commodity: 'Bawang Merah', landArea: 1.0, expectedVolume: 10000, askingPrice: 25000 },
  ]);

  const [plantingDate, setPlantingDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [latitude, setLatitude] = useState<number>(-6.871);
  const [longitude, setLongitude] = useState<number>(109.042);
  const [region, setRegion] = useState<string>(activeUser.PPL.region);
  const [notes, setNotes] = useState<string>('');

  // Update coords from map click
  React.useEffect(() => {
    if (mapLat && mapLng && mapRegion) {
      setLatitude(mapLat);
      setLongitude(mapLng);
      setRegion(mapRegion);
      showNotification(`Koordinat terpilih dari peta: ${mapLat}, ${mapLng} (${mapRegion})`, 'info');
    }
  }, [mapLat, mapLng, mapRegion]);

  const addBatchRow = () => {
    setBatchRows(prev => [...prev, { farmerName: '', commodity: 'Bawang Merah', landArea: 1.0, expectedVolume: 10000, askingPrice: 25000 }]);
  };

  const removeBatchRow = (idx: number) => {
    setBatchRows(prev => prev.filter((_, i) => i !== idx));
  };

  const updateBatchRow = (idx: number, field: string, value: any) => {
    setBatchRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value } : r));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchRows.length === 0) {
      showNotification('Silakan tambah minimal satu baris petani binaan!', 'warning');
      return;
    }

    const emptyRow = batchRows.find(r => !r.farmerName.trim());
    if (emptyRow) {
      showNotification('Semua baris harus memiliki nama petani binaan!', 'warning');
      return;
    }

    batchRows.forEach((row) => {
      const metadata = COMMODITY_LIST[row.commodity];
      const pDate = new Date(plantingDate);
      pDate.setDate(pDate.getDate() + metadata.typicalDurationDays);
      const expectedHarvestDate = pDate.toISOString().split('T')[0];

      addHarvest({
        commodity: row.commodity,
        landArea: row.landArea,
        expectedVolume: row.expectedVolume,
        askingPrice: row.askingPrice,
        latitude,
        longitude,
        region,
        plantingDate,
        expectedHarvestDate,
        notes: `Input PPL: ${row.farmerName}. ${notes}`.trim(),
        inputSource: 'ppl',
        inputByUserId: activeUser.PPL.id,
      });
    });

    showNotification(`Berhasil menginput massal ${batchRows.length} laporan tanam petani binaan!`, 'success');
    if (clearMapSelection) clearMapSelection();
    setNotes('');
    setBatchRows([{ farmerName: '', commodity: 'Bawang Merah', landArea: 1.0, expectedVolume: 10000, askingPrice: 25000 }]);
  };

  // Regional stats for this PPL's area
  const regionalHarvests = useMemo(() => {
    return harvests.filter(h =>
      h.region.toLowerCase() === region.toLowerCase() && h.inputSource === 'ppl'
    );
  }, [harvests, region]);

  const allRegionalHarvests = useMemo(() => {
    return harvests.filter(h => h.region.toLowerCase() === region.toLowerCase());
  }, [harvests, region]);

  const regionalBatches = useMemo(() => {
    return harvestBatches.filter(b => b.region.toLowerCase() === region.toLowerCase());
  }, [harvestBatches, region]);

  const totalVolumeKg = useMemo(() => allRegionalHarvests.reduce((s, h) => s + h.expectedVolume, 0), [allRegionalHarvests]);
  const matchedCount = useMemo(() => allRegionalHarvests.filter(h => h.status === 'MATCHED' || h.status === 'HARVESTED').length, [allRegionalHarvests]);

  return (
    <div className="space-y-6">
      {/* PPL Profile Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-100 text-xs font-bold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>DASHBOARD PPL / PENYULUH PERTANIAN LAPANGAN</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Selamat Datang, {activeUser.PPL.name}</h2>
          <p className="text-xs text-teal-100 mt-1">
            Wilayah Binaan: <span className="font-semibold text-white">{activeUser.PPL.region}</span> | ID PPL: <span className="font-mono text-teal-200">#PPL-0041</span>
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-teal-100 uppercase tracking-wider font-semibold">Total Volume Wilayah</p>
            <p className="text-lg font-bold">{totalVolumeKg.toLocaleString('id-ID')} Kg</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-teal-100 uppercase tracking-wider font-semibold">Lahan Diinput PPL</p>
            <p className="text-lg font-bold text-teal-200">{regionalHarvests.length} Petani</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-teal-50 border border-teal-200/60 rounded-xl p-4 flex gap-3 text-xs text-teal-900">
        <AlertCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Panduan Input PPL (Input by Proxy):</p>
          <p className="mt-1 text-teal-800 leading-relaxed">
            Sebagai PPL, Anda bisa menginput data tanam atas nama petani binaan di wilayah Anda. Data yang diinput akan diproses identik dengan input mandiri petani. Metadata <span className="font-semibold">sumber=ppl</span> disimpan untuk keperluan audit internal tanpa mempengaruhi matching atau tampilan ke pembeli.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batch Entry Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-nat-border p-5 shadow-sm flex flex-col space-y-4">
          <div className="pb-2 border-b border-nat-light-cream">
            <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-teal-600" />
              Input Massal Petani Binaan
            </h3>
            <p className="text-[10px] text-nat-sage mt-1">Isi tabel bawah untuk menginput data banyak petani sekaligus.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Wilayah & Koordinat */}
            <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border space-y-3">
              <span className="text-xs font-bold text-nat-dark flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Lokasi Wilayah Binaan
              </span>
              <div>
                <label className="text-[10px] font-bold text-nat-sage block mb-0.5">Kabupaten / Wilayah</label>
                <input
                  type="text"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-white border border-nat-border rounded px-2 py-1 text-xs font-bold text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-nat-sage block mb-0.5">Latitude</label>
                  <input
                    type="number"
                    step="0.001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-nat-border rounded px-2 py-1 text-xs font-mono text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-nat-sage block mb-0.5">Longitude</label>
                  <input
                    type="number"
                    step="0.001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-nat-border rounded px-2 py-1 text-xs font-mono text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
              <p className="text-[9px] text-nat-sage italic">*Klik peta di atas untuk sinkronkan koordinat secara akurat.</p>
            </div>

            {/* Tanggal Tanam */}
            <div>
              <label className="block text-xs font-bold text-nat-text mb-1">Tanggal Tanam (Semua Petani)</label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Daftar Petani Binaan */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-nat-text">Daftar Petani Binaan</label>
                <button
                  type="button"
                  onClick={addBatchRow}
                  className="bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[10px] px-2 py-1 rounded-lg transition-colors cursor-pointer border border-teal-200"
                >
                  + Tambah Petani
                </button>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {batchRows.map((row, idx) => (
                  <div key={idx} className="bg-nat-light-cream border border-nat-border rounded-xl p-3 space-y-2 relative">
                    {batchRows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBatchRow(idx)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 p-1 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-nat-sage mb-0.5">Nama Petani Binaan *</label>
                      <input
                        type="text"
                        required
                        placeholder="Misal: Pak Sukarman"
                        value={row.farmerName}
                        onChange={(e) => updateBatchRow(idx, 'farmerName', e.target.value)}
                        className="w-full bg-white border border-nat-border rounded px-2 py-1 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-nat-sage mb-0.5">Komoditas</label>
                        <select
                          value={row.commodity}
                          onChange={(e) => {
                            const crop = e.target.value as Komoditas;
                            const meta = COMMODITY_LIST[crop];
                            updateBatchRow(idx, 'commodity', crop);
                            updateBatchRow(idx, 'askingPrice', meta.averagePricePerKg);
                            updateBatchRow(idx, 'expectedVolume', Math.round(row.landArea * meta.typicalYieldKgPerHectare));
                          }}
                          className="w-full bg-white border border-nat-border rounded px-2 py-1 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
                        >
                          {Object.keys(COMMODITY_LIST).map(k => (
                            <option key={k} value={k}>{k}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-nat-sage mb-0.5">Luas (Ha)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={row.landArea}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0.1;
                            const meta = COMMODITY_LIST[row.commodity];
                            updateBatchRow(idx, 'landArea', val);
                            updateBatchRow(idx, 'expectedVolume', Math.round(val * meta.typicalYieldKgPerHectare));
                          }}
                          className="w-full bg-white border border-nat-border rounded px-2 py-1 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-nat-sage mb-0.5">Est. Hasil (Kg)</label>
                        <input
                          type="number"
                          value={row.expectedVolume}
                          onChange={(e) => updateBatchRow(idx, 'expectedVolume', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-nat-border rounded px-2 py-1 text-xs font-bold text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-nat-sage mb-0.5">Harga Harapan</label>
                        <input
                          type="number"
                          step="500"
                          value={row.askingPrice}
                          onChange={(e) => updateBatchRow(idx, 'askingPrice', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-nat-border rounded px-2 py-1 text-xs font-bold text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catatan */}
            <div>
              <label className="block text-xs font-bold text-nat-text mb-1">Catatan Lapangan (Opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Kondisi cuaca, serangan hama, dll."
                rows={2}
                className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-teal-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4" />
              Kirim {batchRows.length} Data Tanam Petani Binaan
            </button>
          </form>
        </div>

        {/* Right column: Regional monitoring */}
        <div className="lg:col-span-2 space-y-6">
          {/* Regional Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <Sprout className="w-3.5 h-3.5 text-nat-green" />
                Lahan Aktif
              </p>
              <p className="text-xl font-bold text-nat-dark mt-1">{allRegionalHarvests.filter(h => h.status === 'ACTIVE').length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-nat-green" />
                Terhubung Pembeli
              </p>
              <p className="text-xl font-bold text-nat-dark mt-1">{matchedCount}</p>
            </div>
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-nat-brown" />
                Batch Siap Kirim
              </p>
              <p className="text-xl font-bold text-nat-dark mt-1">{regionalBatches.filter(b => b.status === 'READY').length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-nat-brown" />
                Total Vol Wilayah
              </p>
              <p className="text-xl font-bold text-nat-dark mt-1 text-sm">{(totalVolumeKg / 1000).toFixed(1)} t</p>
            </div>
          </div>

          {/* List of regional harvests */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-teal-600" />
              Status Lahan Wilayah {region} ({allRegionalHarvests.length} Lahan)
            </h3>
            {allRegionalHarvests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-nat-text">
                  <thead>
                    <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2">Petani / Komoditas</th>
                      <th className="py-2">Estimasi Panen</th>
                      <th className="py-2">Volume</th>
                      <th className="py-2">Sumber Input</th>
                      <th className="py-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRegionalHarvests.map(h => {
                      const crop = COMMODITY_LIST[h.commodity];
                      return (
                        <tr key={h.id} className="border-b border-nat-light-cream hover:bg-nat-light-cream/35">
                          <td className="py-3">
                            <div className="flex items-center gap-1.5 font-bold text-nat-dark">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: crop.color }} />
                              {h.commodity}
                            </div>
                            <div className="text-[10px] text-nat-sage">{h.farmerName}</div>
                          </td>
                          <td className="py-3 font-semibold text-nat-text">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-nat-sage" />
                              {h.expectedHarvestDate}
                            </div>
                          </td>
                          <td className="py-3 font-bold text-nat-dark">{h.expectedVolume.toLocaleString('id-ID')} Kg</td>
                          <td className="py-3">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                              {h.inputSource || 'self'}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              h.status === 'ACTIVE' ? 'bg-nat-light-cream text-nat-green border-nat-border'
                              : h.status === 'MATCHED' ? 'bg-nat-cream text-nat-brown border-nat-border'
                              : h.status === 'HARVESTED' ? 'bg-nat-cream text-nat-green-hover border-nat-border'
                              : 'bg-nat-cream text-nat-sage border-nat-border'
                            }`}>
                              {h.status === 'ACTIVE' ? 'Aktif' : h.status === 'MATCHED' ? 'Terhubung' : h.status === 'HARVESTED' ? 'Dipanen' : h.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-nat-sage italic text-xs">
                Belum ada data tanam di wilayah {region}. Gunakan form sebelah kiri untuk menginput.
              </div>
            )}
          </div>

          {/* Batch Distribution Status */}
          {regionalBatches.length > 0 && (
            <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
                <Package className="w-4 h-4 text-nat-brown" />
                Status Distribusi Batch Wilayah ({regionalBatches.length})
              </h3>
              <div className="space-y-2">
                {regionalBatches.map(b => {
                  const crop = COMMODITY_LIST[b.commodity];
                  return (
                    <div key={b.id} className="flex items-center justify-between p-3 bg-nat-light-cream/40 border border-amber-100 rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crop?.color }} />
                        <div>
                          <span className="font-bold text-nat-dark">{b.commodity}</span>
                          <span className="text-nat-sage ml-2">• {b.farmerName}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-nat-text font-bold">{b.actualVolumeKg.toLocaleString('id-ID')} Kg</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          b.status === 'READY' ? 'bg-nat-light-cream text-nat-brown border-nat-border'
                          : b.status === 'IN_TRANSIT' ? 'bg-nat-light-cream text-nat-dark border-nat-border'
                          : 'bg-nat-light-cream text-nat-green-hover border-nat-border'
                        }`}>
                          {b.status === 'READY' ? 'Siap Kirim' : b.status === 'IN_TRANSIT' ? 'Dikirim' : 'Terkirim'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
