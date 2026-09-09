import LockClosedIcon from '@/assets/icons/jsx/Icon/lock-closed-icon';
import Button from '@/components/ui/button';
import ModalWrapper from '@/components/ui/modal-wrapper';
import TextCustom from '@/components/ui/text';
import { useRouter } from 'expo-router';
import { useColorScheme, View } from 'react-native';

const PinCodeModal = (props: {
  openModal: boolean;
  onSetOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { openModal, onSetOpenModal } = props;
  const colorScheme = useColorScheme();
  const router = useRouter();

  const handlePress = () => {
    onSetOpenModal(false);
    router.push('/setup-pin');
  };

  return (
    <ModalWrapper
      openModal={openModal}
      onSetOpenModal={onSetOpenModal}
      innerPressableClassName="flex-1"
    >
      <View className="flex-1 items-center justify-center px-6">
        <View className="relative max-w-[20.5625rem] rounded-2xl bg-white px-6 pb-6 pt-14 dark:bg-neutral-700">
          <View
            style={{
              boxShadow:
                colorScheme === 'light'
                  ? '0px 4px 24px 0px #0E141D0A'
                  : undefined,
            }}
            className="absolute -top-8 left-1/2 size-16 items-center justify-center rounded-2xl bg-white dark:bg-neutral-600"
          >
            <LockClosedIcon />
          </View>
          <View className="gap-7">
            <View className="items-center gap-2">
              <TextCustom className="text-center font-sf-pro-bold text-xl/[125%]">
                Do you want to add a pin code?
              </TextCustom>
              <TextCustom className="max-w-[17.5625rem] text-center font-sf-pro-display text-sm/[150%] tracking-[0.5px] text-neutral-300 dark:text-neutral-200">
                Add a verification code to make it more secure.
              </TextCustom>
            </View>
            <View className="gap-2">
              <Button label="Yes" onPress={handlePress} />
              <Button
                label="No, thanks"
                variant="secondary"
                onPress={() => onSetOpenModal(false)}
              />
            </View>
          </View>
        </View>
      </View>
    </ModalWrapper>
  );
};

export default PinCodeModal;
