// src/socket/useMessageSync.ts  (React Query example)
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { socket } from '.';
import { QUERY_KEYS } from '../queries/key-factory';
import type { ChatMessage, ReceiptState } from './types';
import { track } from '@/lib/analytics';

const observedDelivery = new Set<string>();
const observedRead = new Set<string>();

export function useMessageSync(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    const key = QUERY_KEYS.messages.byConversation(conversationId);

    const onCreated = (m: ChatMessage) => {
      if (m.conversationId !== conversationId) return;
      void queryClient
        .invalidateQueries({ queryKey: key }, { throwOnError: true })
        .catch(error => console.warn('message query refresh failed', error));
    };

    const onReceipt = (r: ReceiptState) => {
      if (r.conversationId !== conversationId) return;
      if (r.delivered?.messageId) {
        const operationId = r.delivered.messageId;
        if (!observedDelivery.has(operationId)) {
          observedDelivery.add(operationId);
          track('message_delivery_observed', {
            operation_id: operationId,
            receipt_scope: 'one_recipient',
          });
        }
      }
      if (r.read?.messageId) {
        const operationId = r.read.messageId;
        if (!observedRead.has(operationId)) {
          observedRead.add(operationId);
          track('message_read_observed', {
            operation_id: operationId,
            receipt_scope: 'one_recipient',
          });
        }
      }
      queryClient.setQueryData<Record<string, ReceiptState>>(
        ['receipts', conversationId],
        (old = {}) => {
          const prev = old[r.userId];
          // keep only the newest version
          return !prev || r.version > prev.version
            ? { ...old, [r.userId]: r }
            : old;
        },
      );
    };

    socket.on('message.created', onCreated);
    socket.on('receipt.delivered', onReceipt);
    socket.on('receipt.read', onReceipt);
    return () => {
      socket.off('message.created', onCreated);
      socket.off('receipt.delivered', onReceipt);
      socket.off('receipt.read', onReceipt);
    };
  }, [conversationId, queryClient]);
}
