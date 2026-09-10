import { Stack } from 'expo-router';

const ChatsLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="archived" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ChatsLayout;
