import { https } from '@/lib/https';
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
