import { queryOptions } from '@tanstack/react-query';
import { QUERIES } from '.';
import { QUERY_KEYS } from './key-factory';

export const getSearchContacts = (searchQuery: string) => {
  return queryOptions({
    queryKey: QUERY_KEYS.contacts.search(searchQuery),
    queryFn: ({ signal }) => QUERIES.searchContacts(searchQuery, '20', signal),
    enabled: searchQuery !== '' && searchQuery.trim().length >= 3,
  });
};

export const getConvos = (limit = '20', archived = false, cursor?: string) => {
  return queryOptions({
    queryKey: QUERY_KEYS.convos.recent(limit, archived, cursor),
    queryFn: ({ signal }) =>
      QUERIES.getConvos(limit, archived, cursor, signal),
  });
};
