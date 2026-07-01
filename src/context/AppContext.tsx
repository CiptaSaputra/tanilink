/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Role, 
  Harvest, 
  Demand, 
  Match, 
  MatchWeights, 
  Komoditas, 
  COMMODITY_LIST,
  RegionStats,
  PreOrder,
  HarvestBatch
} from '../types';

// Haversine distance helper
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal place
}

// Single match engine scorer
export function scoreMatch(harvest: Harvest, demand: Demand, weights: MatchWeights): Match {
  const distanceKm = calculateDistance(
    harvest.latitude,
    harvest.longitude,
    demand.latitude,
    demand.longitude
  );

  // 1. Distance Score: 100 if within 5km, scales to 0 at 150km
  let distanceScore = 0;
  if (distanceKm <= 5) {
    distanceScore = 100;
  } else if (distanceKm >= 150) {
    distanceScore = 0;
  } else {
    distanceScore = Math.round(100 * (1 - (distanceKm - 5) / 145));
  }

  // 2. Volume Score: Closer ratio is better
  const minVol = Math.min(harvest.expectedVolume, demand.requiredVolume);
  const maxVol = Math.max(harvest.expectedVolume, demand.requiredVolume);
  const volumeScore = maxVol > 0 ? Math.round((minVol / maxVol) * 100) : 0;

  // 3. Price Score: High offer compared to asking price is better
  let priceScore = 0;
  if (demand.offerPrice >= harvest.askingPrice) {
    priceScore = 100; // Fully covers or exceeds asking
  } else {
    const ratio = demand.offerPrice / harvest.askingPrice;
    if (ratio >= 0.6) {
      // Linear scaling down to 60% of asking price
      priceScore = Math.round(((ratio - 0.6) / 0.4) * 100);
    } else {
      priceScore = 0;
    }
  }

  // Total weighted score
  const totalScore = Math.round(
    weights.wLocation * distanceScore +
    weights.wVolume * volumeScore +
    weights.wPrice * priceScore
  );

  return {
    id: `match-${harvest.id}-${demand.id}`,
    harvestId: harvest.id,
    demandId: demand.id,
    score: totalScore,
    distanceKm,
    scoreDetails: {
      distanceScore,
      volumeScore,
      priceScore,
      totalScore,
      distanceKm,
    },
    status: 'PENDING',
    createdAt: new Date().toISOString().split('T')[0],
  };
}

