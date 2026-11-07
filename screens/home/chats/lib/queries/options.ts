import { queryOptions } from '@tanstack/react-query';
import { QUERIES } from '.';
import { QUERY_KEYS } from './key-factory';

export const getSearchContacts = (searchQuery: string) => {
  return queryOptions({
    queryKey: QUERY_KEYS.contacts.search(searchQuery),
    queryFn: () => QUERIES.searchContacts(searchQuery),
    enabled: searchQuery !== '' && searchQuery.trim().length >= 3,
  });
};

export const getConvos = (limit = '20', archived = false, cursor?: string) => {
  return queryOptions({
    queryKey: QUERY_KEYS.convos.recent(limit, archived, cursor),
    queryFn: () => QUERIES.getConvos(limit, archived, cursor),
  });
};
