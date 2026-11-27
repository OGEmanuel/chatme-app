import { useAuthStore } from '@/screens/auth/store/auth-store';
import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import * as Crypto from 'expo-crypto';
import { useCallback } from 'react';
import { toast } from '@/lib/toast';
import { MUTATIONS } from '../queries';
import { track } from '@/lib/analytics';
import { QUERY_KEYS } from '../queries/key-factory';
import {
  PendingSend,
  usePendingSendStore,
} from '../store/pending-send-store';
import type { Message, MessagesResponse } from '../queries/types';

type SendVariables = {
  accountId: string;
  sessionGeneration: number;
  conversationId: string;
  clientMessageId: string;
  text: string;
};

type SendContext = {
  queryKey: ReturnType<typeof QUERY_KEYS.messages.messages>;
};

export function useMessageDelivery(
  conversationId: string,
  accountId: string | null,
  sessionGeneration: number,
) {
  const queryClient = useQueryClient();
  const operations = usePendingSendStore(state => state.operations);
  const add = usePendingSendStore(state => state.add);
  const setStatus = usePendingSendStore(state => state.setStatus);
  const pendingMessages = operations.filter(
    operation =>
      operation.accountId === accountId &&
      operation.conversationId === conversationId,
  );

  const { mutate, isPending } = useMutation<
    Message | { message: Message },
    Error,
    SendVariables,
    SendContext
  >({
    mutationFn: variables => {
      const session = useAuthStore.getState();
      if (
        session.userId !== variables.accountId ||
        session.sessionGeneration !== variables.sessionGeneration
      ) {
        throw new Error('Session changed before message delivery');
      }
      return MUTATIONS.sendMessage(variables.conversationId, {
        clientMessageId: variables.clientMessageId,
        text: variables.text,
      });
    },
    onMutate: async variables => {
      const queryKey = QUERY_KEYS.messages.messages(variables.conversationId);
      await queryClient.cancelQueries({ queryKey });

      return { queryKey };
    },
    onError: (error, variables, context) => {
      setStatus(variables.accountId, variables.clientMessageId, 'failed');
      const isTimeout =
        isAxiosError(error) &&
        (error.code === 'ECONNABORTED' ||
          error.code === 'NETWORK_ERROR');
      track('message_send_failed', {
        operation_id: variables.clientMessageId,
        message_type: 'text',
        conversation_type: 'direct',
        failure_stage: 'message_submission',
        error_code: isTimeout ? 'NETWORK_TIMEOUT' : 'SEND_FAILED',
        outcome: 'unknown',
        retryable: true,
        attempt_number: usePendingSendStore
          .getState()
          .operations.find(
            operation =>
              operation.accountId === variables.accountId &&
              operation.clientMessageId === variables.clientMessageId,
          )?.attemptNumber ?? 1,
      });
      const errorMessage = isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : error.message;
      toast.error('Failed to send message', errorMessage || 'Please try again.');
    },
    onSuccess: (response, variables) => {
      const session = useAuthStore.getState();
      if (
        session.userId !== variables.accountId ||
        session.sessionGeneration !== variables.sessionGeneration
      ) {
        return;
      }

      const acceptedMessage =
        'message' in response && response.message
          ? response.message
          : ('id' in response ? response : null);
      if (acceptedMessage?.clientMessageId === variables.clientMessageId) {
        const messageKey = QUERY_KEYS.messages.messages(
          variables.conversationId,
        );
        queryClient.setQueryData<InfiniteData<MessagesResponse>>(
          messageKey,
          current => {
            if (!current) return current;
            const firstPage = current.pages[0];
            if (!firstPage) return current;
            const alreadyPresent = firstPage.items.some(
              item =>
                item.clientMessageId === acceptedMessage.clientMessageId,
            );
            if (alreadyPresent) return current;
            return {
              ...current,
              pages: [
                {
                  ...firstPage,
                  items: [acceptedMessage, ...firstPage.items],
                },
                ...current.pages.slice(1),
              ],
            };
          },
        );
        usePendingSendStore
          .getState()
          .remove(variables.accountId, variables.clientMessageId);
        void queryClient.invalidateQueries({ queryKey: ['convos'] });
        return;
      }

      setStatus(variables.accountId, variables.clientMessageId, 'pending');
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages.byConversation(
          variables.conversationId,
        ),
      });
      void queryClient.invalidateQueries({ queryKey: ['convos'] });

      let attempts = 0;
      const poll = () => {
        if (attempts >= 8) {
          setStatus(
            variables.accountId,
            variables.clientMessageId,
            'failed',
          );
          toast.error(
            'Message confirmation timed out',
            'Retry to recover this message.',
          );
          return;
        }
        attempts += 1;
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.messages.byConversation(
            variables.conversationId,
          ),
        });
        setTimeout(poll, 1500);
      };
      setTimeout(poll, 1500);
    },
  });

  const send = useCallback(
    (text: string) => {
      if (!accountId || !conversationId || isPending || !text.trim()) {
        return false;
      }
      const operation: PendingSend = {
        accountId,
        conversationId,
        clientMessageId: Crypto.randomUUID(),
        text,
        createdAt: new Date().toISOString(),
        status: 'pending',
        attemptNumber: 1,
        attemptedAt: Date.now(),
      };
      add(operation);
      track('message_send_attempted', {
        operation_id: operation.clientMessageId,
        message_type: 'text',
        conversation_type: 'direct',
        attempt_number: 1,
        is_reply: false,
      });
      mutate({ ...operation, sessionGeneration });
      return true;
    },
    [accountId, add, conversationId, isPending, mutate, sessionGeneration],
  );

  const retry = useCallback(
    (operation: PendingSend) => {
      if (
        operation.status !== 'failed' ||
        !accountId ||
        operation.accountId !== accountId ||
        operation.conversationId !== conversationId ||
        isPending
      ) {
        return;
      }
      setStatus(accountId, operation.clientMessageId, 'pending');
      const attemptNumber = (operation.attemptNumber ?? 1) + 1;
      usePendingSendStore.setState(state => ({
        operations: state.operations.map(item =>
          item.accountId === accountId &&
          item.clientMessageId === operation.clientMessageId
            ? {
                ...item,
                status: 'pending',
                attemptNumber,
                attemptedAt: Date.now(),
              }
            : item,
        ),
      }));
      track('message_retry_started', {
        operation_id: operation.clientMessageId,
        message_type: 'text',
        attempt_number: attemptNumber,
      });
      mutate({
        accountId,
        sessionGeneration,
        conversationId,
        clientMessageId: operation.clientMessageId,
        text: operation.text,
      });
    },
    [
      accountId,
      conversationId,
      isPending,
      mutate,
      sessionGeneration,
      setStatus,
    ],
  );

  return {
    pendingMessages,
    isSending: isPending,
    send,
    retry,
  };
}
