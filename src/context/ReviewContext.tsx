/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/ReviewContext.tsx
 * ────────────────────────────────
 * Reviews and ratings.
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Review } from '../types';
import { reviewGetAll, reviewAdd, reviewClear } from '../services';
import { useUI } from './UIContext';

interface ReviewContextProps {
  reviews:   Review[];
  addReview: (preOrderId: string, reviewerUserId: string, revieweeUserId: string, rating: number, comment?: string) => void;
}

const ReviewContext = createContext<ReviewContextProps | undefined>(undefined);

export const ReviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reviews, setReviews] = useState<Review[]>(() => reviewGetAll());
  const { showNotification } = useUI();

  const addReview = useCallback(
    (preOrderId: string, reviewerUserId: string, revieweeUserId: string, rating: number, comment?: string) => {
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
    },
    [showNotification]
  );

  return (
    <ReviewContext.Provider value={{ reviews, addReview }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReview = (): ReviewContextProps => {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error('useReview harus digunakan di dalam ReviewProvider');
  return ctx;
};
