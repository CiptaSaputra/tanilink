/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/chatService.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Service layer untuk operasi data Conversation dan Message.
 */

import { Conversation, Message } from '../types';
import { STORAGE_KEYS, storageReadArray, storageWrite, storageRemove } from './storage';

// ═══════════════════════════════════════════════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export function conversationGetAll(): Conversation[] {
  return storageReadArray<Conversation>(STORAGE_KEYS.CONVERSATIONS);
}

export function conversationGetByMatchId(matchId: string): Conversation | undefined {
  return conversationGetAll().find(c => c.matchId === matchId);
}

export function conversationSaveAll(conversations: Conversation[]): void {
  storageWrite(STORAGE_KEYS.CONVERSATIONS, conversations);
}

/** Tambah conversation baru. Idempotent: jika matchId sudah ada, kembalikan yang lama. */
export function conversationAdd(conversation: Conversation): { conversation: Conversation; isNew: boolean } {
  const existing = conversationGetByMatchId(conversation.matchId);
  if (existing) return { conversation: existing, isNew: false };

  const all = conversationGetAll();
  conversationSaveAll([conversation, ...all]);
  return { conversation, isNew: true };
}

export function conversationClear(): void {
  storageRemove(STORAGE_KEYS.CONVERSATIONS);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

export function messageGetAll(): Message[] {
  return storageReadArray<Message>(STORAGE_KEYS.MESSAGES);
}

export function messageGetByConversation(conversationId: string): Message[] {
  return messageGetAll().filter(m => m.conversationId === conversationId);
}

export function messageSaveAll(messages: Message[]): void {
  storageWrite(STORAGE_KEYS.MESSAGES, messages);
}

export function messageAdd(message: Message): Message[] {
  const updated = [...messageGetAll(), message];
  messageSaveAll(updated);
  return updated;
}

export function messageClear(): void {
  storageRemove(STORAGE_KEYS.MESSAGES);
}
