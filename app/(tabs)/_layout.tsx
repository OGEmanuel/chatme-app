import { Tabs } from 'expo-router';
import React from 'react';

import ChatIcon from '@/assets/icons/jsx/chat-icon';
import CogIcon from '@/assets/icons/jsx/cog-icon';
import PhoneIcon from '@/assets/icons/jsx/phone-icon';
import { HapticTab } from '@/components/haptic-tab';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="chats"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary[400],
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].backgroundSecondary,
          height: 84,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          marginTop: 4,
          fontFamily: Fonts.sfProMedium,
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="call"
        options={{
          title: 'Call',
          tabBarIcon: ({ color }) => <PhoneIcon fill={color} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }) => <ChatIcon fill={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <CogIcon fill={color} />,
        }}
      />
    </Tabs>
  );
}
