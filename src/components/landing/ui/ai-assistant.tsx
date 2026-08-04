"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, X, Loader2, MessageCircle, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  text: string;
  isUser: boolean;
}

const TaniLinkResponses: Record<string, string> = {
  harga: "Di TaniLink, harga disepakati sebelum tanam selesai - bukan di hari panen. Petani punya kepastian harga sejak awal musim.",
  panen: "Sistem kami prediksi jadwal panen otomatis dari data BMKG. Pembeli sudah disiapkan sebelum panen tiba.",
  penyakit: "Foto daun tanamanmu, AI kami kenali penyakit dalam detik. Tangani sebelum menyebar ke seluruh lahan.",
  pembeli: "TaniLink menghubungkan petani dengan 1.000+ pembeli terverifikasi. Purchase Order bisa dikunci jauh sebelum panen.",
  daftar: "Daftar gratis untuk petani mikro! Cukup 5 menit dari HP. Klik tombol 'Daftar sebagai Petani' di halaman ini.",
  pengiriman: "Rute pengiriman dioptimalkan otomatis. Hasil panen tiba tepat waktu dengan biaya angkut lebih hemat.",
  transaksi: "Setiap transaksi tercatat di hash-chain ledger - transparan, permanen, tidak bisa dimanipulasi siapapun.",
  bmkg: "Data cuaca real-time dari BMKG diintegrasikan langsung ke platform untuk prediksi panen yang akurat.",
  gratis: "TaniLink gratis selamanya untuk petani mikro. Kami percaya teknologi seharusnya berpihak pada petani kecil.",
  hello: "Halo! Saya asisten TaniLink. Tanyakan apa saja tentang platform kami - harga, panen, teknologi, atau cara daftar.",
  hai: "Hai! Ada yang bisa saya bantu? Tanyakan soal TaniLink - cara kerja, fitur, atau cara mendaftar.",
  halo: "Halo! Saya asisten TaniLink. Tanyakan apa saja tentang platform kami - harga, panen, teknologi, atau cara daftar.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, response] of Object.entries(TaniLinkResponses)) {
    if (lower.includes(key)) return response;
  }
  return "Terima kasih sudah bertanya! Untuk info lebih lengkap, silakan hubungi kami di hello@tanilink.id atau klik tombol daftar di halaman ini.";
}

export function TanilinkChatbot() {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Greeting on open
  useEffect(() => {
    if (open && messages.length === 0) {
      setTimeout(() => {
        setMessages([{
          text: "Halo! Saya asisten TaniLink 🌱 Tanyakan apa saja — soal harga, panen, cara daftar, atau fitur platform kami.",
          isUser: false,
        }]);
      }, 400);
    }
  }, [open]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { text: userMsg, isUser: true }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { text: getResponse(userMsg), isUser: false }]);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="
              w-[calc(100vw-2rem)] max-w-[380px]
              sm:w-[380px]
              h-[70vh] max-h-[520px] min-h-[400px]
              bg-gradient-to-br from-slate-900 to-[#0d1f12]
              rounded-2xl overflow-hidden shadow-2xl border border-green-900/40 flex flex-col
            "
          >
            {/* Header */}
            <div className="bg-green-900/40 backdrop-blur-sm px-4 py-3 border-b border-green-800/30 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
                  <Leaf className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">TaniLink Assistant</p>
                  <p className="text-green-400 text-[11px] mt-0.5">Online · Siap membantu</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-green-300 hover:text-white transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Sparkles className="w-10 h-10 text-green-500 mb-3" />
                  <p className="text-green-200 text-sm font-medium">Ada yang bisa dibantu?</p>
                  <p className="text-green-500/60 text-xs mt-1 max-w-[200px]">Tanyakan soal TaniLink, harga, panen, atau cara daftar</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                    >
                      {!msg.isUser && (
                        <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                          <Leaf className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.isUser
                            ? "bg-green-600 text-white rounded-tr-sm"
                            : "bg-slate-700/60 text-slate-100 border border-slate-600/40 rounded-tl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center shrink-0 mr-2 mt-0.5">
                        <Leaf className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-slate-700/60 border border-slate-600/40 rounded-2xl rounded-tl-sm px-4 py-3">
                        <div className="flex gap-1.5 items-center">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Suggested questions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap shrink-0">
                {["Cara daftar?", "Soal harga", "Deteksi penyakit"].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      setTimeout(() => handleSubmit(), 50);
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-full bg-green-900/40 border border-green-700/40 text-green-300 hover:bg-green-800/50 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={handleSubmit}
              className={`px-3 py-3 border-t shrink-0 transition-colors duration-200 ${
                isFocused ? "border-green-700/60 bg-slate-800/80" : "border-slate-700/40 bg-slate-800/30"
              }`}
            >
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Tulis pertanyaanmu..."
                  className="w-full bg-slate-700/50 border border-slate-600/40 rounded-full py-2.5 pl-4 pr-12 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-green-600/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className={`absolute right-1 rounded-full p-2 transition-colors ${
                    !input.trim() || isTyping
                      ? "text-slate-500 bg-slate-700/50 cursor-not-allowed"
                      : "text-white bg-green-600 hover:bg-green-500"
                  }`}
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubble button */}
      <motion.button
        onClick={() => {
          setOpen((prev) => !prev);
          setHasOpened(true);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 text-white shadow-xl flex items-center justify-center transition-colors"
        aria-label="Buka asisten TaniLink"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ping indicator */}
        {!open && !hasOpened && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#E3A73A] border-2 border-white">
            <span className="absolute inset-0 rounded-full bg-[#E3A73A] animate-ping opacity-75" />
          </span>
        )}
      </motion.button>
    </div>
  );
}
