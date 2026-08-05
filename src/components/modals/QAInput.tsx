/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/components/modals/QAInput.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Modal tanya-jawab AI untuk Dashboard Publik.
 * - Kirim pertanyaan → /api/qa → tampilkan jawaban
 * - Suggestion chips: tampilkan 3 pertanyaan lanjutan relevan setelah tiap jawaban
 * - Multi-turn: history percakapan dikirim ke API untuk konteks
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, Loader2, Sparkles } from "lucide-react";

interface QAInputProps {
  onClose: () => void;
}

interface QAItem {
  question: string;
  answer: string;
  suggestions?: string[];
}

export const QAInput: React.FC<QAInputProps> = ({ onClose }) => {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QAItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat history bertambah
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isLoading]);

  const sendQuestion = async (q: string) => {
    if (!q.trim() || isLoading) return;
    const trimmed = q.trim();
    setIsLoading(true);
    setQuestion("");
    try {
      // Kirim maks 6 exchange terakhir sebagai konteks
      const recentHistory = history.slice(-6).map(({ question, answer }) => ({
        question,
        answer,
      }));
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed, history: recentHistory }),
      });
      const json = await res.json();
      setHistory((prev) => [
        ...prev,
        {
          question: trimmed,
          answer: json.answer ?? "Maaf, belum bisa menjawab.",
          suggestions: json.suggestions ?? [],
        },
      ]);
    } catch {
      setHistory((prev) => [
        ...prev,
        { question: trimmed, answer: "Terjadi kendala saat memproses pertanyaan." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAsk = () => sendQuestion(question);

  const handleSuggestionClick = (s: string) => sendQuestion(s);

  const INITIAL_SUGGESTIONS = [
    "Berapa tonase pangan yang diselamatkan?",
    "Komoditas apa yang paling banyak?",
    "Bagaimana tren harga Bawang Merah?",
  ];

  return createPortal(
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
          style={{ maxHeight: "82vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex-shrink-0">
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

          {/* Chat area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {/* Empty state dengan suggestion awal */}
            {history.length === 0 && !isLoading && (
              <div className="text-center py-6 text-nat-sage text-xs">
                <Bot className="w-8 h-8 mx-auto mb-2 text-nat-border" />
                <p className="mb-3 text-nat-text font-medium">Tanyakan seputar data TaniLink</p>
                <div className="space-y-2">
                  {INITIAL_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestionClick(s)}
                      disabled={isLoading}
                      className="block w-full text-left px-3 py-2 rounded-xl bg-nat-light-cream border border-nat-border text-nat-text hover:bg-emerald-50 hover:border-emerald-300 transition-all cursor-pointer text-[11px] font-medium"
                    >
                      💬 {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat history */}
            {history.map((item, idx) => {
              const isLast = idx === history.length - 1;
              return (
                <div key={idx} className="space-y-2">
                  {/* Pertanyaan user */}
                  <div className="flex justify-end">
                    <div className="bg-emerald-600 text-white px-3.5 py-2 rounded-2xl rounded-br-sm text-xs max-w-[85%] font-medium">
                      {item.question}
                    </div>
                  </div>

                  {/* Jawaban AI */}
                  <div className="flex justify-start">
                    <div className="bg-nat-light-cream border border-nat-border px-3.5 py-2.5 rounded-2xl rounded-bl-sm text-xs text-nat-text max-w-[90%] leading-relaxed whitespace-pre-wrap">
                      {item.answer}
                    </div>
                  </div>

                  {/* Suggestion chips — hanya untuk pesan terakhir */}
                  {isLast && item.suggestions && item.suggestions.length > 0 && !isLoading && (
                    <div className="flex flex-wrap gap-1.5 pl-1 pt-0.5">
                      <div className="flex items-center gap-1 text-[9px] text-nat-sage font-medium w-full mb-0.5">
                        <Sparkles className="w-3 h-3 text-emerald-500" />
                        <span>Tanya lebih lanjut:</span>
                      </div>
                      {item.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestionClick(s)}
                          disabled={isLoading}
                          className="px-2.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] font-medium hover:bg-emerald-100 hover:border-emerald-400 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-nat-light-cream border border-nat-border px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span className="text-[11px] text-nat-sage">AI sedang menjawab...</span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-nat-border bg-white flex gap-2 flex-shrink-0">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) handleAsk();
              }}
              placeholder="Tanyakan data pangan..."
              disabled={isLoading}
              className="flex-1 bg-nat-light-cream border border-nat-border rounded-xl px-3 py-2.5 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green disabled:opacity-60"
            />
            <button
              onClick={handleAsk}
              disabled={isLoading || !question.trim()}
              className="flex items-center justify-center gap-1.5 bg-nat-green hover:bg-nat-green-hover disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
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
    </AnimatePresence>,
    document.body,
  );
};
