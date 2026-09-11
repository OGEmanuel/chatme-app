import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import ChatsView from './chats-view';
import FloatingActionButton from './modal/floating-action-button';
import PinCodeModal from './modal/pin-code';
import { useBlurControlStore } from './store/blur-control';

const ChatsScreen = () => {
  const colorScheme = useColorScheme();
  const [openModal, setOpenModal] = useState(false);
  const { blurView } = useBlurControlStore();

  return (
    <>
      {/* <EmptyState /> */}
      <ChatsView />
      {blurView && (
        <BlurView
          intensity={10}
          tint={'dark'}
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
      )}
      <PinCodeModal openModal={openModal} onSetOpenModal={setOpenModal} />
      <FloatingActionButton />
    </>
  );
};

export default ChatsScreen;
