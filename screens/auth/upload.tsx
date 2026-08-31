import Button from '@/components/ui/button';
import TextCustom from '@/components/ui/text';
import { useState } from 'react';
import { Image, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CircularProgress } from './assets/icons/jsx/animated-circle';
import UploadCheckIcon from './assets/icons/upload-check-icon.svg';
import UploadIcon from './assets/icons/upload-icon.svg';
import IllustrationDark from './assets/icons/upload-illustration-dark.svg';
import Illustration from './assets/icons/upload-illustration.svg';
import UploadImageIcon from './assets/icons/upload-image-icon.svg';
import { AuthBackButton } from './components/layout-wrapper';
import UploadPhotoModal from './modals/upload-photo';
import { usePhotoControlStore } from './store/photo-control-store';

const UploadScreen = () => {
  const colorScheme = useColorScheme();
  const [openModal, setOpenModal] = useState(false);
  const { photoUri } = usePhotoControlStore();

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 gap-6 px-6 pb-2 pt-3">
        <AuthBackButton />
        <View className="flex-1 justify-between">
          <View className="items-center">
            <TextCustom className="font-sf-pro-bold text-2xl/[125%]">
              Upload a photo
            </TextCustom>
          </View>
          <View className="gap-4">
            {photoUri ? (
              <View className="size-[8.25rem] items-center self-center rounded-full">
                <View className="absolute right-0 top-0 z-10">
                  <UploadCheckIcon />
                </View>
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
                ? 'Done! Your photo successfully uploaded'
                : 'Wait a second, your photo still uploading'}
            </TextCustom>
          </View>
          <Button
            label={photoUri ? 'Next' : 'Upload Photo'}
            onPress={() => setOpenModal(true)}
          />
          <UploadPhotoModal openModal={openModal} setOpenModal={setOpenModal} />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default UploadScreen;
