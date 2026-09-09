import ArchiveIcon from '@/assets/icons/jsx/archive-icon';
import DotsHorizontalIcon from '@/assets/icons/jsx/dots-horizontal-icon';
import PushPin from '@/assets/icons/jsx/push-pin';
import TrashIcon from '@/assets/icons/jsx/trash-icon';
import UserGroupIcon from '@/assets/icons/jsx/user-group-icon';
import VolumeOffIcon from '@/assets/icons/jsx/volume-off-icon';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';
import { PressableScale } from 'pressto';
import { useState } from 'react';
import { Image, Pressable, useColorScheme, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

type Chat = {
  id: number;
  name: string;
  time: string;
  message: string;
  you?: boolean;
  online?: boolean;
  unread?: boolean;
  unreadCount?: number;
  pinned?: boolean;
  muted?: boolean;
  avatar: string;
  group?: boolean;
};

type ChatItemProps = {
  item: Chat;
  selected: number[];
  onSetSelected: React.Dispatch<React.SetStateAction<number[]>>;
};

export const ChatItem = ({ item, selected, onSetSelected }: ChatItemProps) => {
  const [dragged, setDragged] = useState(false);
  const colorScheme = useColorScheme();
  const isSelected = selected.includes(item.id);

  const toggleSelection = (id: number) => {
    onSetSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
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
      enabled={selected.length < 1}
    >
      <Pressable
        onLongPress={handleLongPress}
        onPress={handlePress}
        className={cn(
          'mx-3 flex-row items-center gap-3 rounded-xl p-3',
          dragged || isSelected ? 'bg-neutral-700' : 'bg-transparent',
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
            <View className="absolute bottom-0 right-0 size-4 rounded-full border-2 border-neutral-900 bg-primary-400" />
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
                {item.muted && <VolumeOffIcon />}
              </View>
            </View>
            <TextCustom
              className={cn(
                'text-sm/[150%] tracking-[0.5px]',
                item.unread ? '!text-primary-400' : '!text-neutral-200',
              )}
            >
              {item.time}
            </TextCustom>
          </View>
          <View className="flex-row items-center">
            <TextCustom className="flex-1 leading-[150%] !text-neutral-200">
              {item.you && (
                <TextCustom className="leading-[150%]">You:</TextCustom>
              )}{' '}
              {item.message}
            </TextCustom>
            <View className="flex-row items-center gap-1">
              {item.pinned && (
                <PushPin
                  size={20}
                  fill={Colors[colorScheme ?? 'light'].neutral[200]}
                />
              )}
              {item.unreadCount && (
                <View className="size-6 items-center justify-center rounded-full bg-primary-400">
                  <TextCustom className="font-sf-pro-medium text-sm/[150%]">
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
        className="bg-neutral-500"
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
        className="bg-neutral-500"
      />
      <ActionCard
        labelText="More"
        icon={<DotsHorizontalIcon />}
        className="bg-neutral-700"
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
        <TextCustom className="font-sf-pro-medium text-sm/[150%]">
          {labelText}
        </TextCustom>
      </View>
    </PressableScale>
  );
};
