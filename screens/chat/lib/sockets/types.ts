// src/socket/types.ts
export type Ack<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

type Conv = { conversationId: string };

export type ReceiptState = {
  conversationId: string;
  userId: string;
  throughMessageId: string;
  at: string;
  version: number;
  delivered: { messageId: string; at: string } | null;
  read: { messageId: string; at: string } | null;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  clientMessageId: string;
  senderId: string;
  kind: 'text';
  text: string;
  createdAt: string;
};

export type ServerToClientEvents = {
  'message.created': (m: ChatMessage) => void;
  'receipt.delivered': (r: ReceiptState) => void;
  'receipt.read': (r: ReceiptState) => void;
  'presence.changed': (p: {
    conversationId: string;
    userId: string;
    status: 'online' | 'offline';
    occurredAt: string;
  }) => void;
  'typing.started': (t: Conv & { userId: string; expiresAt: string }) => void;
  'typing.stopped': (t: Conv & { userId: string; occurredAt: string }) => void;
};

export type ClientToServerEvents = {
  'presence.subscribe': (
    p: Conv,
    ack: (
      r: Ack<
        Conv & {
          participants: { userId: string; status: 'online' | 'offline' }[];
          typing: string[];
        }
      >,
    ) => void,
  ) => void;
  'presence.unsubscribe': (p: Conv, ack: (r: Ack<Conv>) => void) => void;
  'typing.start': (
    p: Conv,
    ack: (r: Ack<Conv & { expiresAt: string }>) => void,
  ) => void;
  'typing.stop': (p: Conv, ack: (r: Ack<Conv>) => void) => void;
};

export type PresenceErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };

export type PresenceParticipant = {
  userId: string;
  status: 'online' | 'offline';
};

export type PresenceData = {
  conversationId: string;
  participants: PresenceParticipant[];
  typing: string[];
};

export type PresenceResponse = ApiResponse<PresenceData>;
