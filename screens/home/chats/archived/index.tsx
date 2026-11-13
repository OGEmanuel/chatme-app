import CheveronLeftIcon from '@/assets/icons/jsx/cheveron-left-icon';
import TextCustom from '@/components/ui/text';
import { LegendList } from '@legendapp/list/react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../../components/header';
import { ChatItem } from '../components/chat-item';
import { getConvos } from '../lib/queries/options';

const ArchivedScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data, isPending, isError, refetch } = useQuery({
    ...getConvos('50', true),
  });
  const archived = data?.items.map(conversation => ({
    id: conversation.id,
    name:
      conversation.type === 'direct'
        ? conversation.otherParticipant.displayName
        : conversation.name,
    time: conversation.updatedAt,
    otherParticipantId:
      conversation.type === 'direct'
        ? conversation.otherParticipant.id
        : conversation.id,
    message: conversation.latestMessage,
    type: conversation.type,
    unreadCount: conversation.unreadCount,
    online: false,
    you: false,
    settings: conversation.settings,
    avatar:
      conversation.type === 'direct'
        ? conversation.otherParticipant.avatarUrl
        : conversation.avatarUrl,
  }));

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
      {isPending ? (
        <View className="items-center py-10">
          <ActivityIndicator />
        </View>
      ) : isError ? (
        <PressableScale onPress={() => void refetch()}>
          <TextCustom className="px-6 py-10 text-center">
            Unable to load archived chats. Tap to retry.
          </TextCustom>
        </PressableScale>
      ) : archived?.length ? (
        <LegendList
          data={archived}
          showsVerticalScrollIndicator={false}
          keyExtractor={item => item.id}
          className="gap-1 pt-3"
          contentContainerStyle={{
            paddingBottom: insets.bottom + 200,
            gap: 4,
          }}
          recycleItems
          renderItem={({ item }) => <ChatItem item={item} isArchived />}
        />
      ) : (
        <TextCustom className="px-6 py-10 text-center">
          No archived chats.
        </TextCustom>
      )}
    </View>
  );
};

export default ArchivedScreen;
