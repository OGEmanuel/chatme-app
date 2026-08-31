export const QUERY_KEYS = {
  photos: {
    all: ['photos'],
    some: (first?: number) => [...QUERY_KEYS.photos.all, first],
    byId: (id: string) => [...QUERY_KEYS.photos.all, id],
  },
};
