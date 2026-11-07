// src/socket/socketStore.ts
import { create } from 'zustand';
import { socket } from '../sockets';

type Flags = Record<string, boolean>; // userId -> true/false

type SocketState = {
  isConnected: boolean;
  online: Record<string, Flags>; // conversationId -> userId -> online?
  typing: Record<string, Flags>; // conversationId -> userId -> typing?
};

export const useSocketStore = create<SocketState>(() => ({
  isConnected: socket.connected,
  online: {},
  typing: {},
}));

// Stable reference so selectors don't return a new {} each time
const EMPTY: Flags = Object.freeze({}) as Flags;

export const useIsOnline = (conversationId: string, userId?: string) =>
  useSocketStore(s => (userId ? !!s.online[conversationId]?.[userId] : false));

export const useIsTyping = (conversationId: string, userId?: string) =>
  useSocketStore(s => (userId ? !!s.typing[conversationId]?.[userId] : false));

// Everyone currently typing in a conversation (e.g. for "Sam is typing…")
export const useTypingUserIds = (conversationId: string) => {
  const flags = useSocketStore(s => s.typing[conversationId] ?? EMPTY);
  return Object.keys(flags).filter(id => flags[id]);
};
