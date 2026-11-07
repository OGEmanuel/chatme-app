export type Participant = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
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

export type ConversationResponse = {
  id: string;
  latestMessage: null;
  unreadCount: number;
  settings: ConversationSettings;
  lastActivityAt: string;
  createdAt: string;
  updatedAt: string;
  type: 'direct' | 'group';
  otherParticipant: Participant | null;
};

export type MessageAttachment =
  | {
      mediaId: string;
      type: 'image';
      contentType: string;
      sizeBytes: number;
      width: number;
      height: number;
      url: string;
    }
  | {
      mediaId: string;
      type: 'audio';
      contentType: string;
      sizeBytes: number;
      durationMs: number;
      url: string;
    }
  | {
      mediaId: string;
      type: 'video';
      contentType: string;
      sizeBytes: number;
      durationMs: number;
      width: number;
      height: number;
      url: string;
    }
  | {
      mediaId: string;
      type: 'document';
      contentType: string;
      sizeBytes: number;
      filename: string;
      url: string;
    };

export type MessageReaction = {
  userId: string;
  emoji: string;
};

export type Message = {
  links: string[];
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  kind: 'text';
  text: string;
  preview: string;
  attachments: MessageAttachment[];
  createdAt: string;
  replyToMessageId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  version: number;
  reactions: MessageReaction[];
};

export type MessagePageInfo = {
  nextCursor: string | null;
  hasNextPage: boolean;
};

export type MessagesResponse = {
  items: Message[];
  pageInfo: MessagePageInfo;
};
