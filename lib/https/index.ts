import { useAuthStore } from '@/screens/auth/store/auth-store';
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

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
];
const isAuthPath = (url?: string) => AUTH_PATHS.some(p => url?.includes(p));

const refreshAccessToken = async (): Promise<string> => {
  const { refreshToken } = useAuthStore.getState();
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await refreshClient.post('/auth/refresh', {
    refresh_token: refreshToken,
  });
  useAuthStore.getState().setTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
  });

  return data.access_token;
};

let refreshPromise: Promise<string> | null = null;

const getFreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Only treat it as "session is dead" if the server rejected the refresh token.
const isAuthRejection = (e: unknown) => {
  const status = (e as AxiosError)?.response?.status;
  return status === 400 || status === 401 || status === 403;
};

axiosInstance.interceptors.request.use(config => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    const status = error.response?.status;

    if (status !== 401 || !originalRequest || isAuthPath(originalRequest.url)) {
      // Only report what's actionable.
      if (!status || status >= 500) {
        console.log(error);
      }
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      useAuthStore.getState().logOut();
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
          : await getFreshAccessToken();

      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      if (
        isAuthRejection(refreshError) ||
        (refreshError as Error).message === 'No refresh token'
      ) {
        useAuthStore.getState().logOut();
      }
      return Promise.reject(refreshError);
    }
  },
);

export const https = axiosInstance;
