// src/socket/commands.ts
import { socket } from '.';
import { PresenceResponse } from './types';

const ensureConnected = () => {
  if (!socket.connected) throw new Error('Socket is not connected');
};

export const presenceSubscribe = async (
  conversationId: string,
): Promise<PresenceResponse> => {
  ensureConnected();
  return socket.timeout(5000).emitWithAck('presence.subscribe', {
    conversationId,
  });
};

export const presenceUnsubscribe = async (conversationId: string) => {
  ensureConnected();
  return socket.timeout(5000).emitWithAck('presence.unsubscribe', {
    conversationId,
  });
};

export const typingStart = async (conversationId: string) => {
  ensureConnected();
  return socket.timeout(5000).emitWithAck('typing.start', { conversationId });
};

export const typingStop = async (conversationId: string) => {
  ensureConnected();
  return socket.timeout(5000).emitWithAck('typing.stop', { conversationId });
};
