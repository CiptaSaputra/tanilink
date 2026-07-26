/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/DataContext.tsx
 * ─────────────────────────────────────────
 * Domain data: harvests, demands, matches, pre-orders, harvest batches.
 * Tidak ada UI state — komponen yang handle notification sendiri.
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type {
  Role,
  Harvest,
  Demand,
  Match,
  PreOrder,
  HarvestBatch,
} from "../types";
import { COMMODITY_LIST, COMMODITY_WEIGHTS } from "../constants/commodities";
import { scoreMatch } from "../utils/matching";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";
import {
  harvestGetAll,
  harvestAdd as svcHarvestAdd,
  harvestUpdate as svcHarvestUpdate,
  harvestReset,
  demandGetAll,
  demandAdd as svcDemandAdd,
  demandUpdate as svcDemandUpdate,
  demandReset,
  matchGetAll,
  matchUpdateStatus as svcMatchUpdateStatus,
  matchSaveAll,
  preOrderGetAll,
  preOrderAdd as svcPreOrderAdd,
  preOrderUpdate,
  preOrderSetDeliveryMode,
  preOrderComplete,
  preOrderClear,
  batchGetAll,
  batchAdd as svcBatchAdd,
  batchUpdateStatus,
  batchClear,
  STORAGE_KEYS,
  storageRead,
} from "../services";

interface ActiveUserMap {
  PETANI: { id: string; name: string; region: string };
  PEMBELI: { id: string; name: string; region: string };
  PPL: { id: string; name: string; region: string };
  KOLEKTOR: { id: string; name: string; region: string };
}

interface DataContextProps {
  harvests: Harvest[];
  demands: Demand[];
  matches: Match[];
  preOrders: PreOrder[];
  harvestBatches: HarvestBatch[];
  activeUser: ActiveUserMap;
  addHarvest: (
    data: Omit<Harvest, "id" | "farmerId" | "farmerName" | "status">,
  ) => Promise<void>;
  addDemand: (
    data: Omit<Demand, "id" | "buyerId" | "buyerName" | "status">,
  ) => Promise<void>;
  updateMatchStatus: (
    matchId: string,
    status: Match["status"],
  ) => Promise<void>;
  createHarvestBatch: (
    harvestId: string,
    actualVolumeKg: number,
  ) => Promise<PreOrder | undefined>;
  updateBatchStatus: (
    batchId: string,
    status: HarvestBatch["status"],
  ) => Promise<void>;
  setDeliveryMode: (
    preOrderId: string,
    mode: "direct" | "consolidated",
  ) => Promise<void>;
  completePreOrder: (preOrderId: string) => Promise<void>;
}

