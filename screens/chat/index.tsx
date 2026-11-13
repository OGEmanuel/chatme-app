import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import PaperAirplaneIcon from '@/assets/icons/jsx/paper-airplane-icon';
import PaperClipIcon from '@/assets/icons/jsx/paper-clip-icon';
import PhoneIcon from '@/assets/icons/jsx/phone-icon';
import VideoCameraIcon from '@/assets/icons/jsx/video-camera-icon';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/screens/auth/store/auth-store';
import { useQueryClient } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/header';
import type { Conversation } from '../home/chats/lib/queries/type';
import { MUTATIONS, QUERIES } from './lib/queries';
import { QUERY_KEYS } from './lib/queries/key-factory';
import type { ConversationResponse } from './lib/queries/types';
import { useMessageDelivery } from './lib/hooks/use-message-delivery';
import { useConversationSubscription } from './lib/sockets/use-conversation-realtime';
import { useMessageSync } from './lib/sockets/use-message-sync';
import { useTypingEmitter } from './lib/sockets/use-type-emitter';
import {
  useIsOnline,
  useIsTyping,
  useSocketStore,
} from './lib/store/sockets-control-store';
import { getTimeAgo } from './lib/utils';
import Messages from './messages';
import ShareModal from './share-modal';

type Destination = Conversation | ConversationResponse;

