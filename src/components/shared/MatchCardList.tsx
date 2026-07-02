import React from 'react';
import { motion } from 'motion/react';
import { ArrowRightLeft, BadgePercent } from 'lucide-react';
import { COMMODITY_LIST } from '../../constants/commodities';
import type { Match, Harvest, Demand } from '../../types';

interface MatchCardListProps {
  matches: Match[];
  harvests: Harvest[];
  demands: Demand[];
  userRole: 'PETANI' | 'PEMBELI';
  onUpdateMatchStatus: (matchId: string, status: Match['status']) => void;
  onOpenChat: (matchId: string, peerId: string, peerName: string) => void;
}

export const MatchCardList: React.FC<MatchCardListProps> = ({
  matches, harvests, demands, userRole, onUpdateMatchStatus, onOpenChat
}) => {
  return (
    <div className="bg-white rounded-2xl border border-nat-border p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-nat-light-cream">
        <h3 className="text-sm font-bold text-nat-dark flex items-center gap-1.5">
          <ArrowRightLeft className="w-4 h-4 text-nat-green" />
          {userRole === 'PETANI' ? 'Rekomendasi Pembeli Terdekat (Skor Match Cerdas)' : 'Rekomendasi Petani Terdekat (Skor Match Cerdas)'}
        </h3>
        <span className="text-[10px] bg-nat-light-cream text-nat-green border border-nat-border font-bold px-2.5 py-0.5 rounded-full">
          {matches.length} Penawaran Cocok
        </span>
      </div>

      {matches.length > 0 ? (
        <div className="space-y-4">
          {matches.map((match) => {
            const harvest = harvests.find(h => h.id === match.harvestId);
            const demand = demands.find(d => d.id === match.demandId);
            if (!harvest || !demand) return null;
            
            const peerName = userRole === 'PETANI' ? demand.buyerName : harvest.farmerName;
            const peerId = userRole === 'PETANI' ? demand.buyerId : harvest.farmerId;
            const peerRegion = userRole === 'PETANI' ? demand.region : harvest.region;

            return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                key={match.id} 
                className={`border rounded-xl p-4 transition-all ${
                  match.status !== 'PENDING'
                    ? 'border-nat-border bg-nat-light-cream/40'
                    : 'border-nat-border hover:border-nat-sage/50 bg-white hover:shadow-sm'
                }`}
              >
                {/* Match header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: COMMODITY_LIST[harvest.commodity]?.color }} />
                    <h4 className="text-xs font-bold text-nat-dark">{peerName}</h4>
                    <span className="text-[10px] text-nat-sage font-medium">• Wilayah: {peerRegion}</span>
                  </div>

                  {/* Matching Score Circle Badge */}
                  <div className="flex items-center space-x-1">
                    <BadgePercent className="w-3.5 h-3.5 text-nat-green" />
                    <span className="text-xs font-bold text-nat-sage">Kecocokan: </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                      match.score >= 80 
                        ? 'bg-nat-green text-white border-transparent' 
                        : match.score >= 60
                        ? 'bg-nat-cream text-nat-brown border-nat-border'
                        : 'bg-nat-slate text-nat-text border-nat-border'
                    }`}>
                      {match.score}%
                    </span>
                  </div>
                </div>

                {/* Matching breakdown criteria */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-nat-light-cream p-2.5 rounded-lg text-[11px] mb-3 text-nat-text border border-nat-border">
                  {/* 1. Jarak */}
                  <div>
                    <p className="text-nat-sage font-bold uppercase text-[9px]">Jarak Logistik</p>
                    <p className="font-bold text-nat-dark mt-0.5">{match.distanceKm} Km</p>
                    <div className="w-full bg-nat-cream h-1 rounded-full mt-1 overflow-hidden">
                      <div className="bg-nat-green h-full rounded-full" style={{ width: `${match.scoreDetails.distanceScore}%` }} />
                    </div>
                  </div>
                  {/* 2. Harga */}
                  <div>
                    <p className="text-nat-sage font-bold uppercase text-[9px]">Selisih Harga</p>
                    <p className="font-bold text-nat-dark mt-0.5">Rp{Math.abs(demand.offerPrice - harvest.askingPrice).toLocaleString('id-ID')}/Kg</p>
                    <div className="w-full bg-nat-cream h-1 rounded-full mt-1 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${match.scoreDetails.priceScore}%` }} />
                    </div>
                  </div>
                  {/* 3. Kesesuaian Volume */}
                  <div>
                    <p className="text-nat-sage font-bold uppercase text-[9px]">Kesesuaian Volume</p>
                    <p className="font-bold text-nat-dark mt-0.5 text-xs">
                      {Math.round(match.scoreDetails.volumeScore)}% cocok
                    </p>
                    <div className="w-full bg-nat-cream h-1 rounded-full mt-1 overflow-hidden">
                      <div className="bg-nat-brown h-full rounded-full" style={{ width: `${match.scoreDetails.volumeScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-4">
                  <div className="text-[10px] text-nat-sage font-bold uppercase">
                    Status: <span className={
                      match.status === 'ACCEPTED_BY_FARMER' || match.status === 'ACCEPTED_BY_BUYER' ? 'text-nat-green'
                      : match.status === 'PENDING' ? 'text-amber-500'
                      : 'text-nat-dark'
                    }>{match.status === 'ACCEPTED_BY_FARMER' ? 'DITERIMA PETANI' : match.status === 'ACCEPTED_BY_BUYER' ? 'DITERIMA PEMBELI' : match.status}</span>
                  </div>

                  {match.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onUpdateMatchStatus(match.id, 'DISPUTED')}
                        className="px-4 py-2 rounded-xl bg-nat-light-cream text-nat-text text-[11px] font-bold border border-nat-border hover:bg-nat-cream transition-colors cursor-pointer"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => onUpdateMatchStatus(match.id, userRole === 'PETANI' ? 'ACCEPTED_BY_FARMER' : 'ACCEPTED_BY_BUYER')}
                        className="px-4 py-2 rounded-xl bg-nat-green text-white text-[11px] font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer"
                      >
                        Terima & Lanjut Pre-Order
                      </button>
                    </div>
                  ) : match.status === 'ACCEPTED_BY_FARMER' || match.status === 'ACCEPTED_BY_BUYER' ? (
                    <button 
                      onClick={() => onOpenChat(match.id, peerId, peerName)}
                      className="px-4 py-2 rounded-xl bg-nat-brown text-white text-[11px] font-bold hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                    >
                      Buka Ruang Negosiasi (Chat)
                    </button>
                  ) : null}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-nat-sage italic text-xs">
          Belum ada {userRole === 'PETANI' ? 'pembeli' : 'petani'} yang cocok.
        </div>
      )}
    </div>
  );
};
