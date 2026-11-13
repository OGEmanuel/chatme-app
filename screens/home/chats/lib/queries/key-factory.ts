import { useAuthStore } from '@/screens/auth/store/auth-store';

const sessionScope = () => {
  const { userId, sessionGeneration } = useAuthStore.getState();
  return { userId, sessionGeneration };
};

export const QUERY_KEYS = {
  contacts: {
    all: () => ['contacts', sessionScope()],
    search: (searchQuery: string) => [
      ...QUERY_KEYS.contacts.all(),
      'search',
      searchQuery,
    ],
  },
  convos: {
    all: () => ['convos', sessionScope()],
    recent: (limit = '20', archived = false, cursor?: string) => [
      ...QUERY_KEYS.convos.all(),
      { limit, archived, cursor },
    ],
  },
};
