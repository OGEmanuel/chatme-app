import CameraIcon from '@/assets/icons/jsx/camera-icon';
import PhotographIcon from '@/assets/icons/jsx/photograph-icon';
import AndroidSheetGrabber from '@/components/android-sheet-grabber';
import TextCustom from '@/components/ui/text';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { useEffect } from 'react';
import { Alert, Pressable, View } from 'react-native';

const EditProfilePictureScreen = () => {
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [cameraPermissionInformation, requestCameraPermission] =
    ImagePicker.useCameraPermissions();

  useEffect(() => {
    if (!permissionResponse?.granted) {
      requestPermission();
    }
  }, []);

  const verifyPermissions = async () => {
    if (
      cameraPermissionInformation?.status ===
      MediaLibrary.PermissionStatus.UNDETERMINED
    ) {
      const resp = await requestCameraPermission();

      return resp.granted;
    }
    if (
      cameraPermissionInformation?.status ===
      MediaLibrary.PermissionStatus.DENIED
    ) {
      Alert.alert(
        'Insufficient Permissions',
        'You need to grant camera permissions to use this app',
      );

      return false;
    }

    return true;
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

  const takeImageHandler = async () => {
    const hasPermission = await verifyPermissions();
    if (!hasPermission) return;
    const image = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });
    if (image.assets) {
      //   setPhotoUri(image.assets[0].uri);
      //   setOpenModal(false);
    }
  };

  return (
    <View>
      <AndroidSheetGrabber />
      <View className="ios:pt-10 gap-6 px-6">
        <TextCustom className="text-center font-sf-pro-bold text-xl/5 leading-[125%]">
          Profile picture
        </TextCustom>
        <View>
          <Pressable
            onPress={takeImageHandler}
            className="flex-row items-center gap-4 py-[10px]"
          >
            <CameraIcon />
            <TextCustom className="font-sf-pro-medium leading-[150%]">
              Take Photo
            </TextCustom>
          </Pressable>
          <Pressable
            onPress={pickImageAsync}
            className="flex-row items-center gap-4 py-[10px]"
          >
            <PhotographIcon />
            <TextCustom className="font-sf-pro-medium leading-[150%] ">
              Choose From Library
            </TextCustom>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default EditProfilePictureScreen;