interface AppContextProps {
  harvests: Harvest[];
  demands: Demand[];
  matches: Match[];
  preOrders: PreOrder[];
  harvestBatches: HarvestBatch[];
  weights: MatchWeights;
  activeRole: Role;
  activeUser: {
    PETANI: { id: string; name: string; region: string };
    PEMBELI: { id: string; name: string; region: string };
    PPL: { id: string; name: string; region: string };
  };
  notification: { message: string; type: 'success' | 'warning' | 'info' } | null;
  addHarvest: (harvest: Omit<Harvest, 'id' | 'farmerId' | 'farmerName' | 'status'>) => void;
  addDemand: (demand: Omit<Demand, 'id' | 'buyerId' | 'buyerName' | 'status'>) => void;
  updateMatchStatus: (matchId: string, status: Match['status']) => void;
  updateWeights: (newWeights: MatchWeights) => void;
  setRole: (role: Role) => void;
  showNotification: (message: string, type: 'success' | 'warning' | 'info') => void;
  dismissNotification: () => void;
  resetAllData: () => void;
  createHarvestBatch: (harvestId: string, actualVolumeKg: number) => void;
  updateBatchStatus: (batchId: string, status: HarvestBatch['status']) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

const SEED_HARVESTS: Harvest[] = [
  {
    id: 'h-1',
    farmerId: 'f-1',
    farmerName: 'Pak Joko',
    commodity: 'Bawang Merah',
    landArea: 1.2,
    expectedVolume: 11000,
    askingPrice: 26000,
    latitude: -6.871,
    longitude: 109.042,
    region: 'Brebes',
    plantingDate: '2026-05-10',
    expectedHarvestDate: '2026-07-19',
    status: 'ACTIVE',
    notes: 'Kualitas bawang Brebes asli, bebas hama ulat daun gawang.',
  },
  {
    id: 'h-2',
    farmerId: 'f-2',
    farmerName: 'Ibu Siti',
    commodity: 'Cabai Merah',
    landArea: 0.8,
    expectedVolume: 6200,
    askingPrice: 34000,
    latitude: -7.215,
    longitude: 107.901,
    region: 'Garut',
    plantingDate: '2026-04-15',
    expectedHarvestDate: '2026-07-14',
    status: 'ACTIVE',
    notes: 'Cabai keriting merah segar, siap panen serentak pertengahan bulan.',
  },
  {
    id: 'h-3',
    farmerId: 'f-3',
    farmerName: 'Pak Wayan',
    commodity: 'Tomat',
    landArea: 1.5,
    expectedVolume: 22000,
    askingPrice: 11500,
    latitude: -7.978,
    longitude: 112.632,
    region: 'Malang',
    plantingDate: '2026-04-28',
    expectedHarvestDate: '2026-07-18',
    status: 'ACTIVE',
    notes: 'Tomat jenis servo tebal, tahan simpan lama pascapanen.',
  },
  {
    id: 'h-4',
    farmerId: 'f-4',
    farmerName: 'Pak Ahmad',
    commodity: 'Padi',
    landArea: 2.0,
    expectedVolume: 12000,
    askingPrice: 7200,
    latitude: -6.824,
    longitude: 107.139,
    region: 'Cianjur',
    plantingDate: '2026-03-01',
    expectedHarvestDate: '2026-07-15',
    status: 'ACTIVE',
    notes: 'Padi Ciherang organik premium, bulir penuh pengairan teratur.',
  },
  {
    id: 'h-5',
    farmerId: 'f-5',
    farmerName: 'Ibu Ketut',
    commodity: 'Kentang',
    landArea: 1.0,
    expectedVolume: 17500,
    askingPrice: 14000,
    latitude: -7.942,
    longitude: 112.605,
    region: 'Malang',
    plantingDate: '2026-03-10',
    expectedHarvestDate: '2026-06-28',
    status: 'ACTIVE',
    notes: 'Kentang Granola ukuran sedang-besar, cocok untuk katering industri.',
  },
  {
    id: 'h-6',
    farmerId: 'f-1',
    farmerName: 'Pak Joko',
    commodity: 'Cabai Merah',
    landArea: 0.5,
    expectedVolume: 3800,
    askingPrice: 36000,
    latitude: -6.892,
    longitude: 109.012,
    region: 'Brebes',
    plantingDate: '2026-04-05',
    expectedHarvestDate: '2026-07-04',
    status: 'ACTIVE',
    notes: 'Cabai merah besar, tingkat kematangan rata-rata 85%.',
  },
  {
    id: 'h-7',
    farmerId: 'f-6',
    farmerName: 'Ibu Maimunah',
    commodity: 'Kubis',
    landArea: 0.7,
    expectedVolume: 14000,
    askingPrice: 7500,
    latitude: -7.235,
    longitude: 107.882,
    region: 'Garut',
    plantingDate: '2026-04-10',
    expectedHarvestDate: '2026-07-05',
    status: 'ACTIVE',
    notes: 'Kubis putih padat bulat, panen melimpah tanpa pestisida kimia berlebih.',
  },
  {
    id: 'h-8',
    farmerId: 'f-7',
    farmerName: 'Pak Heru',
    commodity: 'Cabai Merah',
    landArea: 1.1,
    expectedVolume: 8500,
    askingPrice: 33000,
    latitude: -5.412,
    longitude: 105.254,
    region: 'Lampung',
    plantingDate: '2026-04-18',
    expectedHarvestDate: '2026-07-15',
    status: 'ACTIVE',
    notes: 'Hasil panen Cabai Merah Lampung super pedas, bebas bercak daun.',
  },
  {
    id: 'h-9',
    farmerId: 'f-8',
    farmerName: 'Pak Sugeng',
    commodity: 'Bawang Merah',
    landArea: 0.9,
    expectedVolume: 7200,
    askingPrice: 25000,
    latitude: -5.385,
    longitude: 105.291,
    region: 'Lampung',
    plantingDate: '2026-05-12',
    expectedHarvestDate: '2026-07-22',
    status: 'ACTIVE',
    notes: 'Bawang merah Lampung, kadar air rendah, cocok digoreng atau bumbu masakan.',
  }
];

const SEED_DEMANDS: Demand[] = [
  {
    id: 'd-1',
    buyerId: 'b-1',
    buyerName: 'Koperasi Jaya Tani',
    commodity: 'Bawang Merah',
    requiredVolume: 10000,
    offerPrice: 27000,
    latitude: -6.865,
    longitude: 109.035,
    region: 'Brebes',
    dateRequired: '2026-07-25',
    status: 'ACTIVE',
    notes: 'Mencari pasokan stabil untuk dikirim ke pasar induk Kramat Jati.',
  },
  {
    id: 'd-2',
    buyerId: 'b-2',
    buyerName: 'PT Sambal Lestari',
    commodity: 'Cabai Merah',
    requiredVolume: 5000,
    offerPrice: 35000,
    latitude: -7.202,
    longitude: 107.895,
    region: 'Garut',
    dateRequired: '2026-07-16',
    status: 'ACTIVE',
    notes: 'Butuh cabai segar harian untuk mesin produksi sambal botol kami.',
  },
  {
    id: 'd-3',
    buyerId: 'b-3',
    buyerName: 'Prima Fresh Mart Malang',
    commodity: 'Tomat',
    requiredVolume: 20000,
    offerPrice: 12000,
    latitude: -7.962,
    longitude: 112.622,
    region: 'Malang',
    dateRequired: '2026-07-20',
    status: 'ACTIVE',
    notes: 'Menampung tomat servo grade A-B, pengiriman langsung ke depo pusat.',
  },
  {
    id: 'd-4',
    buyerId: 'b-4',
    buyerName: 'BULOG Sub-Divre Cianjur',
    commodity: 'Padi',
    requiredVolume: 15000,
    offerPrice: 7400,
    latitude: -6.812,
    longitude: 107.142,
    region: 'Cianjur',
    dateRequired: '2026-07-18',
    status: 'ACTIVE',
    notes: 'Penyerapan gabah kering giling (GKG) sesuai standar HPP pemerintah.',
  },
  {
    id: 'd-5',
    buyerId: 'b-5',
    buyerName: 'Indofood Industri Malang',
    commodity: 'Kentang',
    requiredVolume: 15000,
    offerPrice: 14500,
    latitude: -7.989,
    longitude: 112.648,
    region: 'Malang',
    dateRequired: '2026-07-02',
    status: 'ACTIVE',
    notes: 'Spesifikasi kentang untuk keripik industri, kadar air rendah.',
  },
  {
    id: 'd-6',
    buyerId: 'b-6',
    buyerName: 'Koperasi Sinar Lampung',
    commodity: 'Cabai Merah',
    requiredVolume: 7000,
    offerPrice: 34000,
    latitude: -5.428,
    longitude: 105.275,
    region: 'Lampung',
    dateRequired: '2026-07-18',
    status: 'ACTIVE',
    notes: 'Membutuhkan cabai merah keriting kualitas prima Lampung untuk dipasok ke industri lokal.',
  }
];

const DEFAULT_WEIGHTS: MatchWeights = {
  wLocation: 0.4, // 40%
  wVolume: 0.3,   // 30%
  wPrice: 0.3,    // 30%
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<Role>(() => {
    const stored = localStorage.getItem('flw_active_role');
    return (stored as Role) || 'PETANI';
  });

  const [weights, setWeights] = useState<MatchWeights>(() => {
    const stored = localStorage.getItem('flw_weights');
    return stored ? JSON.parse(stored) : DEFAULT_WEIGHTS;
  });

  const [harvests, setHarvests] = useState<Harvest[]>(() => {
    const stored = localStorage.getItem('flw_harvests');
    if (stored) {
      const parsed: Harvest[] = JSON.parse(stored);
      // Strip out any auto-generated H-LIVE entries from old simulator
      const cleaned = parsed.filter(h => !h.id.startsWith('H-LIVE-') && !h.id.startsWith('h-live-'));
      // If cleaning removed entries, persist the cleaned version immediately
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('flw_harvests', JSON.stringify(cleaned));
      }
      return cleaned.length > 0 ? cleaned : SEED_HARVESTS;
    }
    return SEED_HARVESTS;
  });

