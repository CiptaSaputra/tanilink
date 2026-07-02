/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/AppContext.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Global state management. Semua operasi baca/tulis data menggunakan service
 * layer (src/services/) — tidak ada localStorage call langsung di sini.
 *
 * Swap ke backend: cukup ubah implementasi di service layer.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Harvest,
  Demand,
  Match,
  MatchWeights,
  COMMODITY_LIST,
  COMMODITY_WEIGHTS,
  PreOrder,
  HarvestBatch,
  Conversation,
  Message,
  PaymentConfirmation,
  Review,
} from '../types';
import { useAuth } from './AuthContext';

// Service layer imports — satu-satunya titik akses data
import {
  STORAGE_KEYS,
  storageRead,
  storageWrite,
  storageClearDomain,
  harvestGetAll,
  harvestAdd,
  harvestUpdate,
  harvestSaveAll,
  harvestReset,
  demandGetAll,
  demandAdd,
  demandUpdate,
  demandSaveAll,
  demandReset,
  preOrderGetAll,
  preOrderAdd,
  preOrderUpdate,
  preOrderSetDeliveryMode,
  preOrderComplete,
  preOrderClear,
  batchGetAll,
  batchAdd,
  batchUpdateStatus,
  batchClear,
  conversationGetAll,
  conversationGetByMatchId,
  conversationAdd,
  conversationClear,
  messageGetAll,
  messageAdd,
  messageClear,
  paymentGetAll,
  paymentUpsertByPreOrder,
  paymentConfirm,
  paymentClear,
  reviewGetAll,
  reviewAdd,
  reviewClear,
} from '../services';

// ─── Pure Functions (tidak ada side effects) ──────────────────────────────────

/** Haversine distance antara dua koordinat, hasil dalam km. */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/** Hitung skor matching antara satu harvest dan satu demand. Pure function. */
export function scoreMatch(harvest: Harvest, demand: Demand): Match {
  const distanceKm = calculateDistance(
    harvest.latitude, harvest.longitude,
    demand.latitude,  demand.longitude
  );

  const weights = COMMODITY_WEIGHTS[harvest.commodity] ?? { wLocation: 0.4, wVolume: 0.3, wPrice: 0.3 };

  let distanceScore = 0;
  if (distanceKm <= 5)        distanceScore = 100;
  else if (distanceKm < 150)  distanceScore = Math.round(100 * (1 - (distanceKm - 5) / 145));

  const minVol = Math.min(harvest.expectedVolume, demand.requiredVolume);
  const maxVol = Math.max(harvest.expectedVolume, demand.requiredVolume);
  const volumeScore = maxVol > 0 ? Math.round((minVol / maxVol) * 100) : 0;

  let priceScore = 0;
  if (demand.offerPrice >= harvest.askingPrice) {
    priceScore = 100;
  } else {
    const ratio = demand.offerPrice / harvest.askingPrice;
    if (ratio >= 0.6) priceScore = Math.round(((ratio - 0.6) / 0.4) * 100);
  }

  const totalScore = Math.round(
    weights.wLocation * distanceScore +
    weights.wVolume   * volumeScore +
    weights.wPrice    * priceScore
  );

  return {
    id: `match-${harvest.id}-${demand.id}`,
    harvestId: harvest.id,
    demandId:  demand.id,
    score:     totalScore,
    distanceKm,
    scoreDetails: { distanceScore, volumeScore, priceScore, totalScore, distanceKm },
    status:    'PENDING',
    createdAt: new Date().toISOString().split('T')[0],
  };
}

// ─── Context Interface ─────────────────────────────────────────────────────────

interface AppContextProps {
  harvests:             Harvest[];
  demands:              Demand[];
  matches:              Match[];
  preOrders:            PreOrder[];
  harvestBatches:       HarvestBatch[];
  conversations:        Conversation[];
  messages:             Message[];
  paymentConfirmations: PaymentConfirmation[];
  reviews:              Review[];
  weights:              MatchWeights;
  activeRole:           Role;
  activeUser: {
    PETANI:   { id: string; name: string; region: string };
    PEMBELI:  { id: string; name: string; region: string };
    PPL:      { id: string; name: string; region: string };
    KOLEKTOR: { id: string; name: string; region: string };
  };
  notification: { message: string; type: 'success' | 'warning' | 'info' } | null;

