import Logo from '@/assets/icons/logo-icon.svg';
import Button from '@/components/ui/button';
import TextCustom from '@/components/ui/text';
import { Link } from 'expo-router';
import { Image, useColorScheme, View } from 'react-native';

const OnboardingScreen = () => {
  const colorScheme = useColorScheme();
  const image =
    colorScheme === 'light'
      ? require('../onboarding/assets/images/illustration.png')
      : require('../onboarding/assets/images/illustration-dark.png');

  return (
    <View className="flex-1">
      <View
        style={{
          experimental_backgroundImage:
            colorScheme === 'light'
              ? 'linear-gradient(0.77deg, #F2FFF6 0.67%, rgba(250, 255, 251, 0.4) 130.83%)'
              : undefined,
        }}
        className="h-[60%] justify-between pt-[10rem] dark:bg-neutral-600"
      >
        <View className="flex-row items-center justify-center gap-3">
          <Logo />
          <TextCustom className="font-sf-pro-bold text-2xl/[125%] text-primary-400">
            ChatMe
          </TextCustom>
        </View>
        <View className="h-[19.5rem] w-[16.4375rem] self-center">
          <Image source={image} className="size-full" />
        </View>
      </View>
      <View className="flex-1 justify-between px-6 pb-10 pt-8">
        <View className="max-w-[20.4375rem] items-center gap-3 self-center">
          <TextCustom className="text-center font-sf-pro-bold text-2xl/[125%]">
            Stay connected with your friends and family
          </TextCustom>
          <TextCustom className="text-center text-sm/[150%] -tracking-tighter text-neutral-300">
            ChatMe is messaging app that will help you to connect with everyone.
          </TextCustom>
        </View>
        <Link href="/(auth)/sign-in" push asChild>
          <Button label="Get Started" />
        </Link>
      </View>
    </View>
  );
};

export default OnboardingScreen;
