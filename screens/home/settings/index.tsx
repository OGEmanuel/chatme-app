import Button from '@/components/ui/button';
import useSendRequest from '@/lib/hooks/useSendRequests';
import { useAuthStore } from '@/screens/auth/store/auth-store';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MUTATIONS } from './utils/queries';

const SettingsScreen = () => {
  const refreshToken = useAuthStore(state => state.refreshToken);
  const logOut = useAuthStore(state => state.logOut);

  const { mutate, isPending } = useSendRequest<
    {
      refreshToken: string;
    },
    any
  >({
    mutationFn: (data: { refreshToken: string }) => MUTATIONS.logout(data),
    successToast: {
      title: 'Logged Out',
      description: 'We hate to see you go',
    },
    errorToast: {
      title: 'Error',
      description: 'Please try again',
    },
  });

  return (
    <SafeAreaView>
      <View className="px-5 pt-6">
        <Button
          label="Logout"
          variant="secondary"
          isPending={isPending}
          onPress={() =>
            mutate(
              {
                refreshToken: refreshToken!!,
              },
              {
                onSuccess: () => {
                  logOut();
                },
              },
            )
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
