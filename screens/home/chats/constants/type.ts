import {
  ConversationSettings,
  Message,
} from '@/screens/chat/lib/queries/types';

type Chat = {
  id: string;
  name: string;
  time: string;
  message: string;
  you?: boolean;
  online?: boolean;
  unread?: boolean;
  unreadCount?: number;
  pinned?: boolean;
  muted?: boolean;
  avatar: string;
  group?: boolean;
  type: 'chat';
};

type ItemType = {
  id: string;
  name: string;
  time: string;
  otherParticipantId: string;
  message: Message | null;
  type: 'direct' | 'group';
  unreadCount: number;
  online: boolean;
  you: boolean;
  settings: ConversationSettings;
  avatar: string | null;
};

export type ChatItemProps =
  | {
      item: ItemType;
      selected: string[];
      onSetSelected: React.Dispatch<React.SetStateAction<string[]>>;
      isArchived?: never;
    }
  | {
      item: ItemType;
      isArchived?: boolean;
      selected?: never;
      onSetSelected?: never;
    };

export type ListItem =
  | {
      id: string;
      type: 'archived';
    }
  | Message;
