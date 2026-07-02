/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/PaymentContext.tsx
 * ────────────────────────────────
 * Payment confirmations.
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { PaymentConfirmation } from '../types';
import {
  paymentGetAll, paymentUpsertByPreOrder, paymentConfirm, paymentClear,
} from '../services';
import { useUI } from './UIContext';

interface PaymentContextProps {
  paymentConfirmations: PaymentConfirmation[];
  addPaymentConfirmation: (preOrderId: string, proofImageUrl?: string, notes?: string) => void;
  confirmPayment: (paymentId: string) => void;
}

const PaymentContext = createContext<PaymentContextProps | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [paymentConfirmations, setPaymentConfirmations] = useState<PaymentConfirmation[]>(() => paymentGetAll());
  const { showNotification } = useUI();

  const addPaymentConfirmation = useCallback((preOrderId: string, proofImageUrl?: string, notes?: string) => {
    setPaymentConfirmations(paymentUpsertByPreOrder(preOrderId, proofImageUrl, notes));
    showNotification('Bukti pembayaran berhasil diunggah (opsional).', 'success');
  }, [showNotification]);

  const confirmPayment = useCallback((paymentId: string) => {
    setPaymentConfirmations(paymentConfirm(paymentId));
    showNotification('Pembayaran telah dikonfirmasi!', 'success');
  }, [showNotification]);

  return (
    <PaymentContext.Provider value={{ paymentConfirmations, addPaymentConfirmation, confirmPayment }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextProps => {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayment harus digunakan di dalam PaymentProvider');
  return ctx;
};
