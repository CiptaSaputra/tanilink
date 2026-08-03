import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { Star } from "lucide-react";
import { useReview } from "../../context/ReviewContext";

interface ReviewModalProps {
  preOrderId: string | null;
  reviewerUserId: string;
  revieweeUserId: string;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  preOrderId,
  reviewerUserId,
  revieweeUserId,
  onClose,
}) => {
  const { addReview } = useReview();
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

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
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-nat-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-nat-dark mb-1 flex items-center gap-2">
              <Star className="w-4 h-4 text-nat-brown" />
              Ulasan & Rating
            </h3>
            <p className="text-[11px] text-nat-sage mb-4">
              Beri penilaian setelah transaksi selesai.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={`p-1 cursor-pointer ${star <= reviewRating ? "text-nat-brown" : "text-nat-border"}`}
                  >
                    <Star
                      className="w-6 h-6"
                      fill={star <= reviewRating ? "#A67C52" : "none"}
                    />
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-bold text-nat-text mb-1">
                  Komentar
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Kesan Anda..."
                  rows={2}
                  className="w-full bg-nat-light-cream border border-nat-border rounded-lg px-3 py-2 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 rounded-xl bg-nat-light-cream text-nat-text text-xs font-bold border border-nat-border hover:bg-nat-cream transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    addReview(
                      preOrderId,
                      reviewerUserId,
                      revieweeUserId,
                      reviewRating,
                      reviewComment || undefined,
                    );
                    setReviewRating(5);
                    setReviewComment("");
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-xl bg-nat-brown text-white text-xs font-bold hover:opacity-90 transition-colors shadow-sm cursor-pointer"
                >
                  Kirim Ulasan
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
