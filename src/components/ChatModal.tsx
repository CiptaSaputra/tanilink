/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";
import { Message, Conversation } from "../types";
import { X, Send, MessageSquare, Phone } from "lucide-react";

interface ChatModalProps {
  matchId: string;
  farmerUserId: string;
  farmerName: string;
  buyerUserId: string;
  buyerName: string;
  currentUserId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({
  matchId,
  farmerUserId,
  farmerName,
  buyerUserId,
  buyerName,
  currentUserId,
  isOpen,
  onClose,
}: ChatModalProps) {
  const { conversations, messages, sendMessage, startConversation } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const existing = conversations.find((c) => c.matchId === matchId);
    if (existing) {
      setConversationId(existing.id);
    } else if (!conversationId) {
      startConversation(matchId, farmerUserId, buyerUserId)
        .then(setConversationId)
        .catch(console.error);
    }
  }, [
    matchId,
    conversations,
    farmerUserId,
    buyerUserId,
    startConversation,
    isOpen,
    conversationId,
  ]);

  // Get messages for this conversation
  const chatMessages = conversationId
    ? messages.filter((m) => m.conversationId === conversationId)
    : [];

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || !conversationId) return;
    sendMessage(conversationId, currentUserId, newMessage.trim());
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl border border-nat-border flex flex-col h-[85vh] sm:h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-nat-light-cream bg-gradient-to-r from-nat-dark to-nat-green rounded-t-none sm:rounded-t-2xl text-white">
          <div className="flex items-center gap-2.5">
            {/* Avatar lawan bicara */}
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold border border-white/30 shadow-sm">
              {(currentUserId === farmerUserId ? buyerName : farmerName)
                .split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold">Chat Negosiasi</p>
              <p className="text-[10px] text-nat-light-cream flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                {currentUserId === farmerUserId ? buyerName : farmerName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-nat-light-cream/30">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-nat-sage">
              <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-bold">Belum ada pesan</p>
              <p className="text-[11px] mt-1">
                Mulai negosiasi harga, volume, atau jadwal pengiriman.
              </p>
            </div>
          ) : (
          chatMessages.map((msg) => {
              const isMine = msg.senderUserId === currentUserId;
              const isFromFarmer = msg.senderUserId === farmerUserId;
              const senderName = isFromFarmer ? farmerName : buyerName;
              const initials = senderName
                .split(" ")
                .map((w) => w[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();
              const avatarColor = isFromFarmer
                ? "bg-nat-green"
                : "bg-nat-brown";

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  {!isMine && (
                    <div className={`w-7 h-7 rounded-full ${avatarColor} flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm`}>
                      {initials}
                    </div>
                  )}

                  <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
                    {/* Sender name — hanya tampil jika bukan saya */}
                    {!isMine && (
                      <span className="text-[10px] text-nat-sage font-semibold px-1">
                        {senderName}
                      </span>
                    )}
                    <div
                      className={`px-3 py-2 rounded-2xl text-xs shadow-sm ${
                        isMine
                          ? "bg-nat-green text-white rounded-br-sm"
                          : "bg-white text-nat-dark border border-nat-border rounded-bl-sm"
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <p
                        className={`text-[9px] mt-1 ${isMine ? "text-white/70" : "text-nat-sage"}`}
                      >
                        {new Date(msg.sentAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Avatar saya (kanan) */}
                  {isMine && (
                    <div className="w-7 h-7 rounded-full bg-nat-brown flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                      {currentUserId === farmerUserId
                        ? farmerName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                        : buyerName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
                      }
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-nat-border p-3 bg-white rounded-b-none sm:rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan negosiasi..."
              className="flex-1 bg-nat-light-cream border border-nat-border rounded-xl px-3 py-2.5 text-xs font-semibold text-nat-dark focus:outline-none focus:ring-1 focus:ring-nat-green"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="bg-nat-green hover:bg-nat-green-hover disabled:bg-nat-border text-white p-2.5 rounded-xl transition-colors disabled:cursor-not-allowed cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[9px] text-nat-sage mt-1.5 text-center font-medium">
            Negosiasi harga & detail transaksi. Riwayat tersimpan.
          </p>
        </div>
      </div>
    </div>
  );
}
