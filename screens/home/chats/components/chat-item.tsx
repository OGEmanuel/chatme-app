import ArchiveIcon from '@/assets/icons/jsx/archive-icon';
import DotsHorizontalIcon from '@/assets/icons/jsx/dots-horizontal-icon';
import PushPin from '@/assets/icons/jsx/push-pin';
import TrashIcon from '@/assets/icons/jsx/trash-icon';
import UserGroupIcon from '@/assets/icons/jsx/user-group-icon';
import VolumeOffIcon from '@/assets/icons/jsx/volume-off-icon';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';
import { Link } from 'expo-router';
import { PressableScale } from 'pressto';
import { useState } from 'react';
import { Image, Pressable, useColorScheme, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { ChatItemProps } from '../constants/type';

export const ChatItem = ({
  item,
  selected,
  onSetSelected,
  isArchived,
}: ChatItemProps) => {
  const [dragged, setDragged] = useState(false);
  const colorScheme = useColorScheme();
  const isSelected = selected?.includes(item.id);

  const toggleSelection = (id: number) => {
    if (isArchived) return;
    if (onSetSelected) {
      onSetSelected(prev =>
        prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
      );
    }
  };

  const handleLongPress = () => {
    toggleSelection(item.id);
  };

  const handlePress = () => {
    if (isSelected) {
      toggleSelection(item.id);
    }
  };

  return (
    <Swipeable
      onSwipeableOpenStartDrag={() => setDragged(true)}
      onSwipeableClose={() => setDragged(false)}
      renderLeftActions={RenderLeftActions}
      renderRightActions={RenderRightActions}
      enabled={selected ? selected.length!! < 1 : true}
    >
      <Pressable
        onLongPress={handleLongPress}
        onPress={handlePress}
        className={cn(
          'mx-3 flex-row items-center gap-3 rounded-xl p-3',
          dragged || isSelected
            ? 'bg-primary-50 dark:bg-neutral-700'
            : 'bg-transparent',
        )}
      >
        <View className="relative size-14">
          <View
            className={cn(
              'size-full overflow-hidden rounded-full',
              item.group && 'border border-neutral-800',
            )}
          >
            <Image
              source={{
                uri: item.avatar,
              }}
              className="size-full"
            />
          </View>
          {item.online && (
            <View className="absolute bottom-0 right-0 size-4 rounded-full border-2 border-white bg-primary-400 dark:border-neutral-900" />
          )}
        </View>
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-2">
            <View className="flex-1 flex-row items-center gap-2">
              {item.group && <UserGroupIcon />}
              <View className="flex-row items-center gap-1">
                <TextCustom className="font-sf-pro-medium leading-[150%]">
                  {item.name}
                </TextCustom>
                {item.muted && (
                  <VolumeOffIcon
                    fill={
                      colorScheme === 'dark'
                        ? Colors.dark.neutral[200]
                        : Colors.dark.neutral[300]
                    }
                  />
                )}
              </View>
            </View>
            <TextCustom
              className={cn(
                'text-sm/[150%] tracking-[0.5px]',
                item.unread
                  ? '!text-primary-400'
                  : 'text-neutral-300 dark:text-neutral-200',
              )}
            >
              {item.time}
            </TextCustom>
          </View>
          <View className="flex-row items-center">
            <TextCustom className="line-clamp-1 flex-1 leading-[150%] text-neutral-300 dark:text-neutral-200">
              {item.you && (
                <TextCustom className="leading-[150%]">You:</TextCustom>
              )}{' '}
              {item.message}
            </TextCustom>
            <View className="flex-row items-center gap-1">
              {item.pinned && (
                <PushPin
                  size={20}
                  fill={
                    colorScheme === 'dark'
                      ? Colors.dark.neutral[300]
                      : Colors.light.neutral[200]
                  }
                />
              )}
              {item.unreadCount && (
                <View className="size-6 items-center justify-center rounded-full bg-primary-400">
                  <TextCustom className="font-sf-pro-medium text-sm/[150%] !text-white">
                    {item.unreadCount}
                  </TextCustom>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
};

export const ArchivedItem = () => {
  return (
    <Link push href="/chats/archived" asChild>
      <PressableScale
        style={{
          paddingHorizontal: 12,
          paddingTop: 10,
        }}
      >
        <View className="flex-row items-center gap-4 p-3">
          <View className="relative size-14 items-center justify-center overflow-hidden rounded-full bg-primary-400">
            <ArchiveIcon />
            <View className="absolute left-0 top-0 size-8 rounded-full">
              <Image
                source={require('../assets/img/blur-sm.png')}
                className="size-full"
              />
            </View>
          </View>
          <View className="flex-1 gap-1">
            <View className="flex-row items-center justify-between gap-2">
              <TextCustom className="flex-1 font-sf-pro-bold text-lg/[125%]">
                Archived Chat
              </TextCustom>
              <TextCustom className="text-sm/[150%] tracking-[0.5px] !text-neutral-200">
                11:17 PM
              </TextCustom>
            </View>
            <TextCustom className="leading-[150%] !text-neutral-200">
              Annie Miles, Arlene McCoy
            </TextCustom>
          </View>
        </View>
      </PressableScale>
    </Link>
  );
};

const RenderLeftActions = () => {
  return (
    <View className="flex-row items-center gap-2 pl-3">
      <ActionCard
        labelText="Mute"
        icon={<VolumeOffIcon fill="white" size={24} />}
        className="bg-other-warning"
      />
      <ActionCard
        labelText="Pinned"
        icon={<PushPin />}
        className="bg-neutral-100 dark:bg-neutral-500"
      />
    </View>
  );
};

const RenderRightActions = () => {
  return (
    <View className="flex-row items-center gap-2 pr-3">
      <ActionCard
        labelText="Delete"
        icon={<TrashIcon />}
        className="bg-other-danger"
      />
      <ActionCard
        labelText="Archived"
        icon={<ArchiveIcon />}
        className="bg-neutral-100 dark:bg-neutral-500"
      />
      <ActionCard
        labelText="More"
        icon={<DotsHorizontalIcon />}
        className="bg-neutral-50 dark:bg-neutral-700"
      />
    </View>
  );
};

const ActionCard = (props: {
  labelText: string;
  icon: React.ReactNode;
  onPress?: () => void;
  className?: string;
}) => {
  const { labelText, icon, onPress, className } = props;

  return (
    <PressableScale onPress={onPress}>
      <View
        className={cn(
          'w-[4.5rem] items-center gap-1 rounded-lg py-4',
          className,
        )}
      >
        {icon}
        <TextCustom className="font-sf-pro-medium text-sm/[150%] !text-white">
          {labelText}
        </TextCustom>
      </View>
    </PressableScale>
  );
};
