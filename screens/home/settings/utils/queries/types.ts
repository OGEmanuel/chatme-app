export type UserProfileResponse = {
  id: string;
  phoneNumber: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  sharePhoneNumber: boolean;
  shareLastSeen: boolean;
  lastSeenAt: string | null;
  profileComplete: boolean;
  createdAt: string;
};
