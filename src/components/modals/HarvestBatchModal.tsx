import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { COMMODITY_LIST } from '../../constants/commodities';

interface HarvestBatchModalProps {
  harvestingId: string | null;
  onClose: () => void;
}

export const HarvestBatchModal: React.FC<HarvestBatchModalProps> = ({ harvestingId, onClose }) => {
  const { harvests, createHarvestBatch } = useData();
  const [actualVolume, setActualVolume] = useState<number>(0);

  const h = harvestingId ? harvests.find(x => x.id === harvestingId) : null;
  const crop = h ? COMMODITY_LIST[h.commodity] : null;

  return (
    <AnimatePresence>
      {harvestingId && h && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-nat-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-nat-dark mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-nat-green" />
              Buat Batch Distribusi
            </h3>
            <p className="text-[11px] text-nat-sage mb-4">
              Konfirmasi volume aktual panen. Sistem akan menghitung skor prioritas distribusi.
            </p>
            <div className="space-y-4">
              <div className="bg-nat-light-cream rounded-xl p-3 border border-nat-border text-xs text-nat-text">
                <p className="font-bold text-nat-dark">{h.commodity} — {h.farmerName}</p>
                <p className="text-nat-sage mt-0.5">Estimasi: {h.expectedVolume.toLocaleString('id-ID')} Kg | Umur Simpan: {crop?.shelfLifeDays} hari</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">Volume Aktual (Kg)</label>
                <input
                  type="number"
                  min="1"
                  value={actualVolume || ''}
                  onChange={(e) => setActualVolume(parseInt(e.target.value) || 0)}
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-sm font-bold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="flex-1 py-2 rounded-xl bg-nat-light-cream text-nat-text text-xs font-bold border border-nat-border hover:bg-nat-cream transition-colors cursor-pointer">Batal</button>
                <button
                  onClick={() => {
                    if (harvestingId && actualVolume > 0) {
                      createHarvestBatch(harvestingId, actualVolume);
                      setActualVolume(0);
                      onClose();
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-nat-green text-white text-xs font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer"
                >
                  Konfirmasi Siap Kirim
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
