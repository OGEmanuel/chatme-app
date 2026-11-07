export const QUERY_KEYS = {
  contacts: {
    all: ['contacts'],
    search: (searchQuery: string) => [
      ...QUERY_KEYS.contacts.all,
      'search',
      searchQuery,
    ],
  },
  convos: {
    all: ['convos'],
    recent: (limit = '20', archived = false, cursor?: string) => [
      ...QUERY_KEYS.convos.all,
      { limit, archived, cursor },
    ],
  },
};
