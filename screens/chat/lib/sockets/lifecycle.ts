// src/socket/socketLifecycle.ts
import NetInfo from '@react-native-community/netinfo';
import { isAxiosError } from 'axios';
import { AppState } from 'react-native';
import { getFreshAccessToken } from '@/lib/https';
import { useAuthStore } from '@/screens/auth/store/auth-store';
import { connectSocket, disconnectSocket, socket } from '.';
import { useSocketStore } from '../store/sockets-control-store';
import { registerRealtimeListeners } from './realtime';

const MAX_AUTH_RETRIES = 3;

export function startSocketLifecycle() {
  let authRetries = 0;
  let closed = false;
  let opening: Promise<void> | null = null;
  let missingUrlReported = false;

  const stopRealtime = registerRealtimeListeners();

  const open = (refreshToken = false): Promise<void> => {
    if (closed || (!refreshToken && socket.active)) return Promise.resolve();
    if (opening) return opening;

    opening = (async () => {
      try {
        if (!process.env.EXPO_PUBLIC_SOCKET_URL) {
          if (!missingUrlReported) {
            console.error('EXPO_PUBLIC_SOCKET_URL is not configured');
            missingUrlReported = true;
          }
          return;
        }
        if (refreshToken) disconnectSocket();
        const token =
          refreshToken
            ? await getFreshAccessToken()
            : (useAuthStore.getState().accessToken ??
              (await getFreshAccessToken()));
        if (!closed) connectSocket(token);
      } catch (error) {
        console.warn('socket authentication failed', error);
        const status = isAxiosError(error) ? error.response?.status : null;
        if (
          status === 400 ||
          status === 401 ||
          status === 403 ||
          (error instanceof Error && error.message === 'No refresh token')
        ) {
          useAuthStore.getState().logOut();
        }
      }
    })().finally(() => {
      opening = null;
    });

    return opening;
  };

  const onConnect = () => {
    authRetries = 0;
    useSocketStore.setState({ isConnected: true });
    console.info('socket connected');
  };

  const onDisconnect = (reason: string) => {
    useSocketStore.setState({ isConnected: false });
    console.info('socket disconnected', reason);
    if (reason === 'io server disconnect') void open(true);
  };

  const onError = (err: Error & { data?: { code?: string } }) => {
    console.warn('socket connect_error', {
      code: err.data?.code,
      message: err.message,
    });
    if (err.data?.code === 'AUTH_ACCESS_TOKEN_INVALID') {
      if (authRetries >= MAX_AUTH_RETRIES) {
        console.error('socket authentication retry limit reached');
        disconnectSocket();
        return;
      }
      authRetries += 1;
      void open(true);
    }
  };

  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  socket.on('connect_error', onError);

  const appSub = AppState.addEventListener('change', state => {
    if (state === 'active' && !socket.connected) open();
    if (state === 'background') disconnectSocket();
  });

  const netUnsub = NetInfo.addEventListener(n => {
    if (n.isConnected && !socket.active) void open();
  });

  void open();

  // cleanup
  return () => {
    closed = true;
    socket.off('connect', onConnect);
    socket.off('disconnect', onDisconnect);
    socket.off('connect_error', onError);
    appSub.remove();
    netUnsub();
    disconnectSocket();
    useSocketStore.setState({ isConnected: false });
    stopRealtime();
  };
}
