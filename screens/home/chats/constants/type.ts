type Chat = {
  id: number;
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

export type ChatItemProps =
  | {
      item: Chat;
      selected: number[];
      onSetSelected: React.Dispatch<React.SetStateAction<number[]>>;
      isArchived?: never;
    }
  | {
      item: Chat;
      isArchived?: boolean;
      selected?: never;
      onSetSelected?: never;
    };

export type ListItem =
  | {
      id: number;
      type: 'archived';
    }
  | Chat;
