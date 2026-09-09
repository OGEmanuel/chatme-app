import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import IconButton from '@/components/ui/icon-button';
import TextCustom from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
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
          <View className={cn('flex-1 justify-between px-6')}>{children}</View>
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
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { header, children, canGoBack, descriptionClassName } = props;

  return (
    <>
      {canGoBack && (
        <IconButton onPress={() => router.back()}>
          <ArrowLeftIcon stroke={colorScheme === 'dark' ? 'white' : 'black'} />
        </IconButton>
      )}
      <View className={cn('gap-3', !canGoBack && 'pt-16')}>
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
