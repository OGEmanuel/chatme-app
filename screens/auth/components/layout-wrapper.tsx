import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import {
  KeyboardAvoidingView,
  ScrollView,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const AuthLayoutWrapper = (props: { children: React.ReactNode }) => {
  const { children } = props;

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={24}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-1"
          className="flex-1"
          keyboardShouldPersistTaps="handled"
        >
          <View className={cn('flex-1 justify-between px-6 pt-16')}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AuthLayoutWrapper;

export const AuthLayoutInnerWrapper = (props: {
  children: React.ReactNode;
}) => {
  const { children } = props;
  return <View className="gap-6">{children}</View>;
};

export const AuthLayoutHeader = (props: {
  header: string;
  children: React.ReactNode;
  canGoBack?: boolean;
  descriptionClassName?: string;
}) => {
  const { header, children, canGoBack, descriptionClassName } = props;
  const router = useRouter();
  const colorScheme = useColorScheme();

  return (
    <>
      {canGoBack && (
        <PressableScale
          style={{
            width: 40,
            height: 40,
            borderWidth: 1,
            borderColor: Colors.light.other.divider,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => router.back()}
        >
          <ArrowLeftIcon stroke={colorScheme === 'dark' ? 'white' : 'black'} />
        </PressableScale>
      )}
      <View className="gap-3">
        <TextCustom className="font-sf-pro-bold text-2xl/[125%]">
          {header}
        </TextCustom>
        <TextCustom
          className={cn(
            'text-sm/[150%] -tracking-tighter !text-neutral-200',
            descriptionClassName,
          )}
        >
          {children}
        </TextCustom>
      </View>
    </>
  );
};
