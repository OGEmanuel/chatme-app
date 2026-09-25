import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import PaperAirplaneIcon from '@/assets/icons/jsx/paper-airplane-icon';
import PaperClipIcon from '@/assets/icons/jsx/paper-clip-icon';
import PhoneIcon from '@/assets/icons/jsx/phone-icon';
import VideoCameraIcon from '@/assets/icons/jsx/video-camera-icon';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import { useCallback, useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/header';
import Messages from './messages';
import ShareModal from './share-modal';

const ChatUIScreen = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { bottom } = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [openShareBox, setOpenShareBox] = useState(false);
  const BackgroundImage =
    colorScheme === 'dark'
      ? require('../../assets/images/chat-bg-dark.png')
      : require('../../assets/images/chat-bg.png');

  const [nudge, setNudge] = useState(0);

  const forceRelayout = useCallback(() => {
    setNudge(1);
    requestAnimationFrame(() => setNudge(0));
  }, []);

  useEffect(() => forceRelayout(), []);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
                    <Image
                      source={{
                        uri: 'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789050188/5461e70468f6aad5bf2b2bd3ade5a1b66e214ffe_awjwhk.png',
                      }}
                      className="size-full"
                    />
                  </View>
                  <View className="gap-[1px]">
                    <TextCustom className="font-sf-pro-bold text-lg/[125%] !text-white">
                      Keanu Murphy
                    </TextCustom>
                    <TextCustom className="text-sm/[150%] tracking-[0.5px] !text-white/90">
                      Active 5 minutes ago
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
                <Messages isKeyboardVisible={keyboardVisible} />
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
                        onChangeText={setMessage}
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
