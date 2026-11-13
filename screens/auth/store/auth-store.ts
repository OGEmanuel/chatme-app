import { clearPrivateSessionState } from '@/lib/session/clear-private-state';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  sessionGeneration: number;

  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;

  setTokens: (tokens: { accessToken: string; refreshToken?: string }) => void;

  logIn: (tokens: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  }) => void;

  logOut: (expectedGeneration?: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      sessionGeneration: 0,

      isLoggedIn: false,
      hasCompletedOnboarding: false,

      setTokens: ({ accessToken, refreshToken }) => {
        set(state => ({
          ...state,
          accessToken,
          ...(refreshToken !== undefined && { refreshToken }),
        }));
      },

      logIn: ({ accessToken, refreshToken, userId }) => {
        const previousSession = get();
        set(state => ({
          accessToken,
          refreshToken,
          userId,
          sessionGeneration: state.sessionGeneration + 1,
          isLoggedIn: true,
        }));
        if (previousSession.isLoggedIn) {
          clearPrivateSessionState(previousSession.sessionGeneration);
        }
      },

      logOut: expectedGeneration => {
        if (
          expectedGeneration !== undefined &&
          get().sessionGeneration !== expectedGeneration
        ) {
          return;
        }
        const previousGeneration = get().sessionGeneration;
        set(state => ({
          accessToken: null,
          refreshToken: null,
          userId: null,
          sessionGeneration: state.sessionGeneration + 1,
          isLoggedIn: false,
          hasCompletedOnboarding: false,
        }));
        clearPrivateSessionState(previousGeneration);
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
        userId: state.userId,
        sessionGeneration: state.sessionGeneration,
        isLoggedIn: state.isLoggedIn,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    },
  ),
);
