import { clearPrivateSessionState } from '@/lib/session/clear-private-state';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  hasHydrated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  sessionGeneration: number;

  isLoggedIn: boolean;
  hasCompletedOnboarding: boolean;
  pendingDestination: { pathname: string; params?: Record<string, string> } | null;

  setTokens: (tokens: {
    accessToken: string;
    refreshToken?: string;
    userId?: string;
  }) => void;

  logIn: (tokens: {
    accessToken: string;
    refreshToken: string;
    userId: string;
  }) => void;

  logOut: (expectedGeneration?: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setPendingDestination: (
    destination: AuthState['pendingDestination'],
  ) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      accessToken: null,
      refreshToken: null,
      userId: null,
      sessionGeneration: 0,

      isLoggedIn: false,
      hasCompletedOnboarding: false,
      pendingDestination: null,

      setTokens: ({ accessToken, refreshToken, userId }) => {
        set(state => ({
          ...state,
          accessToken,
          ...(refreshToken !== undefined && { refreshToken }),
          ...(userId !== undefined && { userId }),
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
      setPendingDestination: destination => {
        set({ pendingDestination: destination });
      },
    }),
    {
      name: 'chat-me-auth-store',
      version: 1,
      migrate: persisted => {
        const old = persisted as Partial<AuthState>;
        return {
          ...old,
          userId: old.userId ?? null,
          sessionGeneration: old.sessionGeneration ?? 1,
        };
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('auth state recovery failed', error);
        }
        useAuthStore.setState({
          hasHydrated: true,
          sessionGeneration: state?.sessionGeneration ?? 1,
        });
      },

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
        pendingDestination: state.pendingDestination,
      }),
    },
  ),
);
