/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/components/modals/QAInput.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Modal tanya-jawab AI (rule-based) untuk Dashboard Publik.
 * Kirim pertanyaan → /api/qa → tampilkan jawaban.
 */

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, Loader2 } from "lucide-react";

interface QAInputProps {
  onClose: () => void;
}

interface QAItem {
  question: string;
  answer: string;
}

export const QAInput: React.FC<QAInputProps> = ({ onClose }) => {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    const q = question.trim();
    if (!q || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const json = await res.json();
      setHistory((prev) => [
        ...prev,
        { question: q, answer: json.answer ?? "Maaf, belum bisa menjawab." },
      ]);
      setQuestion("");
    } catch {
      setHistory((prev) => [
        ...prev,
        { question: q, answer: "Terjadi kendala saat memproses pertanyaan." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-nat-border overflow-hidden flex flex-col"
          style={{ maxHeight: "80vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm">Tanya AI (Q&A Data)</h3>
                <p className="text-emerald-100 text-[10px]">
                  Jawab pertanyaan seputar data pangan TaniLink
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat history */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {history.length === 0 && (
              <div className="text-center py-8 text-nat-sage text-xs">
                <Bot className="w-8 h-8 mx-auto mb-2 text-nat-border" />
                Coba tanyakan, misalnya:
                <div className="mt-2 space-y-1">
                  {[
                    "Berapa tonase pangan yang diselamatkan?",
                    "Komoditas apa yang paling banyak?",
                    "Bagaimana tren harga Bawang Merah?",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuestion(s)}
                      className="block w-full text-left px-3 py-1.5 rounded-lg bg-nat-light-cream border border-nat-border text-nat-text hover:bg-nat-cream transition-colors cursor-pointer text-[11px]"
                    >
                      💬 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.map((item, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-end">
                  <div className="bg-emerald-600 text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-xs max-w-[85%]">
                    {item.question}
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-nat-light-cream border border-nat-border px-3.5 py-2 rounded-2xl rounded-bl-sm text-xs text-nat-text max-w-[90%] leading-relaxed whitespace-pre-wrap">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-nat-border bg-white flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAsk();
              }}
              placeholder="Tanyakan data pangan..."
              className="flex-1 bg-nat-light-cream border border-nat-border rounded-xl px-3 py-2.5 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
            />
            <button
              onClick={handleAsk}
              disabled={isLoading || !question.trim()}
              className="flex items-center justify-center gap-1.5 bg-nat-green hover:bg-nat-green-hover disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
