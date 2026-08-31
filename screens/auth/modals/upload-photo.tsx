import CameraSVG from '@/assets/icons/camera-icon.svg';
import CameraIcon from '@/assets/icons/jsx/camera-icon';
import PhotographIcon from '@/assets/icons/photograph-icon.svg';
import TextCustom from '@/components/ui/text';
import { LegendList } from '@legendapp/list/react-native';
import { queryOptions, useQuery } from '@tanstack/react-query';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import {
  launchCameraAsync,
  PermissionStatus,
  useCameraPermissions,
} from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { QUERIES } from '../lib/queries';
import { QUERY_KEYS } from '../lib/queries/key-factory';
import { usePhotoControlStore } from '../store/photo-control-store';

const getPhotos = (first?: number) => {
  return queryOptions({
    queryKey: QUERY_KEYS.photos.some(first),
    queryFn: () => QUERIES.getPhotos(first),
  });
};

const getLocalUri = (id: string) => {
  return queryOptions({
    queryKey: QUERY_KEYS.photos.byId(id),
    queryFn: () => QUERIES.getLocalUri(id),
    enabled: !!id,
  });
};

const UploadPhotoModal = (props: {
  openModal: boolean;
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { openModal, setOpenModal } = props;
  const colorScheme = useColorScheme();
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const { setPhotoUri } = usePhotoControlStore();

  const { data, isPending, isError } = useQuery({ ...getPhotos(10) });

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, []);

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      setOpenModal(false);
    }
  };

  const [cameraPermissionInformation, requestCameraPermission] =
    useCameraPermissions();

  const verifyPermissions = async () => {
    if (cameraPermissionInformation?.status === PermissionStatus.UNDETERMINED) {
      const resp = await requestCameraPermission();

      return resp.granted;
    }
    if (cameraPermissionInformation?.status === PermissionStatus.DENIED) {
      Alert.alert(
        'Insufficient Permissions',
        'You need to grant camera permissions to use this app',
      );

      return false;
    }

    return true;
  };

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;
    const image = await launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });
    if (image.assets) {
      setPhotoUri(image.assets[0].uri);
      setOpenModal(false);
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
      setPhotoUri(data?.localUri!!);
      setOpenModal(false);
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
    <Modal
      animationType="fade"
      transparent
      visible={openModal}
      onRequestClose={() => setOpenModal(false)}
    >
      <BlurView
        intensity={10}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      >
        <Pressable
          onPress={() => setOpenModal(false)}
          className="flex-1 items-center justify-end bg-neutral-900/[24%] px-6 pb-[2.625rem]"
        >
          <Pressable
            onPress={() => {}}
            style={{
              boxShadow:
                '0px 3px 8px 0px #18342103, 0px 6px 16px 0px #0C291D05',
            }}
            className="w-full rounded-2xl bg-white dark:bg-neutral-700"
          >
            <View className="gap-2 py-2">
              {isPending ? (
                <View className="flex-row">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <View
                      key={index}
                      className="size-16 items-center justify-center"
                    >
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
              <View className="px-2">
                <Pressable
                  onPress={takeImageHandler}
                  className="flex-row items-center gap-4 px-2 py-[10px]"
                >
                  <CameraSVG />
                  <TextCustom className="font-sf-pro-medium leading-[150%]">
                    Take Photo
                  </TextCustom>
                </Pressable>
                <Pressable
                  onPress={pickImageAsync}
                  className="flex-row items-center gap-4 px-2 py-[10px]"
                >
                  <PhotographIcon />
                  <TextCustom className="font-sf-pro-medium leading-[150%] ">
                    Choose From Library
                  </TextCustom>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
};

export default UploadPhotoModal;
