import ChatIcon from '@/assets/icons/jsx/chat-icon';
import PlusIcon from '@/assets/icons/jsx/plus-icon';
import UserCircleIcon from '@/assets/icons/jsx/user-circle-icon';
import UserGroupIcon from '@/assets/icons/jsx/user-group-icon';
import IconButton from '@/components/ui/icon-button';
import { Colors } from '@/constants/theme';
import { Link } from 'expo-router';
import { PressableScale } from 'pressto';
import { StyleSheet, TextStyle, useColorScheme, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useBlurControlStore } from '../store/blur-control';

const FloatingActionButton = () => {
  const colorScheme = useColorScheme();
  const { setBlurView } = useBlurControlStore();
  const newChat = useSharedValue(30);
  const newContact = useSharedValue(30);
  const newGroup = useSharedValue(30);
  const newChatWidth = useSharedValue(48);
  const newContactWidth = useSharedValue(48);
  const newGroupWidth = useSharedValue(48);
  const opacity = useSharedValue(0);
  const isOpen = useSharedValue(false);

  const progress = useDerivedValue(() =>
    isOpen.value ? withTiming(1) : withTiming(0),
  );

  const handlePress = () => {
    const config = {
      easing: Easing.bezier(0.68, -0.6, 0.32, 1.6),
      duration: 300,
    };

    if (isOpen.value) {
      newGroupWidth.value = withTiming(56, { duration: 100 }, finish => {
        if (finish) {
          newChat.value = withTiming(30, config);
        }
      });
      newContactWidth.value = withTiming(56, { duration: 100 }, finish => {
        if (finish) {
          newContact.value = withDelay(50, withTiming(30, config));
        }
      });
      newChatWidth.value = withTiming(56, { duration: 100 }, finish => {
        if (finish) {
          newGroup.value = withDelay(100, withTiming(30, config));
        }
      });
      opacity.value = withTiming(0, { duration: 100 });
    } else {
      newGroup.value = withDelay(200, withSpring(104));
      newContact.value = withDelay(100, withSpring(170));
      newChat.value = withSpring(236);
      newGroupWidth.value = withDelay(600, withSpring(160));
      newContactWidth.value = withDelay(500, withSpring(160));
      newChatWidth.value = withDelay(400, withSpring(160));
      opacity.value = withDelay(700, withSpring(1));
    }
    isOpen.value = !isOpen.value;
    setBlurView(!isOpen.value);
  };

  const opacityText = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const chatWidthStyle = useAnimatedStyle(() => {
    return {
      width: newChatWidth.value,
    };
  });

  const newChatIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      newChat.value,
      [30, 236],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      bottom: newChat.value,
      transform: [{ scale: scale }],
    };
  });

  const contactWidthStyle = useAnimatedStyle(() => {
    return {
      width: newContactWidth.value,
    };
  });

  const newContactIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      newContact.value,
      [30, 170],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      bottom: newContact.value,
      transform: [{ scale: scale }],
    };
  });

  const groupWidthStyle = useAnimatedStyle(() => {
    return {
      width: newGroupWidth.value,
    };
  });

  const newGroupIcon = useAnimatedStyle(() => {
    const scale = interpolate(
      newGroup.value,
      [30, 104],
      [0, 1],
      Extrapolation.CLAMP,
    );

    return {
      bottom: newGroup.value,
      transform: [{ scale: scale }],
    };
  });

  const plusIcon = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `-${progress.value * 45}deg` }],
    };
  });

  return (
    <>
      <Animated.View style={[styles.actionButton, newChatIcon, chatWidthStyle]}>
        <Link href="/(form-sheets)/contact" push asChild>
          <FloatingCards
            icon={<ChatIcon size={24} />}
            label="New Chat"
            style={opacityText}
          />
        </Link>
      </Animated.View>
      <Animated.View
        style={[styles.actionButton, newContactIcon, contactWidthStyle]}
      >
        <FloatingCards
          icon={<UserCircleIcon />}
          label="New Contact"
          onPress={() => handlePress()}
          style={opacityText}
        />
      </Animated.View>
      <Animated.View
        style={[styles.actionButton, newGroupIcon, groupWidthStyle]}
      >
        <FloatingCards
          icon={<UserGroupIcon size={24} />}
          label="New group"
          onPress={() => {}}
          style={opacityText}
        />
      </Animated.View>
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
        onPress={() => handlePress()}
      >
        <Animated.View style={[plusIcon]}>
          <PlusIcon />
        </Animated.View>
      </IconButton>
    </>
  );
};

export default FloatingActionButton;

const FloatingCards = (props: {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  style?: TextStyle;
}) => {
  const { icon, label, onPress, style } = props;
  const colorScheme = useColorScheme();

  return (
    <PressableScale
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 100,
        backgroundColor:
          colorScheme === 'dark' ? Colors.dark.neutral[700] : '#fff',
        padding: 4,
        boxShadow: '0px 6px 16px 0px #0C291D05',
      }}
    >
      <View className="items-center justify-center rounded-full p-3">
        {icon}
      </View>
      <Animated.Text
        style={style}
        className="font-sf-pro-medium text-lg/[125%] text-neutral-600 dark:text-white"
      >
        {label}
      </Animated.Text>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    position: 'absolute',
    justifyContent: 'flex-start',
    bottom: 104,
    right: 24,
    width: 56,
    height: 56,
  },
});
