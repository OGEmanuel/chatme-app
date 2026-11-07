type Message = {
  id: string;
  text: string;
  time: string;
  you: boolean;
};

export type ChatListItem =
  | {
      type: 'date';
      id: string;
      title: string;
    }
  | {
      type: 'message';
      id: string;
      message: Message;
    };
