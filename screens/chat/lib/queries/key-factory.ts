import { useAuthStore } from '@/screens/auth/store/auth-store';

const sessionScope = () => {
  const { userId, sessionGeneration } = useAuthStore.getState();
  return { userId, sessionGeneration };
};

export const QUERY_KEYS = {
  messages: {
    all: () => ['messages', sessionScope()],
    byConversation: (convoId: string) => [
      ...QUERY_KEYS.messages.all(),
      { convoId },
    ],
    messages: (convoId: string, limit?: string, cursor?: string) => [
      ...QUERY_KEYS.messages.all(),
      { convoId, limit, cursor },
    ],
  },
};
