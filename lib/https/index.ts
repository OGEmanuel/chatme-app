import { useAuthStore } from '@/screens/auth/store/auth-store';
import { getSessionSignal } from '@/lib/session/session-requests';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthResponse } from './type';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const defaultConfig = {
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
};

export const axiosInstance = axios.create(defaultConfig);

// No interceptors on this one.
const refreshClient = axios.create(defaultConfig);

const AUTH_PATHS = [
  '/auth/otp/request',
  '/auth/otp/resend',
  '/auth/otp/verify',
  '/auth/refresh',
  '/auth/logout',
];
const isAuthPath = (url?: string) => AUTH_PATHS.some(p => url?.includes(p));

type SessionRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _sessionGeneration?: number;
};

const isCurrentSession = (generation: number) =>
  useAuthStore.getState().sessionGeneration === generation;

const refreshAccessToken = async (generation: number): Promise<string> => {
  if (!isCurrentSession(generation)) {
    throw new Error('Session changed before token refresh');
  }
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await refreshClient.post<AuthResponse>(
    '/auth/refresh',
    { refreshToken },
    { signal: getSessionSignal(generation) },
  );
  if (!isCurrentSession(generation)) {
    throw new Error('Session changed during token refresh');
  }
  useAuthStore.getState().setTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  });

  return data.accessToken;
};

const refreshPromises = new Map<number, Promise<string>>();

export const getFreshAccessToken = (
  generation = useAuthStore.getState().sessionGeneration,
) => {
  let refreshPromise = refreshPromises.get(generation);
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(generation).finally(() => {
      refreshPromises.delete(generation);
    });
    refreshPromises.set(generation, refreshPromise);
  }
  return refreshPromise;
};

// Only treat it as "session is dead" if the server rejected the refresh token.
const isAuthRejection = (e: unknown) => {
  const status = (e as AxiosError)?.response?.status;
  return status === 400 || status === 401 || status === 403;
};

axiosInstance.interceptors.request.use(config => {
  const { accessToken, sessionGeneration } = useAuthStore.getState();
  const requestConfig = config as SessionRequestConfig;
  const requestGeneration =
    requestConfig._sessionGeneration ?? sessionGeneration;
  if (requestGeneration !== sessionGeneration) {
    return Promise.reject(new Error('Session changed before request dispatch'));
  }
  requestConfig._sessionGeneration = requestGeneration;
  requestConfig.signal ??= getSessionSignal(requestGeneration);
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => {
    const config = response.config as SessionRequestConfig;
    if (
      config._sessionGeneration !== undefined &&
      !isCurrentSession(config._sessionGeneration)
    ) {
      return Promise.reject(new Error('Session changed before response'));
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as SessionRequestConfig | undefined;

    const status = error.response?.status;

    if (status !== 401 || !originalRequest || isAuthPath(originalRequest.url)) {
      // Only report what's actionable.
      if (!status || status >= 500) {
        console.warn('HTTP request failed', {
          status,
          code: error.code,
          message: error.message,
        });
      }
      return Promise.reject(error);
    }

    const generation =
      originalRequest._sessionGeneration ??
      useAuthStore.getState().sessionGeneration;
    if (!isCurrentSession(generation)) {
      return Promise.reject(new Error('Session changed before request retry'));
    }

    if (originalRequest._retry) {
      useAuthStore.getState().logOut(generation);
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      // Stale-token race: someone already refreshed while this request was in flight.
      const usedHeader = originalRequest.headers.Authorization as
        string | undefined;
      const current = useAuthStore.getState().accessToken;
      const token =
        current && usedHeader !== `Bearer ${current}`
          ? current
          : await getFreshAccessToken(generation);
      if (!isCurrentSession(generation)) {
        return Promise.reject(new Error('Session changed before request retry'));
      }

      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      if (
        isAuthRejection(refreshError) ||
        (refreshError as Error).message === 'No refresh token'
      ) {
        useAuthStore.getState().logOut(generation);
      }
      return Promise.reject(refreshError);
    }
  },
);

export const https = axiosInstance;
