import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import Button from '@/components/ui/button';
import IconButton from '@/components/ui/icon-button';
import TextCustom from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircularProgress } from './assets/icons/jsx/animated-circle';
import UploadIcon from './assets/icons/upload-icon.svg';
import IllustrationDark from './assets/icons/upload-illustration-dark.svg';
import Illustration from './assets/icons/upload-illustration.svg';
import UploadImageIcon from './assets/icons/upload-image-icon.svg';
import UploadPhotoModal from './modals/upload-photo';
import { usePhotoControlStore } from './store/photo-control-store';
import { useAuthStore } from './store/auth-store';
import { track } from '@/lib/analytics';

const UploadScreen = () => {
  const colorScheme = useColorScheme();
  const [openModal, setOpenModal] = useState(false);
  const { photoUri } = usePhotoControlStore();
  const router = useRouter();
  const completeOnboarding = useAuthStore(state => state.completeOnboarding);
  const consumePendingDestination = useAuthStore(
    state => state.consumePendingDestination,
  );
  const pendingDestination = useAuthStore(state => state.pendingDestination);
  const clearPhotoUri = usePhotoControlStore(state => state.clearPhotoUri);
  const [finishing, setFinishing] = useState(false);

  const finishOnboarding = (skipPhoto: boolean) => {
    if (finishing) return;
    setFinishing(true);
    completeOnboarding();
    if (skipPhoto) clearPhotoUri();
    track('onboarding_completed');
    if (pendingDestination) {
      consumePendingDestination();
      router.replace({
        pathname: pendingDestination.pathname as '/chat/[id]',
        params: {
          id: pendingDestination.params?.id ?? '',
          ...(pendingDestination.params?.target
            ? { target: pendingDestination.params.target }
            : {}),
        },
      });
    } else {
      router.replace('/(tabs)/chats');
    }
  };

  const handlePress = () => {
    if (photoUri) {
      finishOnboarding(true);
    } else {
      setOpenModal(true);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 gap-6 px-6 pb-2 pt-3">
        <IconButton onPress={() => router.back()}>
          <ArrowLeftIcon stroke={colorScheme === 'dark' ? 'white' : 'black'} />
        </IconButton>
        <View className="flex-1 justify-between">
          <View className="items-center">
            <TextCustom className="font-sf-pro-bold text-2xl/[125%]">
              Upload a photo
            </TextCustom>
          </View>
          <View className="gap-4">
            {photoUri ? (
              <View className="size-[8.25rem] items-center self-center rounded-full">
                <View className="size-full overflow-hidden rounded-full">
                  <Image source={{ uri: photoUri }} className="size-full" />
                </View>
              </View>
            ) : (
              <View className="relative items-center self-center ">
                <View className="absolute right-0 top-0 z-10">
                  <UploadImageIcon />
                </View>
                {colorScheme === 'light' ? (
                  <Illustration />
                ) : (
                  <IllustrationDark />
                )}
                <View className="absolute top-[4rem] items-center justify-center rounded-full bg-white">
                  <View className="absolute top-[27%]">
                    <UploadIcon />
                  </View>
                  <CircularProgress progress={1} size={48} color="#57B77D" />
                </View>
              </View>
            )}
            <TextCustom className="w-[11.625rem] self-center text-center font-sf-pro-medium leading-[150%] text-neutral-200">
              {photoUri
                ? 'Photo selected locally. Upload is not completed.'
                : 'Select a photo or continue without one.'}
            </TextCustom>
          </View>
          <Button
            label={photoUri ? 'Continue without photo' : 'Select Photo'}
            onPress={handlePress}
          />
          <Pressable
            accessibilityRole="button"
            disabled={finishing}
            onPress={() => finishOnboarding(true)}
          >
            <TextCustom className="text-center font-sf-pro-medium text-primary-400">
              Skip for now
            </TextCustom>
          </Pressable>
          <UploadPhotoModal openModal={openModal} setOpenModal={setOpenModal} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UploadScreen;
