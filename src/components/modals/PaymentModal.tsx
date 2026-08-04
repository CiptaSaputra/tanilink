import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Upload, X, Banknote, ImageIcon, CheckCircle2 } from "lucide-react";
import { usePayment } from "../../context/PaymentContext";
import type { PreOrder } from "../../types";

interface PaymentModalProps {
  preOrderId: string | null;
  preOrder?: PreOrder | null;
  onClose: () => void;
}

const BANKS = [
  "BCA",
  "BRI",
  "Mandiri",
  "BNI",
  "BTN",
  "Bank Syariah Indonesia",
  "Bank Jateng",
  "Lainnya",
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  preOrderId,
  preOrder,
  onClose,
}) => {
  const { addPaymentConfirmation } = usePayment();
  const fileRef = useRef<HTMLInputElement>(null);

  // Hitung total otomatis dari PO
  const totalAmount = preOrder
    ? preOrder.agreedVolumeKg * preOrder.agreedPricePerKg
    : 0;

  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [amount, setAmount] = useState(totalAmount > 0 ? String(totalAmount) : "");
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const [proofDataUrl, setProofDataUrl] = useState<string>("");

  // Update amount kalau preOrder berubah
  useEffect(() => {
    if (totalAmount > 0) setAmount(String(totalAmount));
  }, [totalAmount]);

  // Baca file foto → base64 data URL
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("File harus berupa gambar.");
      return;
    }
    // Batasi ukuran ±2MB agar tidak membebani DB
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProofDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!bankName || !accountNumber || !accountName) {
      alert("Bank, No. Rekening, dan Atas Nama wajib diisi.");
      return;
    }
    if (!proofDataUrl) {
      alert("Mohon upload foto bukti transfer.");
      return;
    }
    addPaymentConfirmation(preOrderId!, {
      proofImageUrl: proofDataUrl,
      notes: notes || undefined,
      bankName,
      accountNumber,
      accountName,
      amount: amount ? Number(amount) : undefined,
      paidAt: paidAt || undefined,
    });
    // Reset & tutup
    setBankName("");
    setAccountNumber("");
    setAccountName("");
    setAmount("");
    setPaidAt("");
    setNotes("");
    setProofDataUrl("");
    onClose();
  };

  return createPortal(
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
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-nat-border max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-sm font-bold text-nat-dark flex items-center gap-2">
                <Banknote className="w-4 h-4 text-nat-green" />
                Konfirmasi Transfer
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-nat-light-cream transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-nat-sage" />
              </button>
            </div>
            <p className="text-[11px] text-nat-sage mb-4">
              Lengkapi detail transfer ke rekening petani. Pembeli melakukan
              transfer di luar sistem, lalu verifikasi oleh petani.
            </p>

            {/* Info PO — otomatis dari kesepakatan */}
            {preOrder && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4 space-y-1">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Detail PO yang harus dibayar
                </p>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-emerald-700">
                  <span>Komoditas: <b>{preOrder.commodity}</b></span>
                  <span>Volume: <b>{preOrder.agreedVolumeKg.toLocaleString("id-ID")} Kg</b></span>
                  <span>Harga/Kg: <b>Rp{preOrder.agreedPricePerKg.toLocaleString("id-ID")}</b></span>
                  <span>Total: <b className="text-emerald-900">Rp{totalAmount.toLocaleString("id-ID")}</b></span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {/* Foto bukti */}
              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Foto Bukti Transfer <span className="text-red-500">*</span>
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
                {proofDataUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-nat-border">
                    <img
                      src={proofDataUrl}
                      alt="Bukti transfer"
                      className="w-full h-40 object-cover"
                    />
                    <button
                      onClick={() => {
                        setProofDataUrl("");
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg hover:bg-red-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-nat-border rounded-xl py-6 flex flex-col items-center gap-2 text-nat-sage hover:border-nat-green hover:text-nat-green transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs font-semibold">
                      Klik untuk upload foto bukti
                    </span>
                    <span className="text-[10px]">(JPG/PNG, maks 2MB)</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Bank Tujuan <span className="text-red-500">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                >
                  <option value="">Pilih bank...</option>
                  {BANKS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  No. Rekening Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="1234567890"
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Atas Nama Rekening <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Nama pemilik rekening petani"
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-nat-text mb-1">
                    Nominal (Rp) {preOrder && <span className="text-emerald-600 font-normal">(otomatis dari PO)</span>}
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="8000000"
                    className={`w-full border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green ${
                      preOrder ? "bg-emerald-50 font-bold" : "bg-nat-light-cream"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-nat-text mb-1">
                    Tanggal Transfer
                  </label>
                  <input
                    type="date"
                    value={paidAt}
                    onChange={(e) => setPaidAt(e.target.value)}
                    className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Catatan (opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Mis. Transfer dari BCA ke BRI, nominal sesuai PO"
                  rows={2}
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl bg-nat-light-cream text-nat-text text-xs font-bold border border-nat-border hover:bg-nat-cream transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-2 rounded-xl bg-nat-green text-white text-xs font-bold hover:bg-nat-green-hover transition-colors shadow-sm cursor-pointer"
                >
                  Kirim Bukti
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
