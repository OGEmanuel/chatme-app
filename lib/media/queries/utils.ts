import { queryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from './key-factory';
import { QUERIES } from '.';

export const getLocalUri = (id: string) => {
  return queryOptions({
    queryKey: QUERY_KEYS.photos.byId(id),
    queryFn: () => QUERIES.getLocalUri(id),
    enabled: !!id,
  });
};

export const getPhotos = (first?: number) => {
  return queryOptions({
    queryKey: QUERY_KEYS.photos.some(first),
    queryFn: () => QUERIES.getPhotos(first),
  });
};
