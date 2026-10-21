import CheckIcon from '@/assets/icons/jsx/check-icon';
import SearchIcon from '@/assets/icons/jsx/search';
import AndroidSheetGrabber from '@/components/android-sheet-grabber';
import Button from '@/components/ui/button';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppForm } from '@/hooks/form';
import { cn } from '@/lib/utils';
import { LegendList } from '@legendapp/list/react-native';
import { useField } from '@tanstack/react-form';
import { PressableScale } from 'pressto';
import { useState } from 'react';
import { Image, useColorScheme, View } from 'react-native';

type Participant = {
  id: number;
  name: string;
  avatar: string;
};

const PARTICIPANTS = [
  {
    id: 1,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 2,
    name: 'Keanu',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 3,
    name: 'Keanu',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 4,
    name: 'Keanu',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 5,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 6,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 7,
    name: 'Kenan',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 8,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 9,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 10,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 11,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 12,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 13,
    name: 'Kenan',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 14,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 15,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 16,
    name: 'Keanu',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 17,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 18,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 19,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 20,
    name: 'Kenan',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 21,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 22,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 23,
    name: 'Keanu',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 24,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 25,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 26,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 27,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 28,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 29,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
  {
    id: 30,
    name: 'Eden',
    avatar:
      'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789770005/5cfd80d8ee6f0e7de9d74436ee5c9951d63e1dfa_eiydpl.png',
  },
];

const CreateGroupScreen = () => {
  const colorScheme = useColorScheme();
  const [selectedParticipants, setSelectedParticipants] = useState<
    Participant[]
  >([]);

  const toggleSelectParticipant = (participant: Participant) => {};

  const form = useAppForm({
    defaultValues: {
      search: '',
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  const searchField = useField({
    name: 'search',
    form,
  });

  const RenderParticipants = (props: { item: Participant }) => {
    const { item } = props;

    const isSelected = selectedParticipants.findIndex(p => p.id === item.id);

    console.log(isSelected);

    return (
      <PressableScale
        onPress={() => toggleSelectParticipant(item)}
        style={{
          gap: 8,
          alignItems: 'center',
        }}
      >
        <View className="relative justify-center">
          {isSelected && (
            <View className="absolute size-16 justify-center self-center rounded-full border-2 border-primary-400" />
          )}
          <View className="relative size-14 justify-center overflow-hidden rounded-full">
            {isSelected && (
              <View className="absolute z-10 size-14 items-center justify-center self-center rounded-full  bg-neutral-900/[44%]">
                <CheckIcon />
              </View>
            )}
            <Image
              source={{
                uri: item.avatar,
              }}
              className="size-full"
            />
          </View>
        </View>
        <TextCustom className="font-sf-pro-bold text-sm/[125%]">
          {item.name}
        </TextCustom>
      </PressableScale>
    );
  };

  return (
    <View className="">
      <View>
        <AndroidSheetGrabber />
        <View className="ios:pt-10 gap-6">
          <View className="z-10 gap-6 bg-white dark:bg-neutral-700">
            <View className="gap-5 px-6">
              <TextCustom className="text-center font-sf-pro-bold text-xl/5 leading-[125%]">
                Add participants
              </TextCustom>
              <View className="flex-row items-center gap-2">
                <View className="h-1.5 flex-1 rounded-full bg-primary-400" />
                <View className="bg-extra-100 h-1.5 flex-1 rounded-full" />
              </View>
            </View>
            <View className="gap-8 px-6">
              <form.AppField name="search">
                {field => (
                  <field.TextField
                    icon={
                      <SearchIcon
                        stroke={
                          searchField.state.value !== ''
                            ? Colors[colorScheme ?? 'light'].primary[400]
                            : colorScheme === 'dark'
                              ? Colors.dark.neutral[200]
                              : Colors.light.neutral[300]
                        }
                      />
                    }
                    wrapperClassName={cn(
                      'p-3',
                      searchField.state.value === ''
                        ? 'dark:border-neutral-300 border-other-divider'
                        : '!border-primary-400 bg-primary-50 dark:bg-neutral-800',
                    )}
                    shouldHideError
                    inputProps={{
                      autoCapitalize: 'none',
                      autoCorrect: false,
                      autoComplete: 'off',
                      keyboardType: 'default',
                      returnKeyType: 'search',
                      clearButtonMode: 'while-editing',
                      enablesReturnKeyAutomatically: true,
                      placeholder: 'Search people',
                      placeholderTextColor:
                        colorScheme === 'dark'
                          ? Colors.dark.neutral[200]
                          : Colors.light.neutral[300],
                      className:
                        'ios:h-6 android:py-0 android:px-0 font-inter flex-1 font-sf-pro-display text-neutral-900 dark:text-white',
                    }}
                  />
                )}
              </form.AppField>
            </View>
            <View>
              <LegendList
                data={PARTICIPANTS}
                showsVerticalScrollIndicator={false}
                keyExtractor={item => item.id.toString()}
                numColumns={4}
                style={{
                  paddingHorizontal: 24,
                  maxHeight: 500,
                }}
                contentContainerStyle={{
                  paddingBottom: 24,
                  gap: 24,
                }}
                renderItem={({ item }) => <RenderParticipants item={item} />}
              />
            </View>
          </View>
        </View>
      </View>
      <View
        style={{
          boxShadow: '0px -4px 24px 0px #0B131B0A',
        }}
        className="px-6 pb-1 pt-2"
      >
        <Button label="Next" disabled />
      </View>
    </View>
  );
};

export default CreateGroupScreen;
