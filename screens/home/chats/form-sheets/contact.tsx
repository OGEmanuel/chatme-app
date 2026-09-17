import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import SearchIcon from '@/assets/icons/jsx/search';
import AndroidSheetGrabber from '@/components/android-sheet-grabber';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppForm } from '@/hooks/form';
import { cn } from '@/lib/utils';
import { faker } from '@faker-js/faker';
import { SectionList } from '@legendapp/list/section-list';
import { useField } from '@tanstack/react-form';
import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Contact = {
  id: number;
  name: string;
  avatar: string;
  phone: string;
};

const ContactScreen = () => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [renderedContacts, setRenderedContacts] = useState<
    {
      title: string;
      data: Contact[];
    }[]
  >([]);

  const contacts = [];

  for (let i = 0; i < 20; i++) {
    contacts.push({
      id: i,
      name: faker.person.fullName(),
      avatar: faker.image.avatar(),
      phone: faker.phone.number({ style: 'international' }),
    });
  }

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

  const sectionContacts = (contacts: Contact[]) => {
    const sorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));

    return Object.values(
      sorted.reduce<Record<string, { title: string; data: Contact[] }>>(
        (sections, contact) => {
          const title = contact.name.charAt(0).toUpperCase();

          if (!sections[title]) {
            sections[title] = {
              title,
              data: [],
            };
          }

          sections[title].data.push(contact);

          return sections;
        },
        {},
      ),
    );
  };

  const sections = sectionContacts(contacts);

  const filteredContacts = useMemo(() => {
    return sections.map(section => {
      return {
        ...section,
        data: section.data.filter(contact =>
          contact.name
            .toLowerCase()
            .includes(searchField.state.value.toLowerCase()),
        ),
      };
    });
  }, [sections, searchField.state.value]);

  useEffect(() => {
    if (searchField.state.value === '') {
      setRenderedContacts(sections);
    }
    {
      setRenderedContacts(filteredContacts);
    }
  }, [searchField.state.value]);

  const RenderContactList = (props: { item: Contact }) => {
    const { item } = props;

    return (
      <Link href={`/chat/${item.id}`} replace asChild>
        <Pressable className="px-6">
          <View className="flex-1 flex-row items-center gap-2 ">
            <View className="flex-1 flex-row items-center gap-4">
              <View className="size-14 overflow-hidden rounded-full">
                <Image
                  source={{
                    uri: item.avatar,
                  }}
                  className="size-full"
                />
              </View>
              <View className="flex-1 gap-1">
                <TextCustom className="font-sf-pro-medium leading-[150%]">
                  {item.name}
                </TextCustom>
                <TextCustom className="text-sm/[150%] tracking-[0.5px] dark:text-neutral-200">
                  {item.phone}
                </TextCustom>
              </View>
            </View>
            <View
              style={{
                transform: [
                  {
                    rotate: '180deg',
                  },
                ],
              }}
            >
              <ArrowLeftIcon
                size={20}
                stroke={Colors[colorScheme ?? 'light'].neutral[300]}
              />
            </View>
          </View>
        </Pressable>
      </Link>
    );
  };

  const RenderSectionHeader = (props: { section: string }) => {
    const { section } = props;
    return (
      <View className="bg-other-divider px-6 py-1 dark:bg-neutral-500">
        <TextCustom className="font-sf-pro-medium leading-[150%] text-neutral-300 dark:text-neutral-200">
          {section}
        </TextCustom>
      </View>
    );
  };

  const RenderEmptyState = () => {
    return (
      <View className="px-6">
        <TextCustom className="text-center font-sf-pro-medium">
          No results found for "{searchField.state.value}"
        </TextCustom>
      </View>
    );
  };

  const isRenderedContactsEmpty = (
    sections: { data: Contact[] }[],
  ): boolean => {
    return sections.every(section => section.data.length === 0);
  };

  const isEmpty = isRenderedContactsEmpty(renderedContacts);

  return (
    <View className="gap-6">
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
      {isEmpty ? (
        <RenderEmptyState />
      ) : (
        <SectionList
          sections={renderedContacts}
          keyExtractor={item => item.id.toString()}
          renderSectionHeader={({ section }) => {
            return searchField.state.value === '' ? (
              <RenderSectionHeader section={section.title} />
            ) : null;
          }}
          nestedScrollEnabled={true}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 200,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <RenderContactList item={item} />}
        />
      )}
    </View>
  );
};

export default ContactScreen;
