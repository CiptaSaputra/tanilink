/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/components/modals/SellerRatingModal.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Modal yang menampilkan rating seorang penjual (petani): rata-rata, jumlah
 * ulasan, distribusi bintang, dan daftar ulasan per transaksi.
 */

"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Star, X } from "lucide-react";
import { useReview } from "../../context/ReviewContext";
import { getSellerRating } from "../../utils/rating";

interface SellerRatingModalProps {
  sellerName: string;
  sellerUserId: string;
  onClose: () => void;
}

export const SellerRatingModal: React.FC<SellerRatingModalProps> = ({
  sellerName,
  sellerUserId,
  onClose,
}) => {
  const { reviews } = useReview();
  const rating = getSellerRating(reviews, sellerUserId);
  const myReviews = reviews
    .filter((r) => r.revieweeUserId === sellerUserId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return createPortal(
    <AnimatePresence>
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
          className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-nat-border max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-nat-dark flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                Rating {sellerName}
              </h3>
              <p className="text-[11px] text-nat-sage mt-0.5">
                Reputasi penjual berdasarkan ulasan transaksi
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-nat-light-cream transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-nat-sage" />
            </button>
          </div>

          {rating.average > 0 ? (
            <div className="overflow-y-auto flex-1 space-y-4">
              {/* Ringkasan */}
              <div className="flex items-center gap-5 bg-nat-light-cream/60 border border-nat-border rounded-xl p-4">
                <div className="text-center">
                  <p className="text-4xl font-black text-nat-dark">
                    {rating.average.toFixed(1)}
                  </p>
                  <div className="flex items-center gap-0.5 justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className="w-3.5 h-3.5"
                        fill={s <= Math.round(rating.average) ? "#A67C52" : "none"}
                        stroke={s <= Math.round(rating.average) ? "#A67C52" : "#ccc"}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-nat-sage mt-1">
                    {rating.count} ulasan
                  </p>
                </div>

                {/* Distribusi bintang */}
                <div className="flex-1 space-y-1.5">
                  {rating.distribution.map((d) => (
                    <div key={d.stars} className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-nat-sage w-3">
                        {d.stars}
                      </span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-1.5 bg-nat-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-nat-sage w-8 text-right">
                        {d.pct}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daftar ulasan */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-nat-sage uppercase tracking-wider">
                  Ulasan Terbaru
                </p>
                {myReviews.map((r) => (
                  <div
                    key={r.id}
                    className="border border-nat-border rounded-xl p-3 bg-white"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className="w-3 h-3"
                            fill={s <= r.rating ? "#A67C52" : "none"}
                            stroke={s <= r.rating ? "#A67C52" : "#ccc"}
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-nat-sage">
                        {r.createdAt}
                      </span>
                    </div>
                    {r.comment && (
                      <p className="text-[11px] text-nat-text leading-relaxed">
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <Star className="w-10 h-10 text-nat-border mx-auto mb-3" />
              <p className="text-sm font-bold text-nat-dark">
                Belum Ada Ulasan
              </p>
              <p className="text-xs text-nat-sage mt-1">
                Penjual ini belum menerima rating. Rating muncul setelah
                transaksi selesai.
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
};
