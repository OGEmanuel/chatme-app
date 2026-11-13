import ArchiveIcon from '@/assets/icons/jsx/archive-icon';
import PushPin from '@/assets/icons/jsx/push-pin';
import SearchIcon from '@/assets/icons/jsx/search';
import TrashIcon from '@/assets/icons/jsx/trash-icon';
import VolumeOffIcon from '@/assets/icons/jsx/volume-off-icon';
// import Button from '@/components/ui/button';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppForm } from '@/hooks/form';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { getTimeAgo } from '@/screens/chat/lib/utils';
import { LegendList } from '@legendapp/list/react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../../components/header';
import { getMe } from '../settings/utils/queries/options';
import { ArchivedItem, ChatItem } from './components/chat-item';
import { QUERIES } from './lib/queries';
import { QUERY_KEYS } from './lib/queries/key-factory';
import { getSearchContacts } from './lib/queries/options';

// const CHATS = [
//   {
//     id: 1,
//     name: 'Darrell Steward',
//     time: '11:47 PM',
//     message: 'Hello, Good morning✨',
//     online: true,
//     unread: true,
//     pinned: true,
//     unreadCount: 4,
//     avatar:
//       'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788930881/aafe31ea2229da13734802db7280e23bb79c777c_ct25hf.png',
//   },
//   {
//     id: 2,
//     name: 'Jane Cooper',
//     time: '11:23 PM',
//     message: 'Can you sent the photo?',
//     you: true,
//     online: true,
//     unread: false,
//     avatar:
//       'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788932317/118a9cb80b4bd0fd0c71254dba08d43d5e1d9870_hiog2d.png',
//   },
//   {
//     id: 3,
//     name: 'Theresa Webb',
//     time: '11:17 PM',
//     message: 'Okay, Thank you',
//     online: false,
//     unread: true,
//     unreadCount: 4,
//     avatar:
//       'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788932410/e10c056349074d9fe7b7bc166a052d452a5445c9_vfzok3.png',
//   },
//   {
//     id: 4,
//     name: 'Work Team',
//     time: '08:26 PM',
//     message: 'Wait, I’am on my way!',
//     unread: false,
//     avatar:
//       'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788932446/e8c1d718b72ee29288dcf94d2afce49f3875337c_nmtxww.png',
//     group: true,
//   },
//   {
//     id: 5,
//     name: 'Annette Black',
//     time: '08:13 PM',
//     message: "Okay Rin, sounds good. Let's ...",
//     you: true,
//     online: true,
//     avatar:
//       'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788933496/cbc2fe78e54f07c106f5f98d804461eb28cc135f_lcwgiz.png',
//   },
//   {
//     id: 6,
//     name: 'Ronald Richards',
//     time: 'Yesteday',
//     message: 'Can you send the photo?',
//     you: true,
//     muted: true,
//     avatar:
//       'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788870378/1273880565add424d751ac48a6c214e1bde06a41_d2yqzd.png',
//   },
//   {
//     id: 7,
//     name: 'Guy Hawkins',
//     time: 'Yesteday',
//     message: 'Can you send the photo?',
//     you: true,
//     avatar:
//       'https://res.cloudinary.com/dl56ef7sx/image/upload/v1788933057/c063e946484b5b758f13eb04105a298ceb968092_dzce7u.png',
//   },
// ];

