import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import TextCustom from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import { Pressable, View } from 'react-native';

const Header = (props: {
  activeTab: number;
  goToPage: (page: number) => void;
}) => {
  const { activeTab, goToPage } = props;
  const router = useRouter();
  return (
    <View className="gap-6 pt-4">
      <PressableScale
        style={{
          paddingHorizontal: 24,
        }}
        onPress={() => router.back()}
      >
        <ArrowLeftIcon />
      </PressableScale>
      <View
        style={{
          boxShadow: '0px 4px 24px 0px #27443105',
        }}
        className="flex-row items-center bg-neutral-800"
      >
        <Pressable
          className={cn(
            'flex-1 items-center border-b-2 border-transparent py-6',
            activeTab === 0 && ' border-primary-400',
          )}
          onPress={() => goToPage(0)}
        >
          <TextCustom>My Code</TextCustom>
        </Pressable>
        <Pressable
          onPress={() => goToPage(1)}
          className={cn(
            'flex-1 items-center border-b-2  border-transparent py-6',
            activeTab === 1 && 'border-primary-400',
          )}
        >
          <TextCustom>Scan Code</TextCustom>
        </Pressable>
      </View>
    </View>
  );
};

export default Header;
