import { https } from '@/lib/https';
import type { Conversation } from '@/screens/home/chats/lib/queries/type';
import { ConversationResponse, MessagesResponse } from './types';

export const QUERIES = {
  getConversation: async (conversationId: string, signal?: AbortSignal) => {
    const response = await https.get<Conversation>(
      `/conversations/${conversationId}`,
      { signal },
    );
    return response.data;
  },
  getMessages: async (
    convoId: string,
    limit = '50',
    cursor?: string,
    signal?: AbortSignal,
  ) => {
    const params = new URLSearchParams();

    params.append('limit', limit);
    {
      cursor && params.append('cursor', cursor);
    }

    const url = `/conversations/${convoId}/messages?${params.toString()}`;

    const response = await https.get<MessagesResponse>(url, { signal });

    return response.data;
  },
};

export const MUTATIONS = {
  createConvo: async (data: { participantId: string }, signal?: AbortSignal) => {
    const response = await https.post<ConversationResponse>(
      '/conversations/direct',
      data,
      { signal },
    );

    return response.data;
  },
  sendMessage: async (
    convoId: string,
    data: { clientMessageId: string; text: string },
    signal?: AbortSignal,
  ) => {
    const response = await https.post(
      `/conversations/${convoId}/messages`,
      data,
      { signal },
    );

    return response.data;
  },
};
