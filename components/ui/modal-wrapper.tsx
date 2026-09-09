import { cn } from '@/lib/utils';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, ViewStyle } from 'react-native';

const ModalWrapper = (props: {
  openModal: boolean;
  onSetOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  outerPressableClassName?: string;
  innerPressableClassName?: string;
  innerPressableStyle?: ViewStyle;
  children: React.ReactNode;
}) => {
  const {
    openModal,
    onSetOpenModal,
    outerPressableClassName,
    innerPressableClassName,
    innerPressableStyle,
    children,
  } = props;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={openModal}
      onRequestClose={() => onSetOpenModal(false)}
    >
      <BlurView
        intensity={10}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={StyleSheet.absoluteFill}
      >
        <Pressable
          onPress={() => onSetOpenModal(false)}
          className={cn('flex-1', outerPressableClassName)}
        >
          <Pressable
            onPress={() => {}}
            style={innerPressableStyle}
            className={innerPressableClassName}
          >
            {children}
          </Pressable>
        </Pressable>
      </BlurView>
    </Modal>
  );
};

export default ModalWrapper;
