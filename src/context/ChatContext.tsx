/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/context/ChatContext.tsx
 * ──────────────────────────────
 * Conversations and messages.
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Conversation, Message } from '../types';
import {
  conversationGetAll, conversationGetByMatchId, conversationAdd, conversationClear,
  messageGetAll, messageAdd, messageClear,
} from '../services';

interface ChatContextProps {
  conversations:    Conversation[];
  messages:         Message[];
  sendMessage:      (conversationId: string, senderUserId: string, content: string) => void;
  startConversation: (matchId: string, farmerUserId: string, buyerUserId: string) => string;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => conversationGetAll());
  const [messages, setMessages]           = useState<Message[]>(() => messageGetAll());

  const startConversation = useCallback((matchId: string, farmerUserId: string, buyerUserId: string): string => {
    const existing = conversationGetByMatchId(matchId);
    if (existing) return existing.id;

    const newConv: Conversation = {
      id:           `conv-${Date.now()}`,
      matchId,
      farmerUserId,
      buyerUserId,
      createdAt:    new Date().toISOString().split('T')[0],
    };
    const { conversation } = conversationAdd(newConv);
    setConversations(conversationGetAll());
    return conversation.id;
  }, []);

  const sendMessage = useCallback((conversationId: string, senderUserId: string, content: string) => {
    const newMsg: Message = {
      id:             `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      conversationId,
      senderUserId,
      content,
      sentAt:         new Date().toISOString(),
    };
    setMessages(messageAdd(newMsg));
  }, []);

  return (
    <ChatContext.Provider value={{ conversations, messages, sendMessage, startConversation }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextProps => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat harus digunakan di dalam ChatProvider');
  return ctx;
};
