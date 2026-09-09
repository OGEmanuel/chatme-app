import { cn } from '@/lib/utils';
import { Image, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Header = (props: { children: React.ReactNode; className?: string }) => {
  const { children, className } = props;
  const insets = useSafeAreaInsets();

  return (
    <View
      className="relative bg-neutral-700"
      style={{
        paddingTop: insets.top,
      }}
    >
      <View className="absolute left-0 top-0 size-[7.25rem] rounded-full">
        <Image
          source={require('../assets/img/blur.png')}
          className="size-full"
        />
      </View>
      <View className={cn('px-6', className)}>{children}</View>
    </View>
  );
};

export default Header;
