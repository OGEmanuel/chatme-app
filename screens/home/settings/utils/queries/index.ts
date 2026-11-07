import { https } from '@/lib/https';
import { UserProfileResponse } from './types';

export const QUERIES = {
  getMe: async function () {
    const response = await https.get<UserProfileResponse>('/me');

    return response.data;
  },
};

export const MUTATIONS = {
  logout: async function (data: { refreshToken: string }) {
    const response = await https.post('/auth/logout', data);

    return response.data;
  },
};
