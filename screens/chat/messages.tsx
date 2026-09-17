import TextCustom from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { LegendList, LegendListRef } from '@legendapp/list/react-native';
import { useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, View } from 'react-native';

type Message = {
  id: number;
  text: string;
  time: string;
  you?: boolean;
};

const DUMMY_MESSAGES = [
  {
    id: 1,
    text: 'Habitant elit pellentesque curabitur morbi sit fusce elit',
    time: '18:25',
  },
  { id: 2, text: 'Gravida lectus semper orci', time: '19:40', you: true },
  {
    id: 3,
    text: 'Egestas interdum orci commodo faucibus pretium, neque etiam',
    time: '19:40',
  },
  {
    id: 4,
    text: 'Orci maecenas hendrerit mattis consectetur. Mauris.',
    time: '19:40',
    you: false,
  },
  {
    id: 5,
    text: 'Egestas interdum orci commodo faucibus pretium, neque etiam',
    time: '16:40',
    you: true,
  },
  {
    id: 6,
    text: 'As the morning mist began to pull away from the edges of the quiet, sleeping forest,a lone red fox slipped silently through the damp ferns without leaving a single track;high above in the canopy, a blue jay called out to announce the arrival of the new day,while the ancient river below continued its endless, patient carve through the canyon floor,whispering secrets to the smooth gray stones that had rested there for a thousand years;and though the rest of the world remained completely unaware of this quiet masterpiece,nature went right on painting its quiet magic without ever needing an audience.',
    time: '17:40',
    you: false,
  },
  {
    id: 7,
    text: 'As the morning mist began to pull away from the edges of the quiet, sleeping forest,a lone red fox slipped silently through the damp ferns without leaving a single track;high above in the canopy, a blue jay called out to announce the arrival of the new day,while the ancient river below continued its endless, patient carve through the canyon floor,whispering secrets to the smooth gray stones that had rested there for a thousand years;and though the rest of the world remained completely unaware of this quiet masterpiece,nature went right on painting its quiet magic without ever needing an audience.',
    time: '17:40',
    you: true,
  },
  { id: 8, text: 'Gravida lectus semper orci', time: '20:00', you: false },
  {
    id: 9,
    text: 'Egestas interdum orci commodo faucibus pretium, neque etiam',
    time: '04:55',
    you: true,
  },
  { id: 10, text: 'Ok', time: '16:20', you: false },
];

const Messages = (props: { isKeyboardVisible: boolean }) => {
  const { isKeyboardVisible } = props;
  const legendListRef = useRef<LegendListRef>(null);
  const isAtBottom = useRef(true);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;

    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);

    isAtBottom.current = distanceFromBottom < 50;
  };

  useEffect(() => {
    if (isAtBottom.current) {
      legendListRef.current?.scrollToEnd({ animated: false });
    }
  }, []);

  useEffect(() => {
    if (!isKeyboardVisible || !isAtBottom.current) return;

    const timeout = setTimeout(() => {
      legendListRef.current?.scrollToEnd({
        animated: true,
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [isKeyboardVisible]);

  const RenderMessage = (props: { item: Message }) => {
    const { item } = props;
    return (
      <View
        className={cn(
          'flex-row items-center gap-3',
          item.you ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        <View
          style={{
            boxShadow: '0px 3px 8px 0px #18342103',
          }}
          className={cn(
            'max-w-60 rounded-t-2xl  px-4 py-3',
            item.you
              ? 'rounded-bl-2xl bg-primary-400'
              : 'rounded-br-2xl bg-white dark:bg-neutral-800',
          )}
        >
          <TextCustom
            className={cn(
              'leading-[150%]',
              item.you ? 'text-white' : 'text-neutral-600',
            )}
          >
            {item.text}
          </TextCustom>
        </View>
        <TextCustom
          className={'font-sf-pro-medium text-sm/[150%] !text-neutral-300'}
        >
          {item.time}
        </TextCustom>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <LegendList
        data={DUMMY_MESSAGES}
        showsVerticalScrollIndicator={false}
        ref={legendListRef}
        keyExtractor={item => item.id.toString()}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 12,
          gap: 24,
        }}
        style={{
          paddingVertical: 28,
        }}
        recycleItems={true}
        renderItem={({ item }) => <RenderMessage item={item} />}
        onContentSizeChange={() => {
          if (isAtBottom.current) {
            legendListRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />
    </View>
  );
};

export default Messages;
