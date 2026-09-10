import CheveronLeftIcon from '@/assets/icons/jsx/cheveron-left-icon';
import TextCustom from '@/components/ui/text';
import { LegendList } from '@legendapp/list/react-native';
import { useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatItem } from '../components/chat-item';
import Header from '../components/header';

const CHATS = [
  {
    id: 1,
    name: 'Annie Miles',
    time: '20:46 PM',
    message: "Please, I don't know anything about this and that osdjj",
    unread: true,
    unreadCount: 2,
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789050188/5461e70468f6aad5bf2b2bd3ade5a1b66e214ffe_awjwhk.png',
    type: 'chat' as const,
  },
  {
    id: 2,
    name: 'Arlene McCoy',
    time: '11:23 PM',
    message: "Wow, it's very cool",
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788870379/41f62e00c6c84e09f2406bbeaff8d096615a50ae_uzjxin.png',
    type: 'chat' as const,
  },
];

const ArchivedScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View>
      <Header className="flex-row items-center justify-between pb-5 pt-4">
        <PressableScale onPress={() => router.back()}>
          <CheveronLeftIcon />
        </PressableScale>
        <TextCustom className="font-sf-pro-bold text-lg/[125%] !text-white">
          Archived Chat
        </TextCustom>
        <View className="size-6" />
      </Header>
      <LegendList
        data={CHATS}
        showsVerticalScrollIndicator={false}
        keyExtractor={item => item.id.toString()}
        className="gap-1 pt-3"
        contentContainerStyle={{
          paddingBottom: insets.bottom + 200,
          gap: 4,
        }}
        recycleItems={true}
        renderItem={({ item }) => {
          return <ChatItem item={item} isArchived />;
        }}
      />
    </View>
  );
};

export default ArchivedScreen;
