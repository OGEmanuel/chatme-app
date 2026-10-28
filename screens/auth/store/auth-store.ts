import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;

  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;

  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;

  logIn: (tokens: { accessToken: string; refreshToken: string }) => void;

  logOut: () => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      accessToken: null,
      refreshToken: null,

      user: null,

      isLoggedIn: false,
      hasCompletedOnboarding: false,

      setTokens: ({ accessToken, refreshToken }) => {
        set(state => ({
          ...state,
          accessToken,
          ...(refreshToken !== undefined && { refreshToken }),
        }));
      },

      logIn: ({ accessToken, refreshToken }) => {
        set({
          accessToken,
          refreshToken,
          isLoggedIn: true,
        });
      },

      logOut: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
          hasCompletedOnboarding: false,
        });
      },

      completeOnboarding: () => {
        set({
          hasCompletedOnboarding: true,
        });
      },

      resetOnboarding: () => {
        set({
          hasCompletedOnboarding: false,
        });
      },
    }),
    {
      name: 'chat-me-auth-store',

      storage: createJSONStorage(() => ({
        setItem: (key, value) => SecureStore.setItemAsync(key, value),

        getItem: key => SecureStore.getItemAsync(key),

        removeItem: key => SecureStore.deleteItemAsync(key),
      })),

      partialize: state => ({
        refreshToken: state.refreshToken,
        isLoggedIn: state.isLoggedIn,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);
