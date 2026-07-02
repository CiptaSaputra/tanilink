/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/DataContext.tsx
 * ─────────────────────────────────────────
 * Domain data: harvests, demands, matches, pre-orders, harvest batches.
 * Tidak ada UI state — komponen yang handle notification sendiri.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  Role, Harvest, Demand, Match, PreOrder, HarvestBatch,
} from '../types';
import {
  COMMODITY_LIST, COMMODITY_WEIGHTS,
} from '../constants/commodities';
import { scoreMatch } from '../utils/matching';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';
import {
  harvestGetAll, harvestAdd as svcHarvestAdd, harvestUpdate as svcHarvestUpdate, harvestReset,
  demandGetAll, demandAdd as svcDemandAdd, demandUpdate as svcDemandUpdate, demandReset,
  matchGetAll, matchUpdateStatus as svcMatchUpdateStatus, matchSaveAll,
  preOrderGetAll, preOrderAdd as svcPreOrderAdd, preOrderUpdate, preOrderSetDeliveryMode, preOrderComplete, preOrderClear,
  batchGetAll, batchAdd as svcBatchAdd, batchUpdateStatus, batchClear,
  STORAGE_KEYS, storageRead,
} from '../services';

interface ActiveUserMap {
  PETANI:   { id: string; name: string; region: string };
  PEMBELI:  { id: string; name: string; region: string };
  PPL:      { id: string; name: string; region: string };
  KOLEKTOR: { id: string; name: string; region: string };
}

