import { https } from '@/lib/https';

export const MUTATIONS = {
  logout: async function (data: { refreshToken: string }) {
    const response = await https.post('/auth/logout', data);

    return response.data;
  },
};
