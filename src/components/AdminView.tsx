/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MatchWeights, COMMODITY_LIST } from '../types';
import { 
  Sliders, 
  Settings, 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  MapPin, 
  Scale, 
  DollarSign,
  Layers,
  Activity,
  User,
  AlertTriangle,
  Truck,
  Package,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function AdminView() {
  const { 
    matches, 
    harvests, 
    demands,
    harvestBatches,
    preOrders, 
    weights, 
    updateWeights, 
    updateMatchStatus,
    updateBatchStatus,
    resetAllData, 
    showNotification 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'matching' | 'distribution'>('matching');

  // Slider state
  const [wLocation, setWLocation] = useState(weights.wLocation);
  const [wVolume, setWVolume] = useState(weights.wVolume);
  const [wPrice, setWPrice] = useState(weights.wPrice);

  const totalWeights = wLocation + wVolume + wPrice;
  const isValidSum = Math.abs(totalWeights - 1.0) < 0.01;

  const handleSaveWeights = () => {
    if (!isValidSum) {
      // Auto normalize if sum is not exactly 1.0
      const sum = wLocation + wVolume + wPrice;
      if (sum === 0) {
        showNotification('Bobot tidak boleh nol semua!', 'warning');
        return;
      }
      const normLoc = Math.round((wLocation / sum) * 100) / 100;
      const normVol = Math.round((wVolume / sum) * 100) / 100;
      const normPrice = Math.round((1 - normLoc - normVol) * 100) / 100; // balance remaining to ensure exact 1.0 sum

      setWLocation(normLoc);
      setWVolume(normVol);
      setWPrice(normPrice);
      updateWeights({ wLocation: normLoc, wVolume: normVol, wPrice: normPrice });
    } else {
      updateWeights({ wLocation, wVolume, wPrice });
    }
  };

  const handleQuickResetWeights = () => {
    setWLocation(0.4);
    setWVolume(0.3);
    setWPrice(0.3);
    updateWeights({ wLocation: 0.4, wVolume: 0.3, wPrice: 0.3 });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-nat-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-nat-dark tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-nat-text" />
            Panel Kontrol Konfigurasi Admin (Matching Tuning)
          </h2>
          <p className="text-xs text-nat-sage mt-0.5">
            Otoritas platform: atur keseimbangan rumus pencocokan nasional, awasi sengketa, dan kelola database.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-nat-border gap-2">
        <button
          onClick={() => setActiveTab('matching')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'matching' ? 'border-nat-green text-nat-green-hover' : 'border-transparent text-nat-sage hover:text-nat-dark'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Matching Engine & Sengketa
        </button>
        <button
          onClick={() => setActiveTab('distribution')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'distribution' ? 'border-nat-green text-nat-green-hover' : 'border-transparent text-nat-sage hover:text-nat-dark'
          }`}
        >
          <Truck className="w-4 h-4" />
          Prioritas Distribusi
          {harvestBatches.filter(b => b.status === 'READY').length > 0 && (
            <span className="ml-1 bg-nat-brown text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {harvestBatches.filter(b => b.status === 'READY').length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'matching' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Transaksi & Pengawasan Sengketa */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-nat-light-cream">
            <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-nat-green" />
              Buku Besar & Pengawasan Transaksi Platform ({matches.length})
            </h3>
            <span className="text-[10px] text-nat-sage font-medium">Monitoring Real-Time Sinergi Hulu-Hilir</span>
          </div>

          {matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match) => {
                const harvest = harvests.find(h => h.id === match.harvestId);
                const demand = demands.find(d => d.id === match.demandId);
                if (!harvest || !demand) return null;

                const crop = COMMODITY_LIST[harvest.commodity];

                return (
                  <div key={match.id} className="border border-nat-border rounded-xl p-3.5 bg-nat-light-cream/50 hover:bg-nat-light-cream hover:shadow-sm transition-all text-xs">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2 pb-2 border-b border-nat-border/40">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crop.color }} />
                        <span className="font-bold text-nat-dark">{harvest.commodity}</span>
                        <span className="text-[10px] text-nat-sage">• ID: {match.id}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          match.status === 'CONFIRMED'
                            ? 'bg-nat-cream text-nat-green-hover'
                            : match.status === 'PENDING'
                            ? 'bg-nat-cream text-nat-sage'
                            : match.status === 'DISPUTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-nat-cream text-nat-brown'
                        }`}>
                          {match.status === 'PENDING' ? 'Saran' : match.status === 'CONFIRMED' ? 'Sepakat' : match.status}
                        </span>
                        
                        <span className="font-bold text-nat-green">{match.score}% Cocok</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] mb-3 text-nat-sage">
                      <div>
                        <span className="text-nat-sage block">Sisi Petani (Hulu)</span>
                        <span className="font-bold text-nat-dark flex items-center gap-0.5">
                          <User className="w-3 h-3 text-nat-sage" />
                          {harvest.farmerName} ({harvest.region})
                        </span>
                        <span className="block text-nat-sage text-[10px]">{harvest.expectedVolume.toLocaleString('id-ID')} Kg @ Rp{harvest.askingPrice.toLocaleString('id-ID')}</span>
                      </div>

                      <div>
                        <span className="text-nat-sage block">Sisi Pembeli (Hilir)</span>
                        <span className="font-bold text-nat-dark flex items-center gap-0.5">
                          <User className="w-3 h-3 text-nat-sage" />
                          {demand.buyerName} ({demand.region})
                        </span>
                        <span className="block text-nat-sage text-[10px]">{demand.requiredVolume.toLocaleString('id-ID')} Kg @ Rp{demand.offerPrice.toLocaleString('id-ID')}</span>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-nat-sage block">Rincian Efisiensi</span>
                        <span className="font-bold text-nat-text block">Jarak: {match.distanceKm} Km</span>
                        <span className="text-[10px] text-nat-sage font-semibold block">Potensi Sisa Terpotong</span>
                      </div>
                    </div>

                    {/* Admin Oversight Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-nat-border/40 text-[10px]">
                      <span className="text-nat-sage font-semibold">Tindakan Admin Platform:</span>
                      
                      <div className="flex space-x-1.5">
                        {match.status === 'DISPUTED' && (
                          <button
                            onClick={() => updateMatchStatus(match.id, 'CONFIRMED')}
                            className="bg-nat-green hover:bg-nat-green-hover text-white font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-0.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Selesaikan Sengketa (Sahkan)
                          </button>
                        )}
                        <button
                          onClick={() => {
                            updateMatchStatus(match.id, 'DISPUTED');
                          }}
                          className="bg-nat-cream hover:bg-nat-border hover:text-red-600 text-nat-sage font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-0.5 transition-colors cursor-pointer"
                          disabled={match.status === 'DISPUTED'}
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Tandai Masalah Logistik
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-nat-sage italic text-xs">
              Belum ada pencocokan logistik yang sedang diproses.
            </div>
          )}
        </div>
      </div>
      )}

      {activeTab === 'distribution' && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-nat-brown" />
                Batch Siap Kirim
              </p>
              <p className="text-2xl font-bold text-nat-dark mt-1">{harvestBatches.filter(b => b.status === 'READY').length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-nat-text" />
                Dalam Pengiriman
              </p>
              <p className="text-2xl font-bold text-nat-dark mt-1">{harvestBatches.filter(b => b.status === 'IN_TRANSIT').length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-nat-green" />
                Terkirim
              </p>
              <p className="text-2xl font-bold text-nat-dark mt-1">{harvestBatches.filter(b => b.status === 'DELIVERED').length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-nat-green" />
                Pre-Order Aktif
              </p>
              <p className="text-2xl font-bold text-nat-dark mt-1">{preOrders.filter(po => po.status === 'CONFIRMED').length}</p>
            </div>
          </div>

          {/* Distribution Priority List */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-nat-border">
              <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-nat-brown" />
                Antrian Prioritas Distribusi (Distribution Priority Engine)
              </h3>
              <span className="text-[10px] text-nat-sage font-semibold">Diurutkan: Skor Prioritas Tertinggi</span>
            </div>
            {harvestBatches.length > 0 ? (
              <div className="space-y-3">
                {[...harvestBatches]
                  .sort((a, b) => b.priorityScore - a.priorityScore)
                  .map((batch, idx) => {
                    const crop = COMMODITY_LIST[batch.commodity];
                    const linkedPO = preOrders.find(po => po.id === batch.preOrderId);
                    return (
                      <div key={batch.id} className="border border-nat-border rounded-xl p-3.5 bg-nat-light-cream/50 hover:bg-nat-light-cream transition-all text-xs">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-nat-border flex items-center justify-center text-[10px] font-black text-nat-sage">
                              #{idx + 1}
                            </span>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crop?.color }} />
                            <span className="font-bold text-nat-dark">{batch.commodity}</span>
                            <span className="text-nat-sage text-[10px]">• {batch.farmerName} ({batch.region})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <div className="text-[9px] text-nat-sage uppercase font-bold">Skor Prioritas</div>
                              <div className={`font-black text-sm ${batch.priorityScore >= 70 ? 'text-red-600' : batch.priorityScore >= 40 ? 'text-nat-brown' : 'text-nat-green'}`}>
                                {batch.priorityScore}/100
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="w-full bg-nat-border h-1.5 rounded-full mb-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${batch.priorityScore >= 70 ? 'bg-red-500' : batch.priorityScore >= 40 ? 'bg-nat-brown' : 'bg-nat-green'}`}
                            style={{ width: `${batch.priorityScore}%` }}
                          />
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-nat-sage mb-2">
                          <div><span className="text-nat-sage block">Volume</span><span className="font-bold">{batch.actualVolumeKg.toLocaleString('id-ID')} Kg</span></div>
                          <div><span className="text-nat-sage block">Umur Simpan</span><span className="font-bold">{batch.shelfLifeDays} hari</span></div>
                          <div><span className="text-nat-sage block">Tgl Panen</span><span className="font-bold">{batch.harvestDate}</span></div>
                          <div><span className="text-nat-sage block">Pre-Order</span><span className="font-bold">{linkedPO ? linkedPO.buyerName : '—'}</span></div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-nat-border">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                            batch.status === 'READY' ? 'bg-nat-light-cream text-nat-brown border-nat-border'
                            : batch.status === 'IN_TRANSIT' ? 'bg-nat-light-cream text-nat-dark border-nat-border'
                            : 'bg-nat-light-cream text-nat-green-hover border-nat-border'
                          }`}>
                            {batch.status === 'READY' ? 'Siap Kirim' : batch.status === 'IN_TRANSIT' ? 'Dalam Pengiriman' : 'Terkirim'}
                          </span>
                          <div className="flex gap-1.5">
                            {batch.status === 'READY' && (
                              <button
                                onClick={() => updateBatchStatus(batch.id, 'IN_TRANSIT')}
                                className="bg-nat-text hover:bg-nat-dark text-white font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <Truck className="w-3 h-3" />
                                Berangkat
                              </button>
                            )}
                            {batch.status === 'IN_TRANSIT' && (
                              <button
                                onClick={() => updateBatchStatus(batch.id, 'DELIVERED')}
                                className="bg-nat-green hover:bg-nat-green-hover text-white font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <CheckCircle className="w-3 h-3" />
                                Konfirmasi Terima
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="text-center py-12 text-nat-sage italic text-xs">
                Belum ada batch panen yang siap distribusi. Petani harus menandai panen selesai terlebih dahulu.
              </div>
            )}
          </div>

          {/* Pre-Order Summary */}
          {preOrders.length > 0 && (
            <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-border flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-nat-green" />
                Ringkasan Pre-Order Terkonfirmasi ({preOrders.filter(po => po.status === 'CONFIRMED').length})
              </h3>
              <div className="space-y-2">
                {preOrders.filter(po => po.status === 'CONFIRMED').map(po => (
                  <div key={po.id} className="flex items-center justify-between p-3 bg-nat-light-cream/50 border border-nat-border rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COMMODITY_LIST[po.commodity]?.color }} />
                      <div>
                        <span className="font-bold text-nat-dark">{po.commodity}</span>
                        <span className="text-nat-sage ml-2">• {po.farmerName} → {po.buyerName}</span>
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-nat-sage">
                      <div className="font-bold">{po.agreedVolumeKg.toLocaleString('id-ID')} Kg</div>
                      <div className="text-nat-green-hover font-bold">Rp{po.agreedPricePerKg.toLocaleString('id-ID')}/Kg</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
