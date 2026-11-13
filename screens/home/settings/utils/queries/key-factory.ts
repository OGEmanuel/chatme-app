import { useAuthStore } from '@/screens/auth/store/auth-store';

export const QUERY_KEYS = {
  me: {
    all: () => {
      const { userId, sessionGeneration } = useAuthStore.getState();
      return ['me', { userId, sessionGeneration }];
    },
  },
};
