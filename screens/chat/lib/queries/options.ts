import { queryOptions } from '@tanstack/react-query';
import { QUERIES } from '.';
import { QUERY_KEYS } from './key-factory';

export const getMessages = (
  convoId: string,
  limit?: string,
  cursor?: string,
) => {
  return queryOptions({
    queryKey: QUERY_KEYS.messages.messages(convoId, limit, cursor),
    queryFn: ({ signal }) =>
      QUERIES.getMessages(convoId, limit, cursor, signal),
    enabled: !!convoId,
  });
};
