import { queryOptions } from '@tanstack/react-query';
import { QUERIES } from '.';
import { QUERY_KEYS } from './key-factory';

export const getMe = () => {
  return queryOptions({
    queryKey: QUERY_KEYS.me.all(),
    queryFn: ({ signal }) => QUERIES.getMe(signal),
  });
};
