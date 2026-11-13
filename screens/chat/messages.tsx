import TextCustom from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { LegendList, LegendListRef } from '@legendapp/list/react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  View,
} from 'react-native';
import { getMe } from '../home/settings/utils/queries/options';
import { QUERIES } from './lib/queries';
import { QUERY_KEYS } from './lib/queries/key-factory';
import type { PendingSend } from './lib/store/pending-send-store';
import { usePendingSendStore } from './lib/store/pending-send-store';
import { ChatListItem } from './lib/types';
import { format24HrTime, getDateLabel } from './lib/utils';

type Message = {
  id: string;
  text: string;
  time: string;
  you: boolean;
  status?: 'sending' | 'failed';
  clientMessageId?: string;
};

const Messages = (props: {
  conversationId: string;
  isKeyboardVisible: boolean;
  pendingMessages: PendingSend[];
  onRetry: (operation: PendingSend) => void;
}) => {
  const { conversationId, isKeyboardVisible, pendingMessages, onRetry } = props;
  const { data: userData } = useQuery({ ...getMe() });
  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.messages.messages(conversationId),
    queryFn: ({ pageParam, signal }) =>
      QUERIES.getMessages(conversationId, '50', pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page =>
      page.pageInfo.hasNextPage ? page.pageInfo.nextCursor ?? undefined : undefined,
    enabled: !!conversationId,
  });
  const removePendingSend = usePendingSendStore(state => state.remove);
  const legendListRef = useRef<LegendListRef>(null);
  const isAtBottom = useRef(true);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);

    isAtBottom.current = distanceFromBottom < 50;
    if (
      contentOffset.y < 60 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  };

  const serverMessages = useMemo(
    () => data?.pages.flatMap(page => page.items) ?? [],
    [data],
  );
  const serverClientIds = useMemo(
    () => new Set(serverMessages.map(message => message.clientMessageId)),
    [serverMessages],
  );
  const messages = useMemo(
    () =>
      [
        ...serverMessages.map(message => ({
          id: message.id,
          text: message.text,
          time: message.createdAt,
          you: message.senderId === userData?.id,
          clientMessageId: message.clientMessageId,
        })),
        ...pendingMessages
          .filter(operation => !serverClientIds.has(operation.clientMessageId))
          .map(operation => ({
            id: `pending:${operation.clientMessageId}`,
            clientMessageId: operation.clientMessageId,
            text: operation.text,
            time: operation.createdAt,
            you: true,
            status:
              operation.status === 'failed'
                ? ('failed' as const)
                : ('sending' as const),
          })),
      ].sort((a, b) => Date.parse(a.time) - Date.parse(b.time)),
    [pendingMessages, serverClientIds, serverMessages, userData?.id],
  );

  useEffect(() => {
    for (const operation of pendingMessages) {
      if (serverClientIds.has(operation.clientMessageId)) {
        removePendingSend(operation.accountId, operation.clientMessageId);
      }
    }
  }, [pendingMessages, removePendingSend, serverClientIds]);

  const groupedMessages = useMemo(() => {
    const result: ChatListItem[] = [];
    let currentDate = '';

    messages?.forEach(message => {
      const date = new Date(message.time);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (dateKey !== currentDate) {
        currentDate = dateKey;

        result.push({
          type: 'date',
          id: `date-${dateKey}`,
          title: getDateLabel(message.time),
        });
      }

      result.push({
        type: 'message',
        id: message.id,
        message,
      });
    });

    return result;
  }, [messages]);

  useEffect(() => {
    if (isAtBottom.current) {
      legendListRef.current?.scrollToEnd({ animated: false });
    }
  }, []);

  useEffect(() => {
    if (!isKeyboardVisible || !isAtBottom.current) return;

    const timeout = setTimeout(() => {
      legendListRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [isKeyboardVisible]);

  const RenderMessage = (props: { item: Message }) => {
    const { item } = props;
    return (
      <View
        className={cn(
          'flex-row items-center gap-3',
          item.you ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        <View
          style={{
            boxShadow: '0px 3px 8px 0px #18342103',
          }}
          className={cn(
            'max-w-60 rounded-t-2xl px-4 py-3',
            item.you
              ? 'rounded-bl-2xl bg-primary-400'
              : 'rounded-br-2xl bg-white dark:bg-neutral-800',
          )}
        >
          <TextCustom
            className={cn(
              'leading-[150%]',
              item.you ? 'text-white' : 'text-neutral-600',
            )}
          >
            {item.text}
          </TextCustom>
        </View>
        <View className="items-end gap-1">
          <TextCustom
            className={'font-sf-pro-medium text-sm/[150%] !text-neutral-300'}
          >
            {item.status ? (item.status === 'failed' ? 'Not sent' : 'Sending…') : format24HrTime(item.time)}
          </TextCustom>
          {item.status === 'failed' && item.clientMessageId && (
            <Pressable
              onPress={() => {
                const operation = pendingMessages.find(
                  pending =>
                    pending.clientMessageId === item.clientMessageId,
                );
                if (operation) onRetry(operation);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Retry sending message: ${item.text}`}
              accessibilityHint="Sends this message again using the same message identifier."
            >
              <TextCustom className="font-sf-pro-bold text-sm text-primary-400">
                Retry
              </TextCustom>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <Pressable
        onPress={() => void refetch()}
        accessibilityRole="button"
        accessibilityLabel="Retry loading conversation history"
        className="flex-1 items-center justify-center px-8"
      >
        <TextCustom className="text-center">
          Unable to load messages. Tap to retry.
        </TextCustom>
      </Pressable>
    );
  }

  return (
    <View className="flex-1">
      {isFetchingNextPage && (
        <ActivityIndicator className="absolute left-0 right-0 top-2 z-10" />
      )}
      <LegendList
        data={groupedMessages}
        showsVerticalScrollIndicator={false}
        ref={legendListRef}
        keyExtractor={item => item.id.toString()}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 12,
          gap: 24,
        }}
        style={{
          paddingVertical: 28,
        }}
        recycleItems={true}
        renderItem={({ item }) => {
          if (item.type === 'date') {
            return (
              <View className="items-center py-2">
                <TextCustom className="text-xs text-neutral-300">
                  {item.title}
                </TextCustom>
              </View>
            );
          }

          return <RenderMessage item={item.message} />;
        }}
        onContentSizeChange={() => {
          if (isAtBottom.current) {
            legendListRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />
    </View>
  );
};

export default Messages;