interface DataContextProps {
  harvests:       Harvest[];
  demands:        Demand[];
  matches:        Match[];
  preOrders:      PreOrder[];
  harvestBatches: HarvestBatch[];
  activeUser:     ActiveUserMap;
  addHarvest:             (data: Omit<Harvest, 'id' | 'farmerId' | 'farmerName' | 'status'>) => void;
  addDemand:              (data: Omit<Demand, 'id' | 'buyerId' | 'buyerName' | 'status'>) => void;
  updateMatchStatus:      (matchId: string, status: Match['status']) => void;
  createHarvestBatch:     (harvestId: string, actualVolumeKg: number) => PreOrder | undefined;
  updateBatchStatus:      (batchId: string, status: HarvestBatch['status']) => void;
  setDeliveryMode:        (preOrderId: string, mode: 'direct' | 'consolidated') => void;
  completePreOrder:       (preOrderId: string) => void;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showNotification } = useUI();

  // ── State ──────────────────────────────────────────────────────────────────
  const [harvests, setHarvests]       = useState<Harvest[]>(() => harvestGetAll());
  const [demands,  setDemands]        = useState<Demand[]>(() => demandGetAll());
  const [matches,  setMatches]        = useState<Match[]>([]);
  const [preOrders, setPreOrders]      = useState<PreOrder[]>(() => preOrderGetAll());
  const [harvestBatches, setHarvestBatches] = useState<HarvestBatch[]>(() => batchGetAll());

  // activeUser
  const activeUser: ActiveUserMap = {
    PETANI:   { id: currentUser?.role === 'PETANI'   ? currentUser.id : 'f-1',   name: currentUser?.role === 'PETANI'   ? currentUser.name : 'Pak Joko',                 region: currentUser?.role === 'PETANI'   ? currentUser.region : 'Brebes' },
    PEMBELI:  { id: currentUser?.role === 'PEMBELI'  ? currentUser.id : 'b-1',   name: currentUser?.role === 'PEMBELI'  ? currentUser.name : 'Koperasi Jaya Tani',        region: currentUser?.role === 'PEMBELI'  ? currentUser.region : 'Brebes' },
    PPL:      { id: currentUser?.role === 'PPL'      ? currentUser.id : 'ppl-1', name: currentUser?.role === 'PPL'      ? currentUser.name : 'Penyuluh Budi Santoso',    region: currentUser?.role === 'PPL'      ? currentUser.region : 'Brebes' },
    KOLEKTOR: { id: currentUser?.role === 'KOLEKTOR' ? currentUser.id : 'k-1',   name: currentUser?.role === 'KOLEKTOR' ? currentUser.name : 'Petugas Kolektor Brebes', region: currentUser?.role === 'KOLEKTOR' ? currentUser.region : 'Brebes' },
  };

  // ── Auto-compute matches ───────────────────────────────────────────────────
  useEffect(() => {
    const newMatches: Match[] = [];
    harvests.forEach(harvest => {
      if (harvest.status === 'EXPIRED' || !harvest.isPublished) return;
      demands.forEach(demand => {
        if (demand.status === 'CANCELLED') return;
        if (harvest.commodity !== demand.commodity) return;

        const m = scoreMatch(harvest, demand);
        const existing = matches.find(prev => prev.id === m.id);
        if (existing) m.status = existing.status;
        newMatches.push(m);
      });
    });
    newMatches.sort((a, b) => b.score - a.score);
    setMatches(newMatches);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [harvests, demands]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addHarvest = useCallback((data: Omit<Harvest, 'id' | 'farmerId' | 'farmerName' | 'status'>) => {
    const newHarvest: Harvest = {
      ...data,
      id:         `h-${Date.now()}`,
      farmerId:   activeUser.PETANI.id,
      farmerName: activeUser.PETANI.name,
      status:     'ACTIVE',
    };
    setHarvests(svcHarvestAdd(newHarvest));
    showNotification(`Laporan tanam ${data.commodity} berhasil ditambahkan!`, 'success');
  }, [activeUser, showNotification]);

  const addDemand = useCallback((data: Omit<Demand, 'id' | 'buyerId' | 'buyerName' | 'status'>) => {
    const newDemand: Demand = {
      ...data,
      id:        `d-${Date.now()}`,
      buyerId:   activeUser.PEMBELI.id,
      buyerName: activeUser.PEMBELI.name,
      status:    'ACTIVE',
    };
    setDemands(svcDemandAdd(newDemand));
    showNotification(`Permintaan demand untuk ${data.commodity} berhasil dipublikasi!`, 'success');
  }, [activeUser, showNotification]);

  const updateMatchStatus = useCallback((matchId: string, status: Match['status']) => {
    setMatches(prev =>
      prev.map(m => {
        if (m.id !== matchId) return m;

        const h = harvests.find(harv => harv.id === m.harvestId);
        const d = demands.find(dem => dem.id === m.demandId);

        if (status === 'CONFIRMED' && h && d) {
          setHarvests(svcHarvestUpdate(h.id, { status: 'MATCHED' }));
          setDemands(svcDemandUpdate(d.id, { status: 'FULFILLED' }));

          const newPO: PreOrder = {
            id:               `po-${Date.now()}`,
            matchId:          m.id,
            harvestId:        m.harvestId,
            demandId:         m.demandId,
            agreedPricePerKg: d.offerPrice,
            agreedVolumeKg:   Math.min(h.expectedVolume, d.requiredVolume),
            farmerName:       h.farmerName,
            buyerName:        d.buyerName,
            commodity:        h.commodity,
            deliveryMode:     'direct',
            status:           'CONFIRMED',
            createdAt:        new Date().toISOString().split('T')[0],
          };
          setPreOrders(svcPreOrderAdd(newPO));
          showNotification('Pre-Order Berhasil Dikonfirmasi! Hasil panen terselamatkan dari potensi susut.', 'success');
        } else if (status === 'ACCEPTED_BY_FARMER') {
          showNotification('Penawaran disetujui oleh Petani. Menunggu konfirmasi Pembeli.', 'info');
        } else if (status === 'ACCEPTED_BY_BUYER') {
          showNotification('Permintaan pencocokan diajukan ke Petani.', 'info');
        } else if (status === 'DISPUTED') {
          showNotification('Pencocokan dilaporkan mengalami kendala.', 'warning');
        }

        return { ...m, status };
      })
    );
  }, [harvests, demands, showNotification]);

  const createHarvestBatch = useCallback((harvestId: string, actualVolumeKg: number): PreOrder | undefined => {
    const harvest = harvests.find(h => h.id === harvestId);
    if (!harvest) return undefined;

    const shelfLifeDays = COMMODITY_LIST[harvest.commodity]?.shelfLifeDays ?? 14;
    const today = new Date();
    const daysOverdue = Math.max(
      0,
      Math.floor((today.getTime() - new Date(harvest.expectedHarvestDate).getTime()) / 86_400_000)
    );

    const shelfLifeScore = Math.round((1 / shelfLifeDays) * 4000);
    const overdueScore   = Math.min(40, daysOverdue * 4);
    const volumeScore    = Math.min(20, Math.floor(actualVolumeKg / 1000));
    const priorityScore  = Math.min(100, shelfLifeScore + overdueScore + volumeScore);

    const linkedPO = preOrders.find(po => po.harvestId === harvestId && po.status === 'CONFIRMED');

    const newBatch: HarvestBatch = {
      id:             `batch-${Date.now()}`,
      plantingId:     harvestId,
      farmerId:       harvest.farmerId,
      farmerName:     harvest.farmerName,
      commodity:      harvest.commodity,
      region:         harvest.region,
      latitude:       harvest.latitude,
      longitude:      harvest.longitude,
      preOrderId:     linkedPO?.id,
      actualVolumeKg,
      harvestDate:    today.toISOString().split('T')[0],
      shelfLifeDays,
      priorityScore,
      status:         'READY',
      createdAt:      today.toISOString().split('T')[0],
    };

    setHarvestBatches(svcBatchAdd(newBatch));
    setHarvests(svcHarvestUpdate(harvestId, { status: 'HARVESTED' }));
    showNotification(`Batch panen ${harvest.commodity} berhasil dicatat! Skor prioritas: ${priorityScore}`, 'success');
    return linkedPO;
  }, [harvests, preOrders, showNotification]);

  const updateBatchStatus = useCallback((batchId: string, status: HarvestBatch['status']) => {
    setHarvestBatches(batchUpdateStatus(batchId, status));
    const label =
      status === 'IN_TRANSIT'         ? 'sedang dalam pengiriman'   :
      status === 'DELIVERED'          ? 'sudah sampai tujuan'       :
      status === 'PICKED_UP_DIRECTLY' ? 'dijemput langsung pembeli' : 'diperbarui';
    showNotification(`Status batch diperbarui: ${label}`, 'info');
  }, [showNotification]);

  const setDeliveryMode = useCallback((preOrderId: string, mode: 'direct' | 'consolidated') => {
    setPreOrders(preOrderSetDeliveryMode(preOrderId, mode));
    showNotification(`Jalur pengiriman diubah ke: ${mode === 'direct' ? 'Jual Langsung' : 'Ikut Konsolidasi'}`, 'info');
  }, [showNotification]);

  const completePreOrder = useCallback((preOrderId: string) => {
    setPreOrders(preOrderComplete(preOrderId));
    showNotification('Pre-Order selesai! Silakan beri ulasan & rating.', 'success');
  }, [showNotification]);

  return (
    <DataContext.Provider value={{
      harvests, demands, matches, preOrders, harvestBatches, activeUser,
      addHarvest, addDemand, updateMatchStatus, createHarvestBatch,
      updateBatchStatus, setDeliveryMode, completePreOrder,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextProps => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData harus digunakan di dalam DataProvider');
  return ctx;
};
