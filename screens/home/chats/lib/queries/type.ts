import { Message } from "@/screens/chat/lib/queries/types";

export type SearchContacts = {
  id: string;
  displayName: string;
  avatarUrl: string;
};

export type SearchContactsResponse = {
  items: SearchContacts[];
  nextCursor: string | null;
};

export type ConversationSettings = {
  deletedAt: string | null;
  archived: boolean;
  muted: boolean;
  pinned: boolean;
  favorited: boolean;
  archivedAt: string | null;
  mutedAt: string | null;
  mutedUntil: string | null;
  pinnedAt: string | null;
  favoritedAt: string | null;
  clearedAt: string | null;
  clearedThroughMessageId: string | null;
};

export type ConversationParticipant = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
};

export type GroupParticipant = ConversationParticipant & {
  role: 'owner' | 'admin' | 'member';
};

export type ConversationBase = {
  id: string;
  latestMessage: Message | null;
  unreadCount: number;
  settings: ConversationSettings;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DirectConversation = ConversationBase & {
  type: 'direct';
  otherParticipant: ConversationParticipant;
};

export type GroupConversation = ConversationBase & {
  type: 'group';
  description: string | null;
  createdById: string;
  memberCount: number;
  name: string;
  avatarUrl: string | null;
  participants: GroupParticipant[];
  role: 'owner' | 'admin' | 'member';
};

export type Conversation = DirectConversation | GroupConversation;

export type ConversationListResponse = {
  items: Conversation[];
  pageInfo: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
};
