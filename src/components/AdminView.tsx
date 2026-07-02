/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dashboard Admin — memantau performa bobot default Smart Matching per komoditas,
 * resolusi dispute, dan distribusi. Tidak mengatur bobot secara bebas.
 */

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { usePayment } from '../context/PaymentContext';
import { useReview } from '../context/ReviewContext';
import { useUI } from '../context/UIContext';
import { COMMODITY_LIST, COMMODITY_WEIGHTS } from '../constants/commodities';
import type { MatchWeights } from '../types';
import {
  Sliders,
  Settings,
  CheckCircle,
  AlertTriangle,
  Truck,
  Package,
  TrendingUp,
  Activity,
  User,
  Layers,
  Scale,
  Info,
  MapPin,
  Star,
  DollarSign,
} from 'lucide-react';

export default function AdminView() {
  const { matches, harvests, demands, harvestBatches, preOrders, updateMatchStatus, updateBatchStatus } = useData();
  const { reviews } = useReview();
  const { paymentConfirmations } = usePayment();
  const { showNotification } = useUI();

  const [activeTab, setActiveTab] = useState<'matching' | 'distribution'>('matching');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-nat-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-nat-dark tracking-tight flex items-center gap-2">
            <Settings className="w-4 h-4 text-nat-text" />
            Panel Admin TaniLink
          </h2>
          <p className="text-xs text-nat-sage mt-0.5">
            Pemantauan performa Smart Matching, resolusi dispute, dan status distribusi.
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm('Reset semua data ke awal?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
          className="text-[10px] bg-nat-light-cream border border-nat-border text-nat-text px-3 py-1.5 rounded-lg font-bold hover:bg-nat-cream cursor-pointer"
        >
          Reset Data
        </button>
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
          Bobot Default & Sengketa
        </button>
        <button
          onClick={() => setActiveTab('distribution')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'distribution' ? 'border-nat-green text-nat-green-hover' : 'border-transparent text-nat-sage hover:text-nat-dark'
          }`}
        >
          <Truck className="w-4 h-4" />
          Distribusi & Pre-Order
        </button>
      </div>

      {/* Tab: Bobot Default & Sengketa */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          {/* Bobot Default per Komoditas */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <div className="flex items-start gap-2 mb-4 pb-2 border-b border-nat-light-cream">
              <Scale className="w-4 h-4 text-nat-green shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-nat-dark">Bobot Default Smart Matching per Komoditas</h3>
                <p className="text-[10px] text-nat-sage">Bobot default sudah ditetapkan per kategori komoditas (PRD). Admin tidak mengatur bobot secara bebas.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-nat-border text-nat-sage font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2">Komoditas</th>
                    <th className="py-2 text-center">Lokasi (w1)</th>
                    <th className="py-2 text-center">Volume (w2)</th>
                    <th className="py-2 text-center">Harga (w3)</th>
                    <th className="py-2 text-xs">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(COMMODITY_WEIGHTS).map(([crop, w]) => {
                    const meta = COMMODITY_LIST[crop as keyof typeof COMMODITY_LIST];
                    const isPerishable = w.wLocation >= 0.45;
                    return (
                      <tr key={crop} className="border-b border-nat-light-cream hover:bg-nat-light-cream/35">
                        <td className="py-3 font-bold text-nat-dark flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta?.color }} />
                          {crop}
                        </td>
                        <td className="py-3 text-center font-bold text-nat-dark">{(w.wLocation * 100).toFixed(0)}%</td>
                        <td className="py-3 text-center font-bold text-nat-dark">{(w.wVolume * 100).toFixed(0)}%</td>
                        <td className="py-3 text-center font-bold text-nat-dark">{(w.wPrice * 100).toFixed(0)}%</td>
                        <td className="py-3 text-[10px] text-nat-sage">
                          {isPerishable
                            ? 'Cepat rusak — prioritas jarak tinggi'
                            : 'Tahan lama — prioritas harga/volume'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Daftar Match & Sengketa */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-nat-light-cream">
              <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-nat-green" />
                Transaksi & Sengketa ({matches.length})
              </h3>
              <span className="text-[10px] text-nat-sage">
                Sengketa: {matches.filter(m => m.status === 'DISPUTED').length}
              </span>
            </div>

            {matches.length > 0 ? (
              <div className="space-y-3">
                {matches.map((match) => {
                  const harvest = harvests.find(h => h.id === match.harvestId);
                  const demand = demands.find(d => d.id === match.demandId);
                  if (!harvest || !demand) return null;
                  const crop = COMMODITY_LIST[harvest.commodity];

                  return (
                    <div key={match.id} className="border border-nat-border rounded-xl p-3.5 bg-nat-light-cream/50 text-xs">
                      <div className="flex justify-between items-start mb-2 pb-2 border-b border-nat-border/40">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crop.color }} />
                          <span className="font-bold text-nat-dark">{harvest.commodity}</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold border bg-nat-light-cream text-nat-sage">
                            Bobot: {COMMODITY_WEIGHTS[harvest.commodity] ? `${(COMMODITY_WEIGHTS[harvest.commodity].wLocation * 100).toFixed(0)}/${(COMMODITY_WEIGHTS[harvest.commodity].wVolume * 100).toFixed(0)}/${(COMMODITY_WEIGHTS[harvest.commodity].wPrice * 100).toFixed(0)}` : '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            match.status === 'CONFIRMED' ? 'bg-nat-cream text-nat-green-hover'
                            : match.status === 'DISPUTED' ? 'bg-red-100 text-red-800'
                            : match.status === 'PENDING' ? 'bg-nat-cream text-nat-sage'
                            : 'bg-nat-cream text-nat-brown'
                          }`}>
                            {match.status}
                          </span>
                          <span className="font-bold text-nat-green">{match.score}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-nat-sage mb-2">
                        <div>
                          <span className="block font-bold text-nat-dark flex items-center gap-0.5">
                            <User className="w-3 h-3" /> {harvest.farmerName} ({harvest.region})
                          </span>
                          {harvest.expectedVolume.toLocaleString('id-ID')} Kg @ Rp{harvest.askingPrice.toLocaleString('id-ID')}
                        </div>
                        <div>
                          <span className="block font-bold text-nat-dark flex items-center gap-0.5">
                            <User className="w-3 h-3" /> {demand.buyerName} ({demand.region})
                          </span>
                          {demand.requiredVolume.toLocaleString('id-ID')} Kg @ Rp{demand.offerPrice.toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="flex justify-end gap-1.5 pt-2 border-t border-nat-border/40">
                        {match.status === 'DISPUTED' && (
                          <button onClick={() => updateMatchStatus(match.id, 'CONFIRMED')}
                            className="bg-nat-green hover:bg-nat-green-hover text-white font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-0.5 cursor-pointer">
                            <CheckCircle className="w-3 h-3" /> Selesaikan Sengketa
                          </button>
                        )}
                        <button onClick={() => { if (match.status !== 'DISPUTED') updateMatchStatus(match.id, 'DISPUTED'); }}
                          className="bg-nat-cream hover:bg-nat-border text-nat-sage font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-0.5 cursor-pointer"
                          disabled={match.status === 'DISPUTED'}>
                          <AlertTriangle className="w-3 h-3" /> Tandai Masalah
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-nat-sage italic text-xs">Belum ada pencocokan.</div>
            )}
          </div>

          {/* Ulasan & Rating Summary */}
          {reviews.length > 0 && (
            <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-light-cream flex items-center gap-1.5">
                <Star className="w-4 h-4 text-nat-brown" />
                Ulasan & Rating ({reviews.length})
              </h3>
              <div className="space-y-2">
                {reviews.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-nat-light-cream/50 border border-nat-border rounded-xl text-xs">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className="w-3 h-3" fill={s <= r.rating ? '#A67C52' : 'none'} stroke={s <= r.rating ? '#A67C52' : '#ccc'} />
                        ))}
                      </span>
                      <span className="text-nat-sage ml-2">{r.comment || '—'}</span>
                    </div>
                    <span className="text-[9px] text-nat-sage">Pre-Order: {r.preOrderId.slice(0, 12)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Distribusi & Pre-Order */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-nat-brown" />
                Batch Siap
              </p>
              <p className="text-2xl font-bold text-nat-dark mt-1">{harvestBatches.filter(b => b.status === 'READY').length}</p>
            </div>
            <div className="bg-white rounded-2xl border border-nat-border p-4 shadow-sm">
              <p className="text-[10px] text-nat-sage uppercase tracking-wider font-bold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-nat-text" />
                Dalam Perjalanan
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

          {/* Distribution Priority */}
          <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
            <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-border flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-nat-brown" />
              Prioritas Distribusi (Distribution Priority)
            </h3>
            {harvestBatches.length > 0 ? (
              <div className="space-y-3">
                {[...harvestBatches].sort((a, b) => b.priorityScore - a.priorityScore).map((batch, idx) => {
                  const crop = COMMODITY_LIST[batch.commodity];
                  const po = preOrders.find(p => p.id === batch.preOrderId);
                  return (
                    <div key={batch.id} className="border border-nat-border rounded-xl p-3.5 bg-nat-light-cream/50 text-xs">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-nat-border flex items-center justify-center text-[10px] font-black text-nat-sage">#{idx + 1}</span>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crop?.color }} />
                          <span className="font-bold text-nat-dark">{batch.commodity}</span>
                          <span className="text-nat-sage">• {batch.farmerName}</span>
                        </div>
                        <div className={`font-black text-sm ${batch.priorityScore >= 70 ? 'text-red-600' : batch.priorityScore >= 40 ? 'text-nat-brown' : 'text-nat-green'}`}>
                          {batch.priorityScore}/100
                        </div>
                      </div>
                      <div className="w-full bg-nat-border h-1.5 rounded-full mb-2 overflow-hidden">
                        <div className={`h-full rounded-full ${batch.priorityScore >= 70 ? 'bg-red-500' : batch.priorityScore >= 40 ? 'bg-nat-brown' : 'bg-nat-green'}`}
                          style={{ width: `${batch.priorityScore}%` }} />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-nat-sage mb-2">
                        <div><span className="block">Volume</span><span className="font-bold">{batch.actualVolumeKg.toLocaleString('id-ID')} Kg</span></div>
                        <div><span className="block">Umur Simpan</span><span className="font-bold">{batch.shelfLifeDays} hari</span></div>
                        <div><span className="block">Tgl Panen</span><span className="font-bold">{batch.harvestDate}</span></div>
                        <div><span className="block">Pre-Order</span><span className="font-bold">{po ? po.buyerName : '—'}</span></div>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-nat-border">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                          batch.status === 'READY' ? 'bg-nat-light-cream text-nat-brown border-nat-border'
                          : batch.status === 'IN_TRANSIT' ? 'bg-nat-light-cream text-nat-dark border-nat-border'
                          : batch.status === 'PICKED_UP_DIRECTLY' ? 'bg-nat-cream text-nat-green-hover border-nat-border'
                          : 'bg-nat-light-cream text-nat-green-hover border-nat-border'
                        }`}>
                          {batch.status === 'READY' ? 'Siap' : batch.status === 'IN_TRANSIT' ? 'Dikirim' : batch.status === 'PICKED_UP_DIRECTLY' ? 'Jemput Langsung' : 'Terkirim'}
                        </span>
                        <div className="flex gap-1.5">
                          {batch.status === 'READY' && (
                            <button onClick={() => updateBatchStatus(batch.id, 'IN_TRANSIT')}
                              className="bg-nat-text hover:bg-nat-dark text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer">
                              Berangkat
                            </button>
                          )}
                          {batch.status === 'IN_TRANSIT' && (
                            <button onClick={() => updateBatchStatus(batch.id, 'DELIVERED')}
                              className="bg-nat-green hover:bg-nat-green-hover text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer">
                              <CheckCircle className="w-3 h-3 inline" /> Terima
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-nat-sage italic text-xs">Belum ada batch panen.</div>
            )}
          </div>

          {/* Pre-Orders */}
          {preOrders.length > 0 && (
            <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-nat-dark mb-4 pb-2 border-b border-nat-border flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-nat-green" />
                Pre-Order ({preOrders.length})
              </h3>
              <div className="space-y-2">
                {preOrders.map(po => {
                  const pay = paymentConfirmations.find(p => p.preOrderId === po.id);
                  return (
                    <div key={po.id} className="flex items-center justify-between p-3 bg-nat-light-cream/50 border border-nat-border rounded-xl text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COMMODITY_LIST[po.commodity]?.color }} />
                        <div>
                          <span className="font-bold text-nat-dark">{po.commodity}</span>
                          <span className="text-nat-sage ml-2">• {po.farmerName} → {po.buyerName}</span>
                          <span className="text-[9px] text-nat-sage ml-2">
                            | {po.deliveryMode === 'direct' ? 'Langsung' : 'Konsolidasi'}
                            {pay ? ` | Bayar: ${pay.status}` : ''}
                          </span>
                        </div>
                      </div>
                      <div className="text-right text-[10px]">
                        <div className="font-bold">{po.agreedVolumeKg.toLocaleString('id-ID')} Kg</div>
                        <div className="font-bold text-nat-green-hover">Rp{po.agreedPricePerKg.toLocaleString('id-ID')}/Kg</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
