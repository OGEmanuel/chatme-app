import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import SearchIcon from '@/assets/icons/jsx/search';
import AndroidSheetGrabber from '@/components/android-sheet-grabber';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppForm } from '@/hooks/form';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { useField } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  SectionList,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSearchContacts } from '../lib/queries/options';
import { SearchContacts } from '../lib/queries/type';

const ContactScreen = () => {
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isFetching, isError, refetch } = useQuery({
    ...getSearchContacts(debouncedSearchText),
  });

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

  const sections = useMemo(() => {
    if (!data) return [];
    const sorted = [...data?.items].sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );

    return Object.values(
      sorted.reduce<Record<string, { title: string; data: SearchContacts[] }>>(
        (acc, contact) => {
          const title = contact.displayName.charAt(0).toUpperCase();

          if (!acc[title]) {
            acc[title] = { title, data: [] };
          }

          acc[title].data.push(contact);

          return acc;
        },
        {},
      ),
    );
  }, [data]);

  return (
    <View className="flex-1 gap-6">
      <View className="z-10 bg-white dark:bg-neutral-700">
        <AndroidSheetGrabber />
        <View className="gap-4 px-6 pt-10">
          <TextCustom className="text-center font-sf-pro-bold text-xl/5 leading-[125%]">
            Contact
          </TextCustom>
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
      </View>
      {debouncedSearchText.trim().length < 3 ? (
        <TextCustom className="px-6 text-center text-neutral-300">
          Enter at least 3 characters to search for people.
        </TextCustom>
      ) : isFetching ? (
        <ActivityIndicator />
      ) : isError ? (
        <Pressable onPress={() => void refetch()}>
          <TextCustom className="px-6 text-center">
            Search failed. Tap to try again.
          </TextCustom>
        </Pressable>
      ) : sections.length === 0 ? (
        <TextCustom className="px-6 text-center">
          No results found for {debouncedSearchText}.
        </TextCustom>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          renderSectionHeader={({ section }) => (
            <View className="bg-other-divider px-6 py-1 dark:bg-neutral-500">
              <TextCustom className="font-sf-pro-medium leading-[150%] text-neutral-300 dark:text-neutral-200">
                {section.title}
              </TextCustom>
            </View>
          )}
          nestedScrollEnabled
          contentContainerStyle={{
            paddingBottom: insets.bottom + 200,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: { id: item.id, target: 'user' },
                })
              }
              accessibilityRole="button"
              accessibilityLabel={`Start a conversation with ${item.displayName}`}
              className="px-6"
            >
              <View className="flex-1 flex-row items-center gap-2">
                <View className="flex-1 flex-row items-center gap-4">
                  <View className="size-14 overflow-hidden rounded-full">
                    <Image
                      source={{ uri: item.avatarUrl }}
                      className="size-full"
                    />
                  </View>
                  <TextCustom className="flex-1 font-sf-pro-medium leading-[150%]">
                    {item.displayName}
                  </TextCustom>
                </View>
                <View style={{ transform: [{ rotate: '180deg' }] }}>
                  <ArrowLeftIcon
                    size="20"
                    stroke={Colors[colorScheme ?? 'light'].neutral[300]}
                  />
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
};

export default ContactScreen;
