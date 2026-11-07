// src/socket/useConversationSubscription.ts
import { useEffect } from 'react';
import { retainConversation } from './realtime';

export function useConversationSubscription(conversationId: string) {
  useEffect(() => {
    if (!conversationId) return;
    return retainConversation(conversationId);
  }, [conversationId]);
}