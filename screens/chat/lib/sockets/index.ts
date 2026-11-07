// src/socket/socket.ts
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from './types';

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const socket: AppSocket = io(process.env.EXPO_PUBLIC_SOCKET_URL!, {
  autoConnect: false,
  transports: ['websocket'], // the server and Postman guide use WebSocket only
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
  timeout: 20000, // raise to ~90000 if the host is a sleeping free tier
});

export function connectSocket(accessToken: string) {
  // read by the manager on every (re)connect attempt
  socket.io.opts.extraHeaders = { Authorization: `Bearer ${accessToken}` };
  if (!socket.connected) socket.connect();
}

export function disconnectSocket() {
  socket.disconnect();
}
