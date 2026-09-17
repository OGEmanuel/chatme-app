import { QUERIES } from '@/screens/auth/lib/queries';
import { QUERY_KEYS } from '@/screens/auth/lib/queries/key-factory';
import { queryOptions } from '@tanstack/react-query';
import { clsx, type ClassValue } from 'clsx';
import { Dimensions } from 'react-native';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFullWidth = () => {
  return Dimensions.get('window').width;
};

export const getCallingCode = (root: string, suffixes: string[]) => {
  const callingCode = `${root}${suffixes[0] ?? ''}`;

  return callingCode;
};

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
