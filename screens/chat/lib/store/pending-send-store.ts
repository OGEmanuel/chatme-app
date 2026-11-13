import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type PendingSend = {
  accountId: string;
  conversationId: string;
  clientMessageId: string;
  text: string;
  createdAt: string;
  status: 'pending' | 'failed';
};

type PendingSendState = {
  operations: PendingSend[];
  add: (operation: PendingSend) => void;
  setStatus: (
    accountId: string,
    clientMessageId: string,
    status: PendingSend['status'],
  ) => void;
  remove: (accountId: string, clientMessageId: string) => void;
  markInterruptedAsFailed: () => void;
};

export const usePendingSendStore = create<PendingSendState>()(
  persist(
    set => ({
      operations: [],
      add: operation =>
        set(state => ({
          operations: [
            ...state.operations.filter(
              item =>
                item.accountId !== operation.accountId ||
                item.clientMessageId !== operation.clientMessageId,
            ),
            operation,
          ],
        })),
      setStatus: (accountId, clientMessageId, status) =>
        set(state => ({
          operations: state.operations.map(operation =>
            operation.accountId === accountId &&
            operation.clientMessageId === clientMessageId
              ? { ...operation, status }
              : operation,
          ),
        })),
      remove: (accountId, clientMessageId) =>
        set(state => ({
          operations: state.operations.filter(
            operation =>
              operation.accountId !== accountId ||
              operation.clientMessageId !== clientMessageId,
          ),
        })),
      markInterruptedAsFailed: () =>
        set(state => ({
          operations: state.operations.map(operation =>
            operation.status === 'pending'
              ? { ...operation, status: 'failed' }
              : operation,
          ),
        })),
    }),
    {
      name: 'chat-me-pending-sends',
      storage: createJSONStorage(() => ({
        setItem: (key, value) => SecureStore.setItemAsync(key, value),
        getItem: key => SecureStore.getItemAsync(key),
        removeItem: key => SecureStore.deleteItemAsync(key),
      })),
      partialize: state => ({ operations: state.operations }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('pending message recovery failed', error);
          return;
        }
        state?.markInterruptedAsFailed();
      },
    },
  ),
);