const ChatsView = () => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();
  const { data } = useQuery({ ...getSearchContacts(debouncedSearchText) });
  const {
    data: convosData,
    isPending: convosIsPending,
    isError: convosIsError,
    refetch: refetchConvos,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.convos.recent(),
    queryFn: ({ pageParam, signal }) =>
      QUERIES.getConvos('20', false, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page =>
      page.pageInfo.hasNextPage ? page.pageInfo.nextCursor ?? undefined : undefined,
  });
  const { data: currentUser } = useQuery({ ...getMe() });

  const CHATS = useMemo(
    () =>
      convosData?.pages.flatMap(page =>
        page.items.map(convo => ({
          id: convo.id,
          otherParticipantId:
            convo.type === 'direct' ? convo.otherParticipant.id : convo.id,
          name:
            convo.type === 'direct'
              ? convo.otherParticipant.displayName
              : convo.name,
          time: convo.updatedAt,
          message: convo.latestMessage,
          unreadCount: convo.unreadCount,
          you: convo.latestMessage?.senderId === currentUser?.id,
          settings: convo.settings,
          type: convo.type,
          online: getTimeAgo(convo.lastActivityAt).toLowerCase() === 'just now',
          avatar:
            convo.type === 'direct'
              ? convo.otherParticipant.avatarUrl
              : convo.avatarUrl,
        })),
      ),
    [convosData, currentUser?.id],
  );

  const form = useAppForm({
    defaultValues: {
      search: '',
    },
  });

  const chatData = useMemo(
    () =>
      CHATS?.map(chat => ({
        ...chat,
        isSelected: selected.includes(chat.id),
      })),
    [CHATS, selected],
  );

  return (
    <View className="flex-1">
      <Header className="gap-4 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-2">
            <TextCustom className="font-sf-pro-bold text-2xl/[125%] !text-white">
              Chats
            </TextCustom>
            {selected.length > 0 && (
              <View className="flex-row items-center gap-2">
                <View className="size-2 rounded-full bg-white" />
                <TextCustom className="font-sf-pro-bold text-2xl/[125%] !text-white">
                  {selected.length}
                </TextCustom>
              </View>
            )}
          </View>
          {selected.length > 0 && (
            <View className="flex-row items-center gap-6">
              <PushPin />
              <ArchiveIcon />
              <VolumeOffIcon size={24} fill="white" />
              <TrashIcon />
            </View>
          )}
        </View>

        <form.AppField name="search">
          {field => (
            <field.TextField
              icon={
                <SearchIcon
                  stroke={
                    colorScheme === 'dark'
                      ? Colors.dark.neutral[200]
                      : Colors.light.other['white/90']
                  }
                />
              }
              wrapperClassName="bg-white/[6%] p-3 dark:border-white/[16%]"
              shouldHideError
              inputProps={{
                onChangeText: value => {
                  setSearchText(value);
                },
                autoCapitalize: 'none',
                autoCorrect: false,
                autoComplete: 'off',
                keyboardType: 'default',
                returnKeyType: 'search',
                clearButtonMode: 'while-editing',
                enablesReturnKeyAutomatically: true,
                placeholder: 'Search chat, people and more...',
                placeholderTextColor:
                  colorScheme === 'dark'
                    ? Colors.dark.neutral[200]
                    : Colors.light.other.warning,
                className:
                  'ios:h-6 android:py-0 android:px-0 text-white font-inter flex-1 font-sf-pro-display text-neutral-900 dark:text-white',
              }}
            />
          )}
        </form.AppField>
      </Header>
      <View className="flex-1">
        {/* <Button
          label="Pin"
          onPress={() =>
            toast.action({
              title: 'Chat pinned successfully',
              icon: <PushPin size={12} />,
            })
          }
        /> */}
        {data ? (
          <>
            <LegendList
              data={data.items}
              showsVerticalScrollIndicator={false}
              keyExtractor={item => item.id}
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingBottom: insets.bottom + 200,
                paddingHorizontal: 12,
                paddingTop: 12,
                gap: 4,
              }}
              recycleItems
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => router.push(`/chat/${item.id}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Start a conversation with ${item.displayName}`}
                  className="flex-row items-center gap-4 active:opacity-75"
                >
                  <View className="size-14 overflow-hidden rounded-full">
                    <Image
                      source={{ uri: item.avatarUrl }}
                      className="size-full"
                    />
                  </View>
                  <TextCustom>{item.displayName}</TextCustom>
                </Pressable>
              )}
            />
          </>
        ) : convosIsPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        ) : convosIsError ? (
          <Pressable
            onPress={() => void refetchConvos()}
            accessibilityRole="button"
            accessibilityLabel="Retry loading chats"
            className="flex-1 items-center justify-center"
          >
            <TextCustom>Unable to load chats. Tap to retry.</TextCustom>
          </Pressable>
        ) : (
          <LegendList
            data={chatData ?? []}
            showsVerticalScrollIndicator={false}
            keyExtractor={item => item.id.toString()}
            className="gap-1"
            contentContainerStyle={{
              paddingBottom: insets.bottom + 200,
              gap: 4,
            }}
            recycleItems={true}
            onEndReached={() => {
              if (hasNextPage && !isFetchingNextPage) {
                void fetchNextPage();
              }
            }}
            onEndReachedThreshold={0.4}
            renderItem={({ item }) => {
              if (item.settings.archived) {
                return <ArchivedItem />;
              }

              return (
                <ChatItem
                  item={item}
                  selected={selected}
                  onSetSelected={setSelected}
                />
              );
            }}
            ListFooterComponent={
              isFetchingNextPage ? <ActivityIndicator /> : null
            }
          />
        )}
      </View>
    </View>
  );
};

export default ChatsView;
