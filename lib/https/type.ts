export type AuthResponse = {
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  refreshTokenExpiresInSeconds: number;
  user: AuthUser;
};

export type AuthUser = {
  id: string;
  phoneNumber: string;
  displayName: string;
  avatarUrl: Record<string, unknown> | null;
  bio: string;
  sharePhoneNumber: boolean;
  shareLastSeen: boolean;
  lastSeenAt: string | null;
  profileComplete: boolean;
  createdAt: string;
};