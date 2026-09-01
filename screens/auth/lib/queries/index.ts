import { https } from '@/lib/https';
import * as MediaLibrary from 'expo-media-library';
import { OtpRequestResponse, OtpVerifyResponse } from './types';

export const MUTATIONS = {
  otpRequest: async function (data: { phoneNumber: string }) {
    const response = await https.post<OtpRequestResponse>(
      '/auth/otp/request',
      data,
    );

    return response.data;
  },
  otpResend: async function (data: { challengeId: string }) {
    const response = await https.post<OtpRequestResponse>(
      '/auth/otp/resend',
      data,
    );

    return response.data;
  },
  otpVerify: async function (data: {
    challengeId: string;
    code: string;
    device: {
      name: string;
      platform: string;
    };
  }) {
    const response = await https.post<OtpVerifyResponse>(
      '/auth/otp/verify',
      data,
    );

    return response.data;
  },
};

export const QUERIES = {
  getPhotos: async function (first = 10) {
    const result = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.photo,
      first,
      sortBy: MediaLibrary.SortBy.creationTime,
    });

    return result.assets;
  },
  getLocalUri: async function (id: string) {
    const info = await MediaLibrary.getAssetInfoAsync(id);

    return info;
  },
};
