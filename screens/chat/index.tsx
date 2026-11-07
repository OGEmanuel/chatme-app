import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import PaperAirplaneIcon from '@/assets/icons/jsx/paper-airplane-icon';
import PaperClipIcon from '@/assets/icons/jsx/paper-clip-icon';
import PhoneIcon from '@/assets/icons/jsx/phone-icon';
import VideoCameraIcon from '@/assets/icons/jsx/video-camera-icon';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import useSendRequest from '@/lib/hooks/useSendRequests';
import { toast } from '@/lib/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { BlurView } from 'expo-blur';
import * as Crypto from 'expo-crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/header';
import { getMe } from '../home/settings/utils/queries/options';
import { MUTATIONS } from './lib/queries';
import { QUERY_KEYS } from './lib/queries/key-factory';
import type {
  ConversationResponse,
  Message,
  MessagesResponse,
} from './lib/queries/types';
import { useConversationSubscription } from './lib/sockets/use-conversation-realtime';
import { useMessageSync } from './lib/sockets/use-message-sync';
import { useTypingEmitter } from './lib/sockets/use-type-emitter';
import { useConvoControlStore } from './lib/store/convo-control-store';
import {
  useIsOnline,
  useIsTyping,
  useSocketStore,
} from './lib/store/sockets-control-store';
import { getTimeAgo } from './lib/utils';
import Messages from './messages';
import ShareModal from './share-modal';

type SendMessageVariables = { clientMessageId: string; text: string };
type SendMessageContext = {
  queryKey: ReturnType<typeof QUERY_KEYS.messages.messages>;
};

const ChatUIScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const setConvoResponse = useConvoControlStore(
    state => state.setConvoResponse,
  );
  const isConnected = useSocketStore(s => s.isConnected);
  const convoResponse = useConvoControlStore(state => state.convoResponse);
  const conversationId = convoResponse?.id ?? '';
  const online = useIsOnline(conversationId, id);
  const typing = useIsTyping(conversationId, id);
  const { onChangeText } = useTypingEmitter(conversationId);
  useConversationSubscription(conversationId);
  useMessageSync(conversationId);
  const queryClient = useQueryClient();
  const { data: currentUser } = useQuery({ ...getMe() });
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [openShareBox, setOpenShareBox] = useState(false);

  const BackgroundImage =
    colorScheme === 'dark'
      ? require('../../assets/images/chat-bg-dark.png')
      : require('../../assets/images/chat-bg.png');

  const { mutate, isPending } = useSendRequest<any, ConversationResponse>({
    mutationFn: () => MUTATIONS.createConvo({ participantId: id }),
    errorToast: {
      title: 'Error',
      description: "Can't fetch conversation now, please try again!",
    },
  });

  const { mutate: mutateSendMessage, isPending: isSendingMessage } =
    useMutation<unknown, Error, SendMessageVariables, SendMessageContext>({
      mutationFn: data => MUTATIONS.sendMessage(conversationId, data),
      onMutate: async variables => {
        const queryKey = QUERY_KEYS.messages.messages(conversationId);
        await queryClient.cancelQueries({ queryKey });

        const optimisticMessage: Message = {
          id: `optimistic:${variables.clientMessageId}`,
          conversationId,
          clientMessageId: variables.clientMessageId,
          senderId: currentUser?.id ?? '',
          kind: 'text',
          text: variables.text,
          links: [],
          attachments: [],
          preview: '',
          createdAt: new Date().toISOString(),
          replyToMessageId: null,
          editedAt: null,
          deletedAt: null,
          version: 0,
          reactions: [],
        };

        queryClient.setQueryData<MessagesResponse>(queryKey, current => ({
          items: [
            optimisticMessage,
            ...(current?.items.filter(
              message => message.clientMessageId !== variables.clientMessageId,
            ) ?? []),
          ],
          pageInfo: current?.pageInfo ?? {
            nextCursor: null,
            hasNextPage: false,
          },
        }));

        return { queryKey };
      },
      onError: (error, variables, context) => {
        if (context) {
          queryClient.setQueryData<MessagesResponse>(
            context.queryKey,
            current =>
              current && {
                ...current,
                items: current.items.filter(
                  message =>
                    message.clientMessageId !== variables.clientMessageId,
                ),
              },
          );
          void queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.messages.byConversation(conversationId),
          });
        }

        setMessage(current => current || variables.text);
        const message = isAxiosError(error)
          ? (error.response?.data?.message ?? error.message)
          : error.message;
        toast.error('Failed to send message', message || 'Please try again.');
      },
      onSuccess: () => {
        void queryClient
          .invalidateQueries({
            queryKey: QUERY_KEYS.messages.byConversation(conversationId),
          })
          .catch(error => console.warn('sent message refresh failed', error));
      },
    });

  const handleSendMessage = () => {
    if (!conversationId || isSendingMessage || !message.trim()) return;

    const text = message;
    mutateSendMessage({
      clientMessageId: Crypto.randomUUID(),
      text,
    });
    setMessage('');
  };

  const [nudge, setNudge] = useState(0);

  const forceRelayout = useCallback(() => {
    setNudge(1);
    requestAnimationFrame(() => setNudge(0));
  }, []);

  useEffect(() => forceRelayout(), [forceRelayout]);

  useEffect(() => {
    if (isConnected) {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.messages.byConversation(conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: ['receipts', conversationId],
      });
    }
  }, [isConnected, conversationId, queryClient]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener(
      Platform.select({
        ios: 'keyboardWillShow',
        android: 'keyboardDidShow',
        default: 'keyboardDidShow',
      })!,
      () => setKeyboardVisible(true),
    );

    const hideSubscription = Keyboard.addListener(
      Platform.select({
        ios: 'keyboardWillHide',
        android: 'keyboardDidHide',
        default: 'keyboardDidHide',
      })!,
      () => setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  useEffect(() => {
    mutate(
      {},
      {
        onSuccess: data => {
          setConvoResponse(data);
        },
        onError: () => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.dismissTo('/(tabs)/chats');
          }
        },
      },
    );
  }, [id, mutate, router, setConvoResponse]);

  return (
    <View className="flex-1 bg-primary-50 dark:bg-neutral-900">
      <ImageBackground
        source={BackgroundImage}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          className="flex-1"
          behavior="padding"
          keyboardVerticalOffset={8}
        >
          <View className="flex-1">
            <Header className="flex-row items-center justify-between gap-8 pb-4 pt-2">
              <View className="flex-row items-center gap-2">
                <PressableScale onPress={() => router.back()}>
                  <ArrowLeftIcon />
                </PressableScale>
                <View className="flex-row items-center gap-4">
                  <View className="size-12 overflow-hidden rounded-full border-2 border-white">
                    {convoResponse?.otherParticipant?.avatarUrl ? (
                      <Image
                        source={{
                          uri: convoResponse?.otherParticipant?.avatarUrl,
                        }}
                        className="size-full"
                      />
                    ) : (
                      <View className="size-full bg-gray-500/50" />
                    )}
                  </View>
                  <View className="gap-[1px]">
                    <TextCustom className="font-sf-pro-bold text-lg/[125%] !text-white">
                      {convoResponse?.otherParticipant?.displayName}
                    </TextCustom>
                    <TextCustom className="text-sm/[150%] tracking-[0.5px] !text-white/90">
                      {typing
                        ? 'typing…'
                        : online
                          ? 'Online'
                          : convoResponse?.lastActivityAt
                            ? `Active ${getTimeAgo(convoResponse.lastActivityAt)} ago`
                            : ''}
                    </TextCustom>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center gap-5">
                <PressableScale>
                  <VideoCameraIcon />
                </PressableScale>
                <PressableScale>
                  <PhoneIcon fill="white" size={24} />
                </PressableScale>
              </View>
            </Header>
            <View
              style={{
                paddingBottom: keyboardVisible ? undefined : bottom + nudge,
              }}

              className="flex-1"
            >
              <View className="flex-1 justify-between">
                {isPending ? (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator />
                  </View>
                ) : (
                  <Messages isKeyboardVisible={keyboardVisible} />
                )}
                {openShareBox && (
                  <BlurView
                    intensity={10}
                    tint={'dark'}
                    experimentalBlurMethod="dimezisBlurView"
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View className="gap-2 px-6">
                  {openShareBox && <ShareModal />}
                  <View
                    style={{
                      boxShadow: '0px 4px 24px 0px #27443105',
                    }}
                    className="flex-row items-end gap-1 rounded-[100px] bg-white p-2 dark:bg-neutral-700"
                  >
                    <PressableScale
                      onPress={() => setOpenShareBox(!openShareBox)}
                      style={{
                        padding: 8,
                        borderRadius: 999,
                        backgroundColor: openShareBox
                          ? colorScheme === 'dark'
                            ? Colors['dark'].neutral[600]
                            : Colors['light'].primary[50]
                          : undefined,
                      }}
                    >
                      <PaperClipIcon
                        stroke={
                          openShareBox
                            ? Colors[colorScheme ?? 'light'].primary[400]
                            : colorScheme === 'light'
                              ? Colors['light'].neutral[300]
                              : Colors['dark'].neutral[100]
                        }
                      />
                    </PressableScale>
                    <View className="flex-1 flex-row items-center self-center">
                      <TextInput
                        value={message}
                        onChangeText={t => {
                          setMessage(t);
                          onChangeText();
                        }}
                        selectionColor={
                          Colors[colorScheme ?? 'light'].primary[400]
                        }
                        placeholder="Write a message..."
                        placeholderTextColor={
                          colorScheme === 'dark'
                            ? Colors[colorScheme ?? 'light'].neutral[200]
                            : Colors[colorScheme ?? 'light'].neutral[300]
                        }
                        multiline
                        className="android:p-0 max-h-16 flex-1 font-sf-pro-display text-base/[150%] text-neutral-600 dark:text-white"
                      />
                    </View>
                    <PressableScale
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor:
                          Colors[colorScheme ?? 'light'].primary[400],
                      }}
                      disabled={
                        isSendingMessage || !conversationId || !message.trim()
                      }
                      onPress={handleSendMessage}
                    >
                      <PaperAirplaneIcon />
                    </PressableScale>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </View>
  );
};

export default ChatUIScreen;
