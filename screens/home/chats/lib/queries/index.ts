import { https } from '@/lib/https';
import { ConversationListResponse, SearchContactsResponse } from './type';

export const QUERIES = {
  searchContacts: async (
    searchQuery: string,
    limit = '20',
    signal?: AbortSignal,
  ) => {
    const params = new URLSearchParams();

    params.append('q', searchQuery);
    params.append('limit', limit);

    const url = `/users/search?${params.toString()}`;

    const response = await https.get<SearchContactsResponse>(url, { signal });
    return response.data;
  },
  getConvos: async (
    limit = '20',
    archived = false,
    cursor?: string,
    signal?: AbortSignal,
  ) => {
    const params = new URLSearchParams();

    params.append('limit', limit);
    params.append('archived', `${archived}`);
    {
      cursor && params.append('cursor', cursor);
    }

    const url = `/conversations?${params.toString()}`;

    const response = await https.get<ConversationListResponse>(url, { signal });

    return response.data;
  },
};