  addHarvest:             (harvest: Omit<Harvest, 'id' | 'farmerId' | 'farmerName' | 'status'>) => void;
  addDemand:              (demand: Omit<Demand, 'id' | 'buyerId' | 'buyerName' | 'status'>) => void;
  updateMatchStatus:      (matchId: string, status: Match['status']) => void;
  setRole:                (role: Role) => void;
  showNotification:       (message: string, type: 'success' | 'warning' | 'info') => void;
  dismissNotification:    () => void;
  resetAllData:           () => void;
  createHarvestBatch:     (harvestId: string, actualVolumeKg: number) => void;
  updateBatchStatus:      (batchId: string, status: HarvestBatch['status']) => void;
  setDeliveryMode:        (preOrderId: string, mode: 'direct' | 'consolidated') => void;
  sendMessage:            (conversationId: string, senderUserId: string, content: string) => void;
  startConversation:      (matchId: string, farmerUserId: string, buyerUserId: string) => string;
  addPaymentConfirmation: (preOrderId: string, proofImageUrl?: string, notes?: string) => void;
  confirmPayment:         (paymentId: string) => void;
  addReview:              (preOrderId: string, reviewerUserId: string, revieweeUserId: string, rating: number, comment?: string) => void;
  completePreOrder:       (preOrderId: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// ─── Provider ──────────────────────────────────────────────────────────────────

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  // activeRole dari user yang login; Admin bisa switch untuk demo
  const [activeRole, setActiveRole] = useState<Role>(() => {
    if (currentUser) return currentUser.role;
    return (storageRead<Role>(STORAGE_KEYS.ACTIVE_ROLE)) ?? 'PETANI';
  });

  useEffect(() => {
    if (currentUser) setActiveRole(currentUser.role);
  }, [currentUser]);

  // ── State — diinisialisasi dari service layer ─────────────────────────────
  const [harvests,             setHarvests]             = useState<Harvest[]>           (() => harvestGetAll());
  const [demands,              setDemands]              = useState<Demand[]>            (() => demandGetAll());
  const [matches,              setMatches]              = useState<Match[]>             ([]);
  const [preOrders,            setPreOrders]            = useState<PreOrder[]>          (() => preOrderGetAll());
  const [harvestBatches,       setHarvestBatches]       = useState<HarvestBatch[]>      (() => batchGetAll());
  const [conversations,        setConversations]        = useState<Conversation[]>      (() => conversationGetAll());
  const [messages,             setMessages]             = useState<Message[]>           (() => messageGetAll());
  const [paymentConfirmations, setPaymentConfirmations] = useState<PaymentConfirmation[]>(() => paymentGetAll());
  const [reviews,              setReviews]              = useState<Review[]>            (() => reviewGetAll());
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // activeUser — identitas user yang login; fallback ke nilai demo
  const activeUser = {
    PETANI:   { id: currentUser?.role === 'PETANI'   ? currentUser.id : 'f-1',   name: currentUser?.role === 'PETANI'   ? currentUser.name : 'Pak Joko',                 region: currentUser?.role === 'PETANI'   ? currentUser.region : 'Brebes' },
    PEMBELI:  { id: currentUser?.role === 'PEMBELI'  ? currentUser.id : 'b-1',   name: currentUser?.role === 'PEMBELI'  ? currentUser.name : 'Koperasi Jaya Tani',        region: currentUser?.role === 'PEMBELI'  ? currentUser.region : 'Brebes' },
    PPL:      { id: currentUser?.role === 'PPL'      ? currentUser.id : 'ppl-1', name: currentUser?.role === 'PPL'      ? currentUser.name : 'Penyuluh Budi Santoso',    region: currentUser?.role === 'PPL'      ? currentUser.region : 'Brebes' },
    KOLEKTOR: { id: currentUser?.role === 'KOLEKTOR' ? currentUser.id : 'k-1',   name: currentUser?.role === 'KOLEKTOR' ? currentUser.name : 'Petugas Kolektor Brebes', region: currentUser?.role === 'KOLEKTOR' ? currentUser.region : 'Brebes' },
  };

  const [weights] = useState<MatchWeights>(COMMODITY_WEIGHTS['Bawang Merah']);

  // ── Auto-compute matches ───────────────────────────────────────────────────
  useEffect(() => {
    const newMatches: Match[] = [];
    harvests.forEach(harvest => {
      if (harvest.status === 'EXPIRED' || !harvest.isPublished) return;
      demands.forEach(demand => {
        if (demand.status === 'CANCELLED') return;
        if (harvest.commodity !== demand.commodity) return;

        const m = scoreMatch(harvest, demand);
        // Preserve status yang sudah diset user
        const existing = matches.find(prev => prev.id === m.id);
        if (existing) m.status = existing.status;
        newMatches.push(m);
      });
    });
    newMatches.sort((a, b) => b.score - a.score);
    setMatches(newMatches);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [harvests, demands]);

  // ── Sync activeRole ke storage ────────────────────────────────────────────
  useEffect(() => {
    storageWrite(STORAGE_KEYS.ACTIVE_ROLE, activeRole);
  }, [activeRole]);

  // ── Notification helpers ──────────────────────────────────────────────────
  const showNotification = (message: string, type: 'success' | 'warning' | 'info') =>
    setNotification({ message, type });

  const dismissNotification = () => setNotification(null);

  // ── Domain Actions ────────────────────────────────────────────────────────

  const addHarvest = (data: Omit<Harvest, 'id' | 'farmerId' | 'farmerName' | 'status'>) => {
    const newHarvest: Harvest = {
      ...data,
      id:          `h-${Date.now()}`,
      farmerId:    activeUser.PETANI.id,
      farmerName:  activeUser.PETANI.name,
      status:      'ACTIVE',
    };
    setHarvests(harvestAdd(newHarvest));
    showNotification(`Laporan tanam ${data.commodity} berhasil ditambahkan!`, 'success');
  };

  const addDemand = (data: Omit<Demand, 'id' | 'buyerId' | 'buyerName' | 'status'>) => {
    const newDemand: Demand = {
      ...data,
      id:        `d-${Date.now()}`,
      buyerId:   activeUser.PEMBELI.id,
      buyerName: activeUser.PEMBELI.name,
      status:    'ACTIVE',
    };
    setDemands(demandAdd(newDemand));
    showNotification(`Permintaan demand untuk ${data.commodity} berhasil dipublikasi!`, 'success');
  };

  const updateMatchStatus = (matchId: string, status: Match['status']) => {
    setMatches(prev =>
      prev.map(m => {
        if (m.id !== matchId) return m;

        const h = harvests.find(harv => harv.id === m.harvestId);
        const d = demands.find(dem  => dem.id  === m.demandId);

        if (status === 'CONFIRMED' && h && d) {
          // Tandai harvest & demand
          setHarvests(harvestUpdate(h.id, { status: 'MATCHED' }));
          setDemands(demandUpdate(d.id, { status: 'FULFILLED' }));

          // Buat PreOrder
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
          setPreOrders(preOrderAdd(newPO));

          // Auto-buat conversation
          startConversation(matchId, h.farmerId, d.buyerId);

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
  };

  const setRole = (role: Role) => {
    setActiveRole(role);
    showNotification(`Beralih peran menjadi: ${role}`, 'info');
  };

  const createHarvestBatch = (harvestId: string, actualVolumeKg: number) => {
    const harvest = harvests.find(h => h.id === harvestId);
    if (!harvest) return;

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

    setHarvestBatches(batchAdd(newBatch));
    setHarvests(harvestUpdate(harvestId, { status: 'HARVESTED' }));
    showNotification(`Batch panen ${harvest.commodity} berhasil dicatat! Skor prioritas: ${priorityScore}`, 'success');
  };

  const updateBatchStatus = (batchId: string, status: HarvestBatch['status']) => {
    setHarvestBatches(batchUpdateStatus(batchId, status));
    const label =
      status === 'IN_TRANSIT'         ? 'sedang dalam pengiriman' :
      status === 'DELIVERED'          ? 'sudah sampai tujuan'     :
      status === 'PICKED_UP_DIRECTLY' ? 'dijemput langsung pembeli' : 'diperbarui';
    showNotification(`Status batch diperbarui: ${label}`, 'info');
  };

  const setDeliveryMode = (preOrderId: string, mode: 'direct' | 'consolidated') => {
    setPreOrders(preOrderSetDeliveryMode(preOrderId, mode));
    showNotification(`Jalur pengiriman diubah ke: ${mode === 'direct' ? 'Jual Langsung' : 'Ikut Konsolidasi'}`, 'info');
  };

  const startConversation = (matchId: string, farmerUserId: string, buyerUserId: string): string => {
    const existing = conversationGetByMatchId(matchId);
    if (existing) return existing.id;

    const newConv: Conversation = {
      id:           `conv-${Date.now()}`,
      matchId,
      farmerUserId,
      buyerUserId,
      createdAt:    new Date().toISOString().split('T')[0],
    };
    const { conversation } = conversationAdd(newConv);
    setConversations(conversationGetAll());
    return conversation.id;
  };

  const sendMessage = (conversationId: string, senderUserId: string, content: string) => {
    const newMsg: Message = {
      id:             `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      senderUserId,
      content,
      sentAt:         new Date().toISOString(),
    };
    setMessages(messageAdd(newMsg));
  };

  const addPaymentConfirmation = (preOrderId: string, proofImageUrl?: string, notes?: string) => {
    setPaymentConfirmations(paymentUpsertByPreOrder(preOrderId, proofImageUrl, notes));
    showNotification('Bukti pembayaran berhasil diunggah (opsional).', 'success');
  };

  const confirmPayment = (paymentId: string) => {
    setPaymentConfirmations(paymentConfirm(paymentId));
    showNotification('Pembayaran telah dikonfirmasi!', 'success');
  };

  const addReview = (
    preOrderId: string,
    reviewerUserId: string,
    revieweeUserId: string,
    rating: number,
    comment?: string
  ) => {
    const newReview: Review = {
      id:             `rev-${Date.now()}`,
      preOrderId,
      reviewerUserId,
      revieweeUserId,
      rating,
      comment,
      createdAt:      new Date().toISOString().split('T')[0],
    };
    setReviews(reviewAdd(newReview));
    showNotification('Ulasan & rating berhasil dikirim!', 'success');
  };

  const completePreOrder = (preOrderId: string) => {
    setPreOrders(preOrderComplete(preOrderId));
    showNotification('Pre-Order selesai! Silakan beri ulasan & rating.', 'success');
  };

  const resetAllData = () => {
    setHarvests(harvestReset());
    setDemands(demandReset());
    setPreOrders([]); preOrderClear();
    setHarvestBatches([]); batchClear();
    setConversations([]); conversationClear();
    setMessages([]); messageClear();
    setPaymentConfirmations([]); paymentClear();
    setReviews([]); reviewClear();
    storageClearDomain();
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        harvests, demands, matches, preOrders, harvestBatches,
        conversations, messages, paymentConfirmations, reviews,
        weights, activeRole, activeUser, notification,
        addHarvest, addDemand, updateMatchStatus, setRole,
        showNotification, dismissNotification, resetAllData,
        createHarvestBatch, updateBatchStatus, setDeliveryMode,
        sendMessage, startConversation,
        addPaymentConfirmation, confirmPayment,
        addReview, completePreOrder,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// ─── Hook ──────────────────────────────────────────────────────────────────────

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp harus digunakan di dalam AppProvider');
  return ctx;
};
