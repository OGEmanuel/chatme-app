import { https } from '@/lib/https';
import { ConversationResponse, MessagesResponse } from './types';

export const QUERIES = {
  getMessages: async (convoId: string, limit = '50', cursor?: string) => {
    const params = new URLSearchParams();

    params.append('limit', limit);
    {
      cursor && params.append('cursor', cursor);
    }

    const url = `/conversations/${convoId}/messages?${params.toString()}`;

    const response = await https.get<MessagesResponse>(url);

    return response.data;
  },
};

export const MUTATIONS = {
  createConvo: async (data: { participantId: string }) => {
    const response = await https.post<ConversationResponse>(
      '/conversations/direct',
      data,
    );

    return response.data;
  },
  sendMessage: async (
    convoId: string,
    data: { clientMessageId: string; text: string },
  ) => {
    const response = await https.post(
      `/conversations/${convoId}/messages`,
      data,
    );

    return response.data;
  },
};
