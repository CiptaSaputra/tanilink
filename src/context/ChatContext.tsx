/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/ChatContext.tsx
 * ──────────────────────────────
 * Conversations and messages.
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Conversation, Message } from "../types";
import {
  conversationGetAll,
  conversationGetByMatchId,
  conversationAdd,
  conversationClear,
  messageGetAll,
  messageAdd,
  messageClear,
} from "../services";

interface ChatContextProps {
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (
    conversationId: string,
    senderUserId: string,
    content: string,
  ) => Promise<void>;
  startConversation: (
    matchId: string,
    farmerUserId: string,
    buyerUserId: string,
  ) => Promise<string>;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  React.useEffect(() => {
    async function loadChat() {
      const [convs, msgs] = await Promise.all([
        conversationGetAll(),
        messageGetAll(),
      ]);
      setConversations(convs);
      setMessages(msgs);
    }
    loadChat();
  }, []);

  const startConversation = useCallback(
    async (
      matchId: string,
      farmerUserId: string,
      buyerUserId: string,
    ): Promise<string> => {
      const existing = await conversationGetByMatchId(matchId);
      if (existing) return existing.id;

      const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        matchId,
        farmerUserId,
        buyerUserId,
        createdAt: new Date().toISOString().split("T")[0],
      };
      const { conversation } = await conversationAdd(newConv);
      const all = await conversationGetAll();
      setConversations(all);
      return conversation.id;
    },
    [],
  );

  const sendMessage = useCallback(
    async (conversationId: string, senderUserId: string, content: string) => {
      const newMsg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        conversationId,
        senderUserId,
        content,
        sentAt: new Date().toISOString(),
      };
      const updated = await messageAdd(newMsg);
      setMessages(updated);
    },
    [],
  );

  return (
    <ChatContext.Provider
      value={{ conversations, messages, sendMessage, startConversation }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextProps => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat harus digunakan di dalam ChatProvider");
  return ctx;
};
