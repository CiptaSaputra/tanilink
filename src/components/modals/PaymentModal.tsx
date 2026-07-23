import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload } from "lucide-react";
import { usePayment } from "../../context/PaymentContext";

interface PaymentModalProps {
  preOrderId: string | null;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  preOrderId,
  onClose,
}) => {
  const { addPaymentConfirmation } = usePayment();
  const [payProofUrl, setPayProofUrl] = useState("");

  return (
    <AnimatePresence>
      {preOrderId && (
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
              <Upload className="w-4 h-4 text-nat-green" />
              Upload Bukti Pembayaran (Opsional)
            </h3>
            <p className="text-[11px] text-nat-sage mb-4">
              Transaksi dilakukan di luar sistem. Upload bukti bayar bersifat
              opsional.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  URL Bukti Transfer
                </label>
                <input
                  type="text"
                  value={payProofUrl}
                  onChange={(e) => setPayProofUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                />
                <p className="text-[9px] text-nat-sage mt-1">
                  Atau kirim bukti bayar langsung lewat chat ke pembeli.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl bg-nat-light-cream text-nat-text text-xs font-bold border border-nat-border hover:bg-nat-cream transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    addPaymentConfirmation(
                      preOrderId,
                      payProofUrl || undefined,
                    );
                    setPayProofUrl("");
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-xl bg-nat-green text-white text-xs font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
