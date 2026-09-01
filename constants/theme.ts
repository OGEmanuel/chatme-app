/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: {
      50: '#F5FBF7',
      200: '#ABDBBE',
      400: '#57B77D',
    },
    neutral: {
      50: '#DDE2E8',
      200: '#8EA3B3',
      300: '#6E8597',
      600: '#1F3C51',
      700: '#163043',

      800: '#0F2637',
      900: '#081C2C',
    },
    other: {
      danger: '#DD524C',
      divider: '#EAEEF2',
    },
  },
  dark: {
    text: '#ECEDEE',
    background: '#081C2C',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: {
      50: '#F5FBF7',
      200: '#ABDBBE',
      400: '#57B77D',
    },
    neutral: {
      50: '#DDE2E8',
      200: '#8EA3B3',
      300: '#6E8597',
      600: '#1F3C51',
      700: '#163043',
      800: '#0F2637',
      900: '#081C2C',
    },
    other: {
      danger: '#DD524C',
      divider: '#EAEEF2',
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
