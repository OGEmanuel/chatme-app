export interface OtpRequestResponse {
  challengeId: string;
  phoneNumberMasked: string;
  expiresInSeconds: number;
  resendInSeconds: number;
  codeLength: number;
}

export interface OtpVerifyResponse {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: {
    id: string;
    phoneNumber: string;
    displayName: string;
    avatarUrl: string;
    profileComplete: boolean;
    createdAt: string;
  };
}
