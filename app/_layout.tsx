import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

const NavigationLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,
    card: Colors.light.background,
  },
};

const NavigationDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.background,
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded] = useFonts({
    SfPro: require('../assets/fonts/sf-pro-display/SFPRODISPLAYREGULAR.otf'),
    SfProMedium: require('../assets/fonts/sf-pro-display/SFPRODISPLAYMEDIUM.otf'),
    SfProBold: require('../assets/fonts/sf-pro-display/SFPRODISPLAYBOLD.otf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider
      value={
        colorScheme === 'dark' ? NavigationDarkTheme : NavigationLightTheme
      }
    >
      <GestureHandlerRootView>
        <StatusBar style="auto" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor:
                colorScheme === 'dark'
                  ? Colors.dark.background
                  : Colors.light.background,
            },
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="(form-sheets)/world-countries"
            options={{
              presentation: 'formSheet',
              sheetGrabberVisible: Platform.OS === 'android' ? false : true,
              headerShown: Platform.OS === 'android' ? false : true,
              headerStyle: {
                backgroundColor:
                  colorScheme === 'dark'
                    ? Colors.dark.background
                    : Colors.light.background,
              },
              headerTitle: 'Select a country',
              sheetCornerRadius: Platform.OS === 'android' ? 18 : undefined,
              sheetAllowedDetents: [0.75],
              contentStyle: {
                backgroundColor:
                  colorScheme === 'dark'
                    ? Colors.dark.background
                    : Colors.light.background,
              },
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
