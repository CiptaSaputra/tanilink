/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dashboard PPL/BPP — Read-only monitoring wilayah binaan.
 * Tidak ada form input data atas nama petani.
 * PPL hanya memantau data agregat yang sudah dipublikasikan petani.
 */

import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { COMMODITY_LIST } from '../types';
import {
  Users,
  MapPin,
  Calendar,
  Activity,
  Sprout,
  CheckCircle,
  AlertCircle,
  Package,
  TrendingUp,
  Eye,
} from 'lucide-react';

export default function PPLView() {
  const { harvests, harvestBatches, preOrders, activeUser } = useApp();

  // Data agregat wilayah binaan — hanya dari planting yang dipublikasikan
  const regionalHarvests = useMemo(() => {
    return harvests.filter(h =>
      h.region.toLowerCase() === activeUser.PPL.region.toLowerCase() &&
      h.isPublished === true
    );
  }, [harvests, activeUser.PPL.region]);

  const regionalBatches = useMemo(() => {
    return harvestBatches.filter(b =>
      b.region.toLowerCase() === activeUser.PPL.region.toLowerCase()
    );
  }, [harvestBatches, activeUser.PPL.region]);

  const totalVolumeKg = useMemo(() =>
    regionalHarvests.reduce((s, h) => s + h.expectedVolume, 0),
  [regionalHarvests]);

  const matchedCount = useMemo(() =>
    regionalHarvests.filter(h => h.status === 'MATCHED' || h.status === 'HARVESTED').length,
  [regionalHarvests]);

  const activeCount = useMemo(() =>
    regionalHarvests.filter(h => h.status === 'ACTIVE').length,
  [regionalHarvests]);

  const farmerCount = useMemo(() =>
    new Set(regionalHarvests.map(h => h.farmerId)).size,
  [regionalHarvests]);

  const totalPreOrders = useMemo(() =>
    preOrders.filter(po =>
      regionalHarvests.some(h => h.id === po.harvestId)
    ).length,
  [preOrders, regionalHarvests]);

  // Komoditas breakdown
  const commodityBreakdown = useMemo(() => {
    const breakdown: Record<string, { totalVolume: number; count: number; matched: number }> = {};
    regionalHarvests.forEach(h => {
      const key = h.commodity;
      if (!breakdown[key]) breakdown[key] = { totalVolume: 0, count: 0, matched: 0 };
      breakdown[key].totalVolume += h.expectedVolume;
      breakdown[key].count += 1;
      if (h.status === 'MATCHED' || h.status === 'HARVESTED') breakdown[key].matched += 1;
    });
    return breakdown;
  }, [regionalHarvests]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-100 text-xs font-bold mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span>DASHBOARD PPL/BPP — READ-ONLY</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Selamat Datang, {activeUser.PPL.name}</h2>
          <p className="text-xs text-teal-100 mt-1">
            Wilayah Binaan: <span className="font-semibold text-white">{activeUser.PPL.region}</span> | Akses Read-Only
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-teal-100 uppercase tracking-wider font-semibold">Petani Aktif</p>
            <p className="text-lg font-bold">{farmerCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <p className="text-[10px] text-teal-100 uppercase tracking-wider font-semibold">Total Volume</p>
            <p className="text-lg font-bold">{totalVolumeKg.toLocaleString('id-ID')} Kg</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-teal-50 border border-teal-200/60 rounded-xl p-4 flex gap-3 text-xs text-teal-900">
        <AlertCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Akses Pemantauan Wilayah</p>
          <p className="mt-1 text-teal-800 leading-relaxed">
            Dashboard ini bersifat <span className="font-semibold">read-only</span> sesuai PRD TaniLink. PPL/BPP dapat memantau data agregat wilayah binaan: planting yang dipublikasikan, estimasi panen, dan status konsolidasi. Tidak ada mekanisme input atau perubahan data planting di sini. Pendampingan petani dilakukan di luar sistem secara personal.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
          <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-nat-green" />
            Lahan Aktif
          </p>
          <p className="text-xl font-bold text-nat-dark mt-1">{activeCount}</p>
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
            Pre-Order
          </p>
          <p className="text-xl font-bold text-nat-dark mt-1">{totalPreOrders}</p>
        </div>
      </div>

      {/* Komoditas Breakdown */}
      <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
        <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-teal-600" />
          Komoditas Wilayah {activeUser.PPL.region}
        </h3>
        {Object.keys(commodityBreakdown).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-nat-text">
              <thead>
                <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2">Komoditas</th>
                  <th className="py-2">Jumlah Lahan</th>
                  <th className="py-2">Total Volume</th>
                  <th className="py-2">Terhubung</th>
                  <th className="py-2">Persentase Serap</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(commodityBreakdown).map(([crop, data]: [string, { totalVolume: number; count: number; matched: number }]) => {
                  const meta = COMMODITY_LIST[crop as keyof typeof COMMODITY_LIST];
                  return (
                    <tr key={crop} className="border-b border-nat-light-cream hover:bg-nat-light-cream/35">
                      <td className="py-3 font-bold text-nat-dark flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta?.color }} />
                        {crop}
                      </td>
                      <td className="py-3">{data.count}</td>
                      <td className="py-3 font-bold">{data.totalVolume.toLocaleString('id-ID')} Kg</td>
                      <td className="py-3">{data.matched}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-nat-light-cream h-1.5 rounded-full overflow-hidden">
                            <div className="bg-nat-green h-full rounded-full" style={{ width: `${data.count > 0 ? (data.matched / data.count) * 100 : 0}%` }} />
                          </div>
                          <span className="text-[10px] font-bold">{data.count > 0 ? Math.round((data.matched / data.count) * 100) : 0}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-nat-sage italic">Belum ada data tanam yang dipublikasikan di wilayah ini.</div>
        )}
      </div>

      {/* Daftar Lahan */}
      <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
        <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-teal-600" />
          Daftar Lahan Wilayah ({regionalHarvests.length})
        </h3>
        {regionalHarvests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-nat-text">
              <thead>
                <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2">Petani</th>
                  <th className="py-2">Komoditas</th>
                  <th className="py-2">Luas</th>
                  <th className="py-2">Estimasi Panen</th>
                  <th className="py-2">Volume</th>
                  <th className="py-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {regionalHarvests.map(h => {
                  const crop = COMMODITY_LIST[h.commodity];
                  return (
                    <tr key={h.id} className="border-b border-nat-light-cream hover:bg-nat-light-cream/35">
                      <td className="py-3 font-bold text-nat-dark">{h.farmerName}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: crop.color }} />
                          {h.commodity}
                        </div>
                      </td>
                      <td className="py-3">{h.landArea} Ha</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-nat-sage" />
                          {h.expectedHarvestDate}
                        </div>
                      </td>
                      <td className="py-3 font-bold">{h.expectedVolume.toLocaleString('id-ID')} Kg</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
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
          <div className="text-center py-6 text-nat-sage italic">Belum ada data tanam dipublikasikan di wilayah ini.</div>
        )}
      </div>

      {/* Batch Distribution Status */}
      {regionalBatches.length > 0 && (
        <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
          <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
            <Package className="w-4 h-4 text-nat-brown" />
            Status Distribusi Batch ({regionalBatches.length})
          </h3>
          <div className="space-y-2">
            {regionalBatches.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 bg-nat-light-cream/40 border border-nat-border rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COMMODITY_LIST[b.commodity]?.color }} />
                  <span className="font-bold text-nat-dark">{b.commodity}</span>
                  <span className="text-nat-sage">• {b.farmerName} • {b.actualVolumeKg.toLocaleString('id-ID')} Kg</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                  b.status === 'READY' ? 'bg-nat-light-cream text-nat-brown border-nat-border'
                  : b.status === 'IN_TRANSIT' ? 'bg-nat-light-cream text-nat-dark border-nat-border'
                  : b.status === 'PICKED_UP_DIRECTLY' ? 'bg-nat-cream text-nat-green-hover border-nat-border'
                  : 'bg-nat-light-cream text-nat-green-hover border-nat-border'
                }`}>
                  {b.status === 'READY' ? 'Siap Kirim' : b.status === 'IN_TRANSIT' ? 'Dikirim' : b.status === 'PICKED_UP_DIRECTLY' ? 'Jemput Langsung' : 'Terkirim'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