  const [demands, setDemands] = useState<Demand[]>(() => {
    const stored = localStorage.getItem('flw_demands');
    return stored ? JSON.parse(stored) : SEED_DEMANDS;
  });

  const [matches, setMatches] = useState<Match[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>(() => {
    const stored = localStorage.getItem('flw_pre_orders');
    return stored ? JSON.parse(stored) : [];
  });
  const [harvestBatches, setHarvestBatches] = useState<HarvestBatch[]>(() => {
    const stored = localStorage.getItem('flw_harvest_batches');
    return stored ? JSON.parse(stored) : [];
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warning' | 'info' } | null>(null);

  // Active User simulated values based on roles
  const [activeUser] = useState({
    PETANI: { id: 'f-1', name: 'Pak Joko', region: 'Brebes' },
    PEMBELI: { id: 'b-1', name: 'Koperasi Jaya Tani', region: 'Brebes' },
    PPL: { id: 'ppl-1', name: 'Penyuluh Budi Santoso', region: 'Brebes' }
  });

  // Calculate matches dynamically whenever harvests, demands, or weights change
  useEffect(() => {
    const newMatches: Match[] = [];
    
    // Cross-match active harvest with active buyer demand for matching commodities
    harvests.forEach(harvest => {
      if (harvest.status === 'EXPIRED') return;
      
      demands.forEach(demand => {
        if (demand.status === 'CANCELLED') return;
        
        // Match only same commodity
        if (harvest.commodity === demand.commodity) {
          const m = scoreMatch(harvest, demand, weights);
          
          // Check if there is already an action/status for this pair in the previous matches
          const existingMatch = matches.find(prev => prev.id === m.id);
          if (existingMatch) {
            m.status = existingMatch.status; // Preserve user-updated status
          }
          
          newMatches.push(m);
        }
      });
    });

    // Sort matches by highest score
    newMatches.sort((a, b) => b.score - a.score);
    setMatches(newMatches);
  }, [harvests, demands, weights]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('flw_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('flw_weights', JSON.stringify(weights));
  }, [weights]);

  useEffect(() => {
    localStorage.setItem('flw_harvests', JSON.stringify(harvests));
  }, [harvests]);

  useEffect(() => {
    localStorage.setItem('flw_demands', JSON.stringify(demands));
  }, [demands]);

  useEffect(() => {
    localStorage.setItem('flw_pre_orders', JSON.stringify(preOrders));
  }, [preOrders]);

  useEffect(() => {
    localStorage.setItem('flw_harvest_batches', JSON.stringify(harvestBatches));
  }, [harvestBatches]);

  // Real-time dynamic simulator interval disabled to prevent unrequested bot notifications and demands

  const showNotification = (message: string, type: 'success' | 'warning' | 'info') => {
    setNotification({ message, type });
  };

  const dismissNotification = () => {
    setNotification(null);
  };

  const addHarvest = (harvestData: Omit<Harvest, 'id' | 'farmerId' | 'farmerName' | 'status'>) => {
    const source = harvestData.inputSource || 'self';
    const byUserId = harvestData.inputByUserId || activeUser.PETANI.id;
    
    const newHarvest: Harvest = {
      ...harvestData,
      id: `h-${Date.now()}`,
      farmerId: activeUser.PETANI.id,
      farmerName: activeUser.PETANI.name,
      status: 'ACTIVE',
      inputSource: source,
      inputByUserId: byUserId,
    };
    
    setHarvests(prev => [newHarvest, ...prev]);
    showNotification(`Laporan tanam ${harvestData.commodity} berhasil ditambahkan!`, 'success');

    // Mine a transaction block
  };

  const addDemand = (demandData: Omit<Demand, 'id' | 'buyerId' | 'buyerName' | 'status'>) => {
    const newDemand: Demand = {
      ...demandData,
      id: `d-${Date.now()}`,
      buyerId: activeUser.PEMBELI.id,
      buyerName: activeUser.PEMBELI.name,
      status: 'ACTIVE',
    };

    setDemands(prev => [newDemand, ...prev]);
    showNotification(`Permintaan demand untuk ${demandData.commodity} berhasil dipublikasi!`, 'success');

    // Mine a transaction block
  };

  const updateMatchStatus = (matchId: string, status: Match['status']) => {
    setMatches(prev => 
      prev.map(m => {
        if (m.id === matchId) {
          const h = harvests.find(harv => harv.id === m.harvestId);
          const d = demands.find(dem => dem.id === m.demandId);
          const farmer = h ? h.farmerName : 'Petani';
          const buyer = d ? d.buyerName : 'Pembeli';
          const commodity = h ? h.commodity : 'Komoditas';

          // If transaction is fully confirmed, mark the harvest and demand as matched/fulfilled
          if (status === 'CONFIRMED') {
            setHarvests(hs => hs.map(h => h.id === m.harvestId ? { ...h, status: 'MATCHED' } : h));
            setDemands(ds => ds.map(d => d.id === m.demandId ? { ...d, status: 'FULFILLED' } : d));
            
            // Create a PreOrder record upon confirmation
            if (h && d) {
              const newPreOrder: PreOrder = {
                id: `po-${Date.now()}`,
                matchId: m.id,
                harvestId: m.harvestId,
                demandId: m.demandId,
                agreedPricePerKg: d.offerPrice,
                agreedVolumeKg: Math.min(h.expectedVolume, d.requiredVolume),
                farmerName: farmer,
                buyerName: buyer,
                commodity: h.commodity,
                status: 'CONFIRMED',
                createdAt: new Date().toISOString().split('T')[0],
              };
              setPreOrders(prev => [newPreOrder, ...prev]);
            }

            showNotification('Transaksi Berhasil Dikonfirmasi! Hasil panen terselamatkan dari potensi susut.', 'success');
          } else if (status === 'ACCEPTED_BY_FARMER') {
            showNotification('Penawaran disetujui oleh Petani. Menunggu konfirmasi Pembeli.', 'info');
          } else if (status === 'ACCEPTED_BY_BUYER') {
            showNotification('Permintaan pencocokan diajukan ke Petani.', 'info');
          } else if (status === 'DISPUTED') {
            showNotification('Pencocokan dilaporkan mengalami kendala logistik.', 'warning');
          }
          return { ...m, status };
        }
        return m;
      })
    );
  };

  const updateWeights = (newWeights: MatchWeights) => {
    setWeights(newWeights);
    showNotification('Parameter bobot algoritma pencocokan berhasil diperbarui!', 'success');
  };

  const setRole = (role: Role) => {
    setActiveRole(role);
    showNotification(`Beralih peran menjadi: ${role}`, 'info');
  };

  const createHarvestBatch = (harvestId: string, actualVolumeKg: number) => {
    const harvest = harvests.find(h => h.id === harvestId);
    if (!harvest) return;
    
    const commodity = harvest.commodity;
    const shelfLifeDays = COMMODITY_LIST[commodity]?.shelfLifeDays || 14;
    
    // Distribution Priority Score: shelf life decay (shorter = higher priority) + days since planting end
    const today = new Date();
    const expectedHarvest = new Date(harvest.expectedHarvestDate);
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - expectedHarvest.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Score: 40% shelf life urgency + 40% days overdue factor + 20% volume factor
    const shelfLifeScore = Math.round((1 / shelfLifeDays) * 4000); // shorter shelf life = higher score
    const overdueScore = Math.min(40, daysOverdue * 4); // up to 40 pts for overdue
    const volumeScore = Math.min(20, Math.floor(actualVolumeKg / 1000)); // up to 20 pts for volume
    const priorityScore = Math.min(100, shelfLifeScore + overdueScore + volumeScore);

    const linkedPreOrder = preOrders.find(po => po.harvestId === harvestId && po.status === 'CONFIRMED');

    const newBatch: HarvestBatch = {
      id: `batch-${Date.now()}`,
      plantingId: harvestId,
      farmerId: harvest.farmerId,
      farmerName: harvest.farmerName,
      commodity,
      region: harvest.region,
      latitude: harvest.latitude,
      longitude: harvest.longitude,
      preOrderId: linkedPreOrder?.id,
      actualVolumeKg,
      harvestDate: today.toISOString().split('T')[0],
      shelfLifeDays,
      priorityScore,
      status: 'READY',
      createdAt: today.toISOString().split('T')[0],
    };

    setHarvestBatches(prev => [newBatch, ...prev]);

    // Mark the harvest as HARVESTED
    setHarvests(prev => prev.map(h => h.id === harvestId ? { ...h, status: 'HARVESTED' } : h));

    showNotification(`Batch panen ${commodity} berhasil dicatat! Skor prioritas: ${priorityScore}`, 'success');
  };

  const updateBatchStatus = (batchId: string, status: HarvestBatch['status']) => {
    setHarvestBatches(prev => prev.map(b => b.id === batchId ? { ...b, status } : b));
    const statusLabel = status === 'IN_TRANSIT' ? 'sedang dalam pengiriman' : 'sudah sampai tujuan';
    showNotification(`Status batch diperbarui: ${statusLabel}`, 'info');
  };

  const resetAllData = () => {
    setHarvests(SEED_HARVESTS);
    setDemands(SEED_DEMANDS);
    setWeights(DEFAULT_WEIGHTS);
    setPreOrders([]);
    setHarvestBatches([]);
    localStorage.removeItem('flw_harvests');
    localStorage.removeItem('flw_demands');
    localStorage.removeItem('flw_weights');
    localStorage.removeItem('flw_pre_orders');
    localStorage.removeItem('flw_harvest_batches');
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        harvests,
        demands,
        matches,
        preOrders,
        harvestBatches,
        weights,
        activeRole,
        activeUser,
        notification,
        addHarvest,
        addDemand,
        updateMatchStatus,
        updateWeights,
        setRole,
        showNotification,
        dismissNotification,
        resetAllData,
        createHarvestBatch,
        updateBatchStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
