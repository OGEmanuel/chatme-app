import SearchIcon from '@/assets/icons/jsx/Icon/search';
import IconButton from '@/components/ui/icon-button';
import TextCustom from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Image, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CONTACTS = [
  {
    uri: 'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788870378/07ef684ea8af52be9e1c032d1c55e6144ac86558_toj3hr.png',
  },
  {
    uri: 'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788870379/41f62e00c6c84e09f2406bbeaff8d096615a50ae_uzjxin.png',
  },
  {
    uri: 'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788870378/e275b26ed8407a9c42e20b797a7a9f4b3c2abc2d_wgtifn.png',
  },
  {
    uri: 'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788870378/1273880565add424d751ac48a6c214e1bde06a41_d2yqzd.png',
  },
];

const EmptyState = () => {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaView className="flex-1" edges={['top']}>
      <View className="flex-1 px-6 py-4">
        <View className="flex-row items-center justify-between">
          <TextCustom className="font-sf-pro-bold text-2xl/[125%]">
            Charts
          </TextCustom>
          <IconButton onPress={() => {}}>
            <SearchIcon stroke={colorScheme === 'dark' ? 'white' : 'black'} />
          </IconButton>
        </View>
        <View className="flex-1 flex-row items-center justify-center">
          <View className="items-center gap-5">
            <View className="flex-row items-center">
              {CONTACTS.map((contact, i) => (
                <View
                  key={i}
                  className={cn(
                    'z-10 size-14 overflow-hidden rounded-full border-2 border-white',
                    i !== CONTACTS.length - 1 && '-mr-5',
                  )}
                >
                  <Image
                    source={{
                      uri: contact.uri,
                    }}
                    className="size-full"
                  />
                </View>
              ))}
              <View className="z-10 -ml-5 size-14 items-center justify-center rounded-full border-2 border-white bg-other-divider">
                <TextCustom className="font-sf-pro-bold text-sm/[125%] !text-neutral-400">
                  26+
                </TextCustom>
              </View>
            </View>
            <TextCustom className="max-w-[20.5rem] text-center text-sm/[150%] tracking-[0.5px] text-neutral-300 dark:text-neutral-200">
              <TextCustom className="font-sf-pro-medium text-sm/[150%] dark:text-white">
                Mom, Sir Slbert, Cody Fisher
              </TextCustom>{' '}
              and 26+ contact found on Chatme, try sending a message to them or
              just saying hello.
            </TextCustom>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default EmptyState;
