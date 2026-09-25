import CameraIcon from '@/assets/icons/jsx/camera-icon';
import DocumentIcon from '@/assets/icons/jsx/document-icon';
import LocationMarkerIcon from '@/assets/icons/jsx/location-marker-icon';
import UserCircleIcon from '@/assets/icons/jsx/user-circle-icon';
import PhotographIcon from '@/assets/icons/photograph-icon.svg';
import TextCustom from '@/components/ui/text';
import { getLocalUri, getPhotos } from '@/lib/utils';
import { LegendList } from '@legendapp/list/react-native';
import { useQuery } from '@tanstack/react-query';
import * as Contacts from 'expo-contacts';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Link } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Pressable,
  useColorScheme,
  View,
} from 'react-native';

const ShareModal = () => {
  const { data, isPending, isError } = useQuery({ ...getPhotos(10) });
  const colorScheme = useColorScheme();

  const pickContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();

    if (status !== 'granted') {
      return;
    }

    const result = await Contacts.presentContactPickerAsync();

    if (result) {
      console.log(result);
    }
  };

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      //   setPhotoUri(result.assets[0].uri);
      //   setOpenModal(false);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (!result.canceled) {
      const file = result.assets[0];

      console.log(file);
      // {
      //   uri,
      //   name,
      //   size,
      //   mimeType,
      //   lastModified,
      // }
    }
  };

  const RenderPhotos = ({
    asset,
    index,
  }: {
    asset: MediaLibrary.Asset;
    index: number;
  }) => {
    const { data } = useQuery({ ...getLocalUri(asset.id) });

    const handleSelectImage = () => {
      //   setPhotoUri(data?.localUri!!);
      //   setOpenModal(false);
    };

    return (
      <Pressable
        onPress={handleSelectImage}
        className="relative size-16 overflow-hidden rounded-lg"
      >
        {index === 0 && (
          <View className="absolute inset-0 z-10 size-full items-center justify-center bg-neutral-900/40">
            <CameraIcon fill="white" size="32" />
          </View>
        )}
        <Image source={{ uri: data?.localUri }} className="size-full" />
      </Pressable>
    );
  };

  return (
    <View
      style={{
        boxShadow: '0px 3px 8px 0px #18342103',
      }}
      className="w-full gap-2 rounded-2xl bg-white py-2 dark:bg-neutral-700"
    >
      {isPending ? (
        <View className="flex-row">
          {Array.from({ length: 5 }).map((_, index) => (
            <View key={index} className="size-16 items-center justify-center">
              <ActivityIndicator
                size="small"
                color={colorScheme === 'dark' ? 'white' : 'black'}
              />
            </View>
          ))}
        </View>
      ) : isError ? null : (
        <LegendList
          data={data}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          contentContainerStyle={{ gap: 8 }}
          contentContainerClassName="px-2"
          recycleItems={true}
          renderItem={({ item, index }) => (
            <RenderPhotos asset={item} index={index} />
          )}
        />
      )}

      <View>
        <Pressable
          onPress={pickImageAsync}
          className="flex-row items-center gap-4 px-2 py-[10px]"
        >
          <PhotographIcon />
          <TextCustom className="font-sf-pro-medium leading-[150%]">
            Photo or Gallery
          </TextCustom>
        </Pressable>
        <Pressable
          onPress={pickDocument}
          className="flex-row items-center gap-4 px-2 py-[10px]"
        >
          <DocumentIcon />
          <TextCustom className="font-sf-pro-medium leading-[150%]">
            Document
          </TextCustom>
        </Pressable>
        <Link href="/(form-sheets)/map" push asChild>
          <Pressable className="flex-row items-center gap-4 px-2 py-[10px]">
            <LocationMarkerIcon />
            <TextCustom className="font-sf-pro-medium leading-[150%]">
              Location
            </TextCustom>
          </Pressable>
        </Link>
        <Pressable
          onPress={pickContact}
          className="flex-row items-center gap-4 px-2 py-[10px]"
        >
          <UserCircleIcon size={20} />
          <TextCustom className="font-sf-pro-medium leading-[150%]">
            Contact
          </TextCustom>
        </Pressable>
      </View>
    </View>
  );
};

export default ShareModal;