const ChatUIScreen = () => {
  const { id, target } = useLocalSearchParams<{
    id: string;
    target?: string;
  }>();
  const router = useRouter();
  const routeTarget = target ?? 'user';
  const userId = useAuthStore(state => state.userId);
  const sessionGeneration = useAuthStore(state => state.sessionGeneration);
  const [destinationEntry, setDestinationEntry] = useState<{
    key: string;
    destination: Destination;
  } | null>(null);
  const [resolutionErrorKey, setResolutionErrorKey] = useState<string | null>(
    null,
  );
  const [resolutionAttempt, setResolutionAttempt] = useState(0);
  const resolutionSequence = useRef(0);
  const destinationKey = `${routeTarget}:${id}:${sessionGeneration}`;
  const destination =
    destinationEntry?.key === destinationKey
      ? destinationEntry.destination
      : null;
  const hasResolutionError = resolutionErrorKey === destinationKey;
  const isConnected = useSocketStore(s => s.isConnected);
  const conversationId = destination?.id ?? '';
  const destinationUserId =
    destination && 'otherParticipant' in destination
      ? destination.otherParticipant?.id
      : undefined;
  const online = useIsOnline(conversationId, destinationUserId);
  const typing = useIsTyping(conversationId, destinationUserId);
  const { onChangeText } = useTypingEmitter(conversationId);
  useConversationSubscription(conversationId);
  useMessageSync(conversationId);
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [openShareBox, setOpenShareBox] = useState(false);
  const delivery = useMessageDelivery(
    conversationId,
    userId,
    sessionGeneration,
  );

  const BackgroundImage =
    colorScheme === 'dark'
      ? require('../../assets/images/chat-bg-dark.png')
      : require('../../assets/images/chat-bg.png');

  const handleSendMessage = () => {
    if (
      !destination ||
      !conversationId ||
      !userId ||
      delivery.isSending ||
      !message.trim()
    ) {
      return;
    }
    if (delivery.send(message)) setMessage('');
  };

  const handleRetryResolution = () => {
    setResolutionErrorKey(null);
    setResolutionAttempt(attempt => attempt + 1);
  };

  const [nudge, setNudge] = useState(0);

  const forceRelayout = useCallback(() => {
    setNudge(1);
    requestAnimationFrame(() => setNudge(0));
  }, []);

  useEffect(() => forceRelayout(), [forceRelayout]);

  useEffect(() => {
    if (!isConnected || !conversationId) return;
    void queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.messages.byConversation(conversationId),
    });
    void queryClient.invalidateQueries({
      queryKey: ['receipts', conversationId],
    });
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
    const sequence = ++resolutionSequence.current;
    const controller = new AbortController();
    const generation = sessionGeneration;

    if (!id || !userId || !['user', 'conversation'].includes(routeTarget)) {
      setResolutionErrorKey(destinationKey);
      return () => controller.abort();
    }

    setResolutionErrorKey(null);
    const resolve = async () => {
      try {
        const result =
          routeTarget === 'conversation'
            ? await QUERIES.getConversation(id, controller.signal)
            : await MUTATIONS.createConvo(
                { participantId: id },
                controller.signal,
              );
        if (
          controller.signal.aborted ||
          sequence !== resolutionSequence.current ||
          useAuthStore.getState().sessionGeneration !== generation
        ) {
          return;
        }
        setDestinationEntry({ key: destinationKey, destination: result });
      } catch {
        if (
          !controller.signal.aborted &&
          sequence === resolutionSequence.current &&
          useAuthStore.getState().sessionGeneration === generation
        ) {
          setResolutionErrorKey(destinationKey);
        }
      }
    };

    void resolve();
    return () => {
      controller.abort();
      if (resolutionSequence.current === sequence) {
        resolutionSequence.current += 1;
      }
    };
  }, [
    destinationKey,
    id,
    resolutionAttempt,
    routeTarget,
    sessionGeneration,
    userId,
  ]);

  const conversationName = destination
    ? 'name' in destination
      ? destination.name
      : 'otherParticipant' in destination
        ? destination.otherParticipant?.displayName
        : undefined
    : undefined;
  const conversationAvatar = destination
    ? 'avatarUrl' in destination
      ? destination.avatarUrl
      : 'otherParticipant' in destination
        ? destination.otherParticipant?.avatarUrl
        : null
    : null;

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
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel="Go back"
                  onPress={() => router.back()}
                >
                  <ArrowLeftIcon />
                </PressableScale>
                <View className="flex-row items-center gap-4">
                  <View className="size-12 overflow-hidden rounded-full border-2 border-white">
                    {conversationAvatar ? (
                      <Image
                        source={{ uri: conversationAvatar }}
                        className="size-full"
                      />
                    ) : (
                      <View className="size-full bg-gray-500/50" />
                    )}
                  </View>
                  <View className="gap-[1px]">
                    <TextCustom className="font-sf-pro-bold text-lg/[125%] !text-white">
                      {conversationName ?? 'Conversation'}
                    </TextCustom>
                    <TextCustom className="text-sm/[150%] tracking-[0.5px] !text-white/90">
                      {typing
                        ? 'typing…'
                        : online
                          ? 'Online'
                          : destination?.lastActivityAt
                            ? `Active ${getTimeAgo(destination.lastActivityAt)} ago`
                            : ''}
                    </TextCustom>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center gap-5">
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel="Start video call"
                >
                  <VideoCameraIcon />
                </PressableScale>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel="Start voice call"
                >
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
                {destination ? (
                  <Messages
                    conversationId={conversationId}
                    isKeyboardVisible={keyboardVisible}
                    pendingMessages={delivery.pendingMessages}
                    onRetry={delivery.retry}
                  />
                ) : hasResolutionError ? (
                  <View className="flex-1 items-center justify-center gap-4 px-8">
                    <TextCustom className="text-center">
                      This conversation is unavailable or you don’t have access.
                    </TextCustom>
                    <Pressable onPress={handleRetryResolution}>
                      <TextCustom className="font-sf-pro-bold text-primary-400">
                        Try again
                      </TextCustom>
                    </Pressable>
                    <Pressable
                      onPress={() => router.dismissTo('/(tabs)/chats')}
                    >
                      <TextCustom className="text-neutral-300">
                        Return to chats
                      </TextCustom>
                    </Pressable>
                  </View>
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <ActivityIndicator />
                  </View>
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
                      accessibilityRole="button"
                      accessibilityLabel={
                        openShareBox ? 'Close attachments' : 'Add attachment'
                      }
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
                        editable={!!destination}
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
                        delivery.isSending ||
                        !destination ||
                        !conversationId ||
                        !message.trim()
                      }
                      accessibilityRole="button"
                      accessibilityLabel="Send message"
                      accessibilityState={{
                        disabled:
                          delivery.isSending ||
                          !destination ||
                          !conversationId ||
                          !message.trim(),
                        busy: delivery.isSending,
                      }}
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
