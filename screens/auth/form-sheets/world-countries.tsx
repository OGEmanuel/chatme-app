import AndroidSheetGrabber from '@/components/android-sheet-grabber';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import {
  LegendList,
  LegendListRenderItemProps,
} from '@legendapp/list/react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, TextInput, useColorScheme, View } from 'react-native';
import countries, { Country } from 'world-countries';
import { useCountryControlStore } from '../store/country-control-store';

const WorldCountriesScreen = () => {
  const { setCountryName } = useCountryControlStore();
  const colorScheme = useColorScheme();
  const [search, setSearch] = useState('');

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return countries;

    return countries.filter(item =>
      item.name.common.toLowerCase().includes(query),
    );
  }, [countries, search]);

  const RenderCountries = (props: { country: Country }) => {
    const { country } = props;
    const callingCode = `${country.idd.root}${country.idd.suffixes[0] ?? ''}`;
    const router = useRouter();

    const onSelectCountry = () => {
      setCountryName(country.name.common);
      router.dismiss();
    };

    return (
      <Pressable
        onPress={onSelectCountry}
        className="flex-row items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-[#081C2C]"
      >
        <View className="flex-row items-center">
          <TextCustom className="text-2xl">{country.flag}</TextCustom>
          <TextCustom className="font-sf-pro-bold text-sm/[150%]">
            {callingCode}
          </TextCustom>
        </View>
        <TextCustom className="text-base font-semibold">
          {country.name.common}
        </TextCustom>
      </Pressable>
    );
  };

  return (
    <View>
      <AndroidSheetGrabber className="py-4" />
      <View className="ios:z-10 px-6 py-5">
        <TextInput
          onChangeText={setSearch}
          value={search}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          keyboardType="default"
          returnKeyType="search"
          clearButtonMode="while-editing"
          enablesReturnKeyAutomatically
          placeholder="Search..."
          placeholderTextColor={
            colorScheme === 'dark'
              ? Colors.dark.neutral[300]
              : Colors.light.neutral[200]
          }
          className="h-14 rounded-2xl border border-neutral-300 px-5 font-sf-pro-medium text-sm/[150%] text-neutral-900 dark:text-gray-100"
        />
      </View>
      <LegendList
        data={filteredData}
        renderItem={(props: LegendListRenderItemProps<Country>) => (
          <RenderCountries country={props.item} />
        )}
        ListEmptyComponent={
          <View>
            <TextCustom>No results found for "{search}"</TextCustom>
          </View>
        }
        keyExtractor={item => item.flag}
        recycleItems={true}
        maintainVisibleContentPosition
        contentContainerStyle={{ gap: 16 }}
        contentContainerClassName="px-6 pt-3 pb-28"
      />
    </View>
  );
};

export default WorldCountriesScreen;
