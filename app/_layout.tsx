import { toastConfig } from '@/components/toast/app-toast';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '@/screens/auth/store/auth-store';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../global.css';
import { startSocketLifecycle } from '@/screens/chat/lib/sockets/lifecycle';
import { queryClient } from '@/lib/query-client';
import {
  initializeAnalytics,
  trackAppOpened,
  setAnalyticsUser,
  resetAnalyticsIdentity,
  track,
} from '@/lib/analytics';

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
  const pathname = usePathname();
  const globalParams = useGlobalSearchParams<{ id?: string; target?: string }>();
  const colorScheme = useColorScheme();
  const hasHydrated = useAuthStore(state => state.hasHydrated);
  const loggedIn = useAuthStore(state => state.isLoggedIn);
  const hydrationError = useAuthStore(state => state.hydrationError);
  const hasCompletedOnboarding = useAuthStore(
    state => state.hasCompletedOnboarding,
  );
  const [fontsLoaded] = useFonts({
    SfPro: require('../assets/fonts/sf-pro-display/SFPRODISPLAYREGULAR.otf'),
    SfProMedium: require('../assets/fonts/sf-pro-display/SFPRODISPLAYMEDIUM.otf'),
    SfProBold: require('../assets/fonts/sf-pro-display/SFPRODISPLAYBOLD.otf'),
  });

  useEffect(() => {
    initializeAnalytics();
    trackAppOpened();
  }, []);

  useEffect(() => {
    if (loggedIn && useAuthStore.getState().userId) {
      setAnalyticsUser(useAuthStore.getState().userId);
    } else {
      resetAnalyticsIdentity();
    }
  }, [loggedIn]);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (!hasHydrated || !loggedIn) return;
    return startSocketLifecycle();
  }, [hasHydrated, loggedIn]);

  useEffect(() => {
    if (!hasHydrated) return;
    const screenName = pathname.startsWith('/chat/')
      ? 'chat'
      : pathname.startsWith('/(auth)/')
        ? pathname.replace('/(auth)/', 'auth/')
        : pathname.replace(/^\/+/, '') || 'home';
    track('screen_viewed', { screen_name: screenName });
  }, [hasHydrated, pathname]);

  useEffect(() => {
    if (!pathname.startsWith('/chat/') || !globalParams.id) return;
    useAuthStore.getState().setPendingDestination({
      pathname: '/chat/[id]',
      params: {
        id: globalParams.id,
        ...(globalParams.target ? { target: globalParams.target } : {}),
      },
    });
  }, [globalParams.id, globalParams.target, pathname]);

  if (!hasHydrated || !fontsLoaded) {
    if (hydrationError) {
      return (
        <View className="flex-1 items-center justify-center gap-4 px-6">
          <Text className="text-center text-neutral-900">{hydrationError}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => useAuthStore.getState().retryHydration()}
            className="rounded-xl bg-primary-400 px-5 py-3"
          >
            <Text className="font-medium text-white">Retry</Text>
          </Pressable>
        </View>
      );
    }
    return null;
  }

  return (
    <ThemeProvider
      value={
        colorScheme === 'dark' ? NavigationDarkTheme : NavigationLightTheme
      }
    >
      <GestureHandlerRootView>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

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
            <Stack.Protected guard={loggedIn && !hasCompletedOnboarding}>
              <Stack.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={!loggedIn}>
              <Stack.Screen
                name="(auth)/sign-in"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(auth)/verify"
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Protected>

            <Stack.Protected guard={loggedIn && !hasCompletedOnboarding}>
              <Stack.Screen
                name="(auth)/name"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="(auth)/upload"
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Protected>
            <Stack.Protected guard={loggedIn}>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen name="chat/[id]" />
              <Stack.Screen name="new-contact/index" />
              <Stack.Screen name="new-contact/qr-code" />
              <Stack.Screen name="setup-pin" />
              <Stack.Screen
                name="(form-sheets)/contact"
                options={{
                  presentation: 'formSheet',
                  sheetGrabberVisible:
                    Platform.OS === 'android' ? false : true,
                  headerShown: false,
                  sheetCornerRadius:
                    Platform.OS === 'android' ? 18 : undefined,
                  sheetAllowedDetents: [1],
                  contentStyle: {
                    backgroundColor:
                      colorScheme === 'dark'
                        ? Colors.dark.backgroundSecondary
                        : Colors.light.backgroundSecondary,
                  },
                }}
              />
              <Stack.Screen
                name="(form-sheets)/map"
                options={{
                  presentation: 'formSheet',
                  sheetGrabberVisible:
                    Platform.OS === 'android' ? false : true,
                  headerShown: false,
                  sheetCornerRadius:
                    Platform.OS === 'android' ? 18 : undefined,
                  sheetAllowedDetents: [1],
                  contentStyle: {
                    backgroundColor:
                      colorScheme === 'dark'
                        ? Colors.dark.backgroundSecondary
                        : Colors.light.backgroundSecondary,
                    height: '100%',
                  },
                }}
              />
              <Stack.Screen
                name="(form-sheets)/edit-profile-picture"
                options={{
                  presentation: 'formSheet',
                  sheetGrabberVisible:
                    Platform.OS === 'android' ? false : true,
                  headerShown: false,
                  sheetCornerRadius:
                    Platform.OS === 'android' ? 18 : undefined,
                  sheetAllowedDetents: 'fitToContents',
                  contentStyle: {
                    backgroundColor:
                      colorScheme === 'dark'
                        ? Colors.dark.backgroundSecondary
                        : Colors.light.backgroundSecondary,
                  },
                }}
              />
              <Stack.Screen
                name="(form-sheets)/create-group"
                options={{
                  presentation: 'formSheet',
                  sheetGrabberVisible:
                    Platform.OS === 'android' ? false : true,
                  headerShown: false,
                  sheetCornerRadius:
                    Platform.OS === 'android' ? 18 : undefined,
                  sheetAllowedDetents: 'fitToContents',
                  contentStyle: {
                    backgroundColor:
                      colorScheme === 'dark'
                        ? Colors.dark.backgroundSecondary
                        : Colors.light.backgroundSecondary,
                  },
                }}
              />
            </Stack.Protected>
            <Stack.Screen
              name="(form-sheets)/world-countries"
              options={{
                presentation: 'formSheet',
                sheetGrabberVisible: Platform.OS === 'android' ? false : true,
                headerShown: Platform.OS === 'android' ? false : true,
                headerStyle: {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? Colors.dark.backgroundSecondary
                      : Colors.light.backgroundSecondary,
                },
                headerTitle: 'Select a country',
                sheetCornerRadius: Platform.OS === 'android' ? 18 : undefined,
                sheetAllowedDetents: [0.75],
                contentStyle: {
                  backgroundColor:
                    colorScheme === 'dark'
                      ? Colors.dark.backgroundSecondary
                      : Colors.light.backgroundSecondary,
                },
              }}
            />
          </Stack>
        </QueryClientProvider>
        <Toast config={toastConfig} position="bottom" />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
