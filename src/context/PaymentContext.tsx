/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/PaymentContext.tsx
 * ────────────────────────────────
 * Payment confirmations.
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { PaymentConfirmation } from "../types";
import {
  paymentGetAll,
  paymentUpsertByPreOrder,
  paymentConfirm,
  paymentClear,
} from "../services";
import { useUI } from "./UIContext";

interface PaymentContextProps {
  paymentConfirmations: PaymentConfirmation[];
  addPaymentConfirmation: (
    preOrderId: string,
    proofImageUrl?: string,
    notes?: string,
  ) => Promise<void>;
  confirmPayment: (paymentId: string) => Promise<void>;
}

const PaymentContext = createContext<PaymentContextProps | undefined>(
  undefined,
);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [paymentConfirmations, setPaymentConfirmations] = useState<
    PaymentConfirmation[]
  >([]);

  React.useEffect(() => {
    paymentGetAll().then(setPaymentConfirmations);
  }, []);
  const { showNotification } = useUI();

  const addPaymentConfirmation = useCallback(
    async (preOrderId: string, proofImageUrl?: string, notes?: string) => {
      const updated = await paymentUpsertByPreOrder(
        preOrderId,
        proofImageUrl,
        notes,
      );
      setPaymentConfirmations(updated);
      showNotification(
        "Bukti pembayaran berhasil diunggah (opsional).",
        "success",
      );
    },
    [showNotification],
  );

  const confirmPayment = useCallback(
    async (paymentId: string) => {
      const updated = await paymentConfirm(paymentId);
      setPaymentConfirmations(updated);
      showNotification("Pembayaran telah dikonfirmasi!", "success");
    },
    [showNotification],
  );

  return (
    <PaymentContext.Provider
      value={{ paymentConfirmations, addPaymentConfirmation, confirmPayment }}
    >
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextProps => {
  const ctx = useContext(PaymentContext);
  if (!ctx)
    throw new Error("usePayment harus digunakan di dalam PaymentProvider");
  return ctx;
};