const DataContext = createContext<DataContextProps | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const { showNotification } = useUI();

  // ── State ──────────────────────────────────────────────────────────────────
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [harvestBatches, setHarvestBatches] = useState<HarvestBatch[]>([]);

  useEffect(() => {
    async function loadData() {
      const [h, d, p, b, m] = await Promise.all([
        harvestGetAll(),
        demandGetAll(),
        preOrderGetAll(),
        batchGetAll(),
        matchGetAll(),
      ]);
      setHarvests(h);
      setDemands(d);
      setPreOrders(p);
      setHarvestBatches(b);
      setMatches(m.sort((a, b) => b.score - a.score));
    }
    loadData();
  }, []);

  // activeUser
  const activeUser: ActiveUserMap = {
    PETANI: {
      id: currentUser?.role === "PETANI" ? currentUser.id : "f-1",
      name: currentUser?.role === "PETANI" ? currentUser.name : "Pak Joko",
      region: currentUser?.role === "PETANI" ? currentUser.region : "Brebes",
    },
    PEMBELI: {
      id: currentUser?.role === "PEMBELI" ? currentUser.id : "b-1",
      name:
        currentUser?.role === "PEMBELI"
          ? currentUser.name
          : "Koperasi Jaya Tani",
      region: currentUser?.role === "PEMBELI" ? currentUser.region : "Brebes",
    },
    PPL: {
      id: currentUser?.role === "PPL" ? currentUser.id : "ppl-1",
      name:
        currentUser?.role === "PPL"
          ? currentUser.name
          : "Penyuluh Budi Santoso",
      region: currentUser?.role === "PPL" ? currentUser.region : "Brebes",
    },
    KOLEKTOR: {
      id: currentUser?.role === "KOLEKTOR" ? currentUser.id : "k-1",
      name:
        currentUser?.role === "KOLEKTOR"
          ? currentUser.name
          : "Petugas Kolektor Brebes",
      region: currentUser?.role === "KOLEKTOR" ? currentUser.region : "Brebes",
    },
  };

  // ── Matching diproses oleh Backend, kita cukup me-refresh data matches saat ada perubahan
  const refreshMatches = useCallback(async () => {
    const m = await matchGetAll();
    // Sort highest score first
    m.sort((a, b) => b.score - a.score);
    setMatches(m);
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const addHarvest = useCallback(
    async (
      data: Omit<Harvest, "id" | "farmerId" | "farmerName" | "status">,
    ) => {
      const newHarvest: Harvest = {
        ...data,
        id: `h-${Date.now()}`,
        farmerId: activeUser.PETANI.id,
        farmerName: activeUser.PETANI.name,
        status: "ACTIVE",
      };
      const updated = await svcHarvestAdd(newHarvest);
      setHarvests(updated);
      await refreshMatches();
      showNotification(
        `Laporan tanam ${data.commodity} berhasil ditambahkan!`,
        "success",
      );
    },
    [activeUser, showNotification, refreshMatches],
  );

  const addDemand = useCallback(
    async (data: Omit<Demand, "id" | "buyerId" | "buyerName" | "status">) => {
      const newDemand: Demand = {
        ...data,
        id: `d-${Date.now()}`,
        buyerId: activeUser.PEMBELI.id,
        buyerName: activeUser.PEMBELI.name,
        status: "ACTIVE",
      };
      const updated = await svcDemandAdd(newDemand);
      setDemands(updated);
      await refreshMatches();
      showNotification(
        `Permintaan demand untuk ${data.commodity} berhasil dipublikasi!`,
        "success",
      );
    },
    [activeUser, showNotification, refreshMatches],
  );

  const updateMatchStatus = useCallback(
    async (matchId: string, status: Match["status"]) => {
      // Need a simpler approach: update optimistic state, then make async calls
      const m = matches.find((m) => m.id === matchId);
      if (!m) return;

      setMatches((prev) =>
        prev.map((match) =>
          match.id === matchId ? { ...match, status } : match,
        ),
      );

      const h = harvests.find((harv) => harv.id === m.harvestId);
      const d = demands.find((dem) => dem.id === m.demandId);

      if (status === "CONFIRMED" && h && d) {
        try {
          const res = await fetch("/api/pre-orders/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matchId }),
          });
          if (res.ok) {
            // Refresh data from server to reflect all changes
            const [updatedHarvests, updatedDemands, updatedPreOrders] = await Promise.all([
              harvestGetAll(),
              demandGetAll(),
              preOrderGetAll(),
            ]);
            setHarvests(updatedHarvests);
            setDemands(updatedDemands);
            setPreOrders(updatedPreOrders);
            await refreshMatches();
            
            showNotification(
              "Pre-Order Berhasil Dikonfirmasi! Hasil panen terselamatkan dari potensi susut.",
              "success",
            );
          } else {
            showNotification("Gagal memproses konfirmasi PO. Coba lagi.", "warning");
          }
        } catch (error) {
          console.error(error);
          showNotification("Terjadi kesalahan sistem saat memproses konfirmasi.", "warning");
        }
      } else if (status === "ACCEPTED_BY_FARMER") {
        showNotification(
          "Penawaran disetujui oleh Petani. Menunggu konfirmasi Pembeli.",
          "info",
        );
      } else if (status === "ACCEPTED_BY_BUYER") {
        showNotification("Permintaan pencocokan diajukan ke Petani.", "info");
      } else if (status === "DISPUTED") {
        showNotification("Pencocokan dilaporkan mengalami kendala.", "warning");
      }
    },
    [harvests, demands, matches, showNotification],
  );

  const createHarvestBatch = useCallback(
    async (
      harvestId: string,
      actualVolumeKg: number,
    ): Promise<PreOrder | undefined> => {
      const harvest = harvests.find((h) => h.id === harvestId);
      if (!harvest) return undefined;

      const shelfLifeDays =
        COMMODITY_LIST[harvest.commodity]?.shelfLifeDays ?? 14;
      const today = new Date();
      const daysOverdue = Math.max(
        0,
        Math.floor(
          (today.getTime() - new Date(harvest.expectedHarvestDate).getTime()) /
            86_400_000,
        ),
      );

      const shelfLifeScore = Math.round((1 / shelfLifeDays) * 4000);
      const overdueScore = Math.min(40, daysOverdue * 4);
      const volumeScore = Math.min(20, Math.floor(actualVolumeKg / 1000));
      const priorityScore = Math.min(
        100,
        shelfLifeScore + overdueScore + volumeScore,
      );

      const linkedPO = preOrders.find(
        (po) => po.harvestId === harvestId && po.status === "CONFIRMED",
      );

      const newBatch: HarvestBatch = {
        id: `batch-${Date.now()}`,
        plantingId: harvestId,
        farmerId: harvest.farmerId,
        farmerName: harvest.farmerName,
        commodity: harvest.commodity,
        region: harvest.region,
        latitude: harvest.latitude,
        longitude: harvest.longitude,
        preOrderId: linkedPO?.id,
        actualVolumeKg,
        harvestDate: today.toISOString().split("T")[0],
        shelfLifeDays,
        priorityScore,
        status: "READY",
        createdAt: today.toISOString().split("T")[0],
      };

      const updatedBatches = await svcBatchAdd(newBatch);
      const updatedHarvests = await svcHarvestUpdate(harvestId, {
        status: "HARVESTED",
      });
      setHarvestBatches(updatedBatches);
      setHarvests(updatedHarvests);
      showNotification(
        `Batch panen ${harvest.commodity} berhasil dicatat! Skor prioritas: ${priorityScore}`,
        "success",
      );
      return linkedPO;
    },
    [harvests, preOrders, showNotification],
  );

  const updateBatchStatus = useCallback(
    async (batchId: string, status: HarvestBatch["status"]) => {
      const updated = await batchUpdateStatus(batchId, status);
      setHarvestBatches(updated);
      const label =
        status === "IN_TRANSIT"
          ? "sedang dalam pengiriman"
          : status === "DELIVERED"
            ? "sudah sampai tujuan"
            : status === "PICKED_UP_DIRECTLY"
              ? "dijemput langsung pembeli"
              : "diperbarui";
      showNotification(`Status batch diperbarui: ${label}`, "info");
    },
    [showNotification],
  );

  const setDeliveryMode = useCallback(
    async (preOrderId: string, mode: "direct" | "consolidated") => {
      const updated = await preOrderSetDeliveryMode(preOrderId, mode);
      setPreOrders(updated);
      showNotification(
        `Jalur pengiriman diubah ke: ${mode === "direct" ? "Jual Langsung" : "Ikut Konsolidasi"}`,
        "info",
      );
    },
    [showNotification],
  );

  const completePreOrder = useCallback(
    async (preOrderId: string) => {
      const updated = await preOrderComplete(preOrderId);
      setPreOrders(updated);
      showNotification(
        "Pre-Order selesai! Silakan beri ulasan & rating.",
        "success",
      );
    },
    [showNotification],
  );

  return (
    <DataContext.Provider
      value={{
        harvests,
        demands,
        matches,
        preOrders,
        harvestBatches,
        activeUser,
        addHarvest,
        addDemand,
        updateMatchStatus,
        createHarvestBatch,
        updateBatchStatus,
        setDeliveryMode,
        completePreOrder,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextProps => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData harus digunakan di dalam DataProvider");
  return ctx;
};
