export const QUERY_KEYS = {
  messages: {
    all: ['messages'],
    byConversation: (convoId: string) => [
      ...QUERY_KEYS.messages.all,
      { convoId },
    ],
    messages: (convoId: string, limit?: string, cursor?: string) => [
      ...QUERY_KEYS.messages.all,
      { convoId, limit, cursor },
    ],
  },
};
