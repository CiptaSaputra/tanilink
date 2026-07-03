/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/services/chatService.ts
 */
import { Conversation, Message } from '../types';

export async function conversationGetAll(): Promise<Conversation[]> {
  const res = await fetch('/api/conversations');
  if (!res.ok) return [];
  return res.json();
}

export async function conversationGetByMatchId(matchId: string): Promise<Conversation | undefined> {
  const res = await fetch(`/api/conversations/match/${matchId}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function conversationSaveAll(conversations: Conversation[]): Promise<void> {
  await fetch('/api/conversations', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conversations),
  });
}

export async function conversationAdd(conversation: Conversation): Promise<{ conversation: Conversation; isNew: boolean }> {
  const existing = await conversationGetByMatchId(conversation.matchId);
  if (existing) return { conversation: existing, isNew: false };

  await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(conversation),
  });
  return { conversation, isNew: true };
}

export async function conversationClear(): Promise<void> {
  await fetch('/api/conversations/clear', { method: 'POST' });
}

export async function messageGetAll(): Promise<Message[]> {
  const res = await fetch('/api/messages');
  if (!res.ok) return [];
  return res.json();
}

export async function messageGetByConversation(conversationId: string): Promise<Message[]> {
  const res = await fetch(`/api/messages/conversation/${conversationId}`);
  if (!res.ok) return [];
  return res.json();
}

export async function messageSaveAll(messages: Message[]): Promise<void> {
  await fetch('/api/messages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(messages),
  });
}

export async function messageAdd(message: Message): Promise<Message[]> {
  await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  return messageGetAll();
}

export async function messageClear(): Promise<void> {
  await fetch('/api/messages/clear', { method: 'POST' });
}
