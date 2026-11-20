import { useAuthStore } from '@/screens/auth/store/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import * as Crypto from 'expo-crypto';
import { useCallback } from 'react';
import { toast } from '@/lib/toast';
import { MUTATIONS } from '../queries';
import { QUERY_KEYS } from '../queries/key-factory';
import {
  PendingSend,
  usePendingSendStore,
} from '../store/pending-send-store';

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
    unknown,
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
      const errorMessage = isAxiosError(error)
        ? (error.response?.data?.message ?? error.message)
        : error.message;
      toast.error('Failed to send message', errorMessage || 'Please try again.');
    },
    onSuccess: (_response, variables) => {
      // HTTP acknowledgement is not authoritative confirmation. Keep the
      // operation durable until history/socket reconciliation proves it.
      setStatus(variables.accountId, variables.clientMessageId, 'pending');
      const session = useAuthStore.getState();
      if (
        session.userId !== variables.accountId ||
        session.sessionGeneration !== variables.sessionGeneration
      ) {
        return;
      }
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages.byConversation(
          variables.conversationId,
        ),
      });
      void queryClient.invalidateQueries({ queryKey: ['convos'] });
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
      };
      add(operation);
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
