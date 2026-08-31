export const QUERY_KEYS = {
  photos: {
    all: ['photos'],
    some: (first?: number) => ['photos', first],
    byId: (id: string) => ['photos', id],
  },
};
