import PlusIcon from '@/assets/icons/jsx/Icon/plus-icon';
import IconButton from '@/components/ui/icon-button';
import { Colors } from '@/constants/theme';
import { useState } from 'react';
import { useColorScheme, View } from 'react-native';
import EmptyState from './empty-state';
import PinCodeModal from './modal/pin-code';

const ChatsScreen = () => {
  const colorScheme = useColorScheme();
  const [openModal, setOpenModal] = useState(true);

  return (
    <>
      <EmptyState />
      <PinCodeModal openModal={openModal} onSetOpenModal={setOpenModal} />
      <View>
        <IconButton
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            backgroundColor: Colors[colorScheme ?? 'light'].primary[400],
            borderWidth: 0,
            position: 'absolute',
            bottom: 24,
            right: 24,
            boxShadow: '0px 6px 16px 0px #0C291D1F',
          }}
          onPress={() => {}}
        >
          <PlusIcon />
        </IconButton>
      </View>
    </>
  );
};

export default ChatsScreen;
