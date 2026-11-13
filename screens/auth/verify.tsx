import TextCustom from '@/components/ui/text';
import { useAppForm } from '@/hooks/form';
import useSendRequest from '@/lib/hooks/useSendRequests';
import { getValidCountdown } from '@/lib/utils';
import { revalidateLogic } from '@tanstack/react-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import z from 'zod';
import AuthLayoutWrapper, {
  AuthLayoutHeader,
  AuthLayoutInnerWrapper,
} from './components/layout-wrapper';
import { MUTATIONS } from './lib/queries';
import { useAuthStore } from './store/auth-store';

const formSchema = z.object({
  otp: z.string().min(4, {
    error: 'OTP should be 4 digits long',
  }),
});

const VerifyScreen = () => {
  const { phone, resendInSeconds, challengeId } = useLocalSearchParams<{
    phone: string;
    resendInSeconds: string;
    challengeId: string;
  }>();
  const [timer, setTimer] = useState(() => getValidCountdown(resendInSeconds));
  const router = useRouter();
  const logIn = useAuthStore(state => state.logIn);

  const { mutate, isPending } = useSendRequest<
    {
      challengeId: string;
      code: string;
      device: { name: string; platform: string };
    },
    {
      accessToken: string;
      refreshToken: string;
      user: { id: string };
    }
  >({
    mutationFn: (data: {
      challengeId: string;
      code: string;
      device: { name: string; platform: string };
    }) => MUTATIONS.otpVerify(data),
    successToast: {
      title: 'OTP verified successfully',
      description: 'You are now logged in',
    },
    errorToast: {
      title: 'Error',
      description: 'Please try again',
    },
  });

  const deadlineRef = useRef(
    Date.now() + getValidCountdown(resendInSeconds) * 1000,
  );

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000),
      );

      setTimer(remaining);
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const form = useAppForm({
    defaultValues: {
      otp: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      mutate(
        {
          challengeId,
          code: value.otp,
          device: {
            name: 'Owner',
            platform: Platform.OS,
          },
        },
        {
          onSuccess: data => {
            logIn({
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              userId: data.user.id,
            });
            router.push('/(auth)/name');
          },
        },
      );
    },
  });

  const { mutate: resendMutation, isPending: isResendPending } = useSendRequest<
    { challengeId: string },
    { resendInSeconds: number; challengeId: string }
  >({
    mutationFn: (data: { challengeId: string }) => MUTATIONS.otpResend(data),
    successToast: {
      title: 'OTP sent successfully',
      description: 'Please check your phone for the OTP code',
    },
    errorToast: {
      title: 'Error',
      description: 'Please try again',
    },
  });

  const handleResend = () => {
    resendMutation(
      {
        challengeId,
      },
      {
        onSuccess: (data: { resendInSeconds: number }) => {
          setTimer(data.resendInSeconds);
        },
      },
    );
  };

  return (
    <AuthLayoutWrapper>
      <AuthLayoutInnerWrapper>
        <AuthLayoutHeader
          canGoBack
          header="Verification code"
          descriptionClassName="max-w-[18rem]"
        >
          Enter the code number we sent to{' '}
          <TextCustom className="font-sf-pro-medium text-sm/[150%]">
            {phone}
          </TextCustom>
          .
        </AuthLayoutHeader>
        <View className="gap-8">
          <form.AppField name="otp">
            {field => <field.OTPField />}
          </form.AppField>
          <View className="items-center gap-2">
            <TextCustom className="text-sm/[150%] tracking-wider !text-neutral-200">
              If you do not get the code, resend it in{' '}
              <TextCustom className="font-sf-pro-medium text-sm/[150%] !text-black dark:!text-white">
                {timer}
              </TextCustom>{' '}
              second
              {`${timer !== 1 ? 's' : ''}`}.
            </TextCustom>
            {timer < 1 && (
              <Pressable onPress={handleResend}>
                <TextCustom className="font-sf-pro-bold text-sm/[150%] !text-primary-400">
                  {isResendPending ? 'Resending code...' : 'Resend code'}
                </TextCustom>
              </Pressable>
            )}
          </View>
        </View>
      </AuthLayoutInnerWrapper>
      <form.AppForm>
        <form.SubscribeButton
          onPress={form._handleSubmit}
          isPending={isPending}
          label={'Next'}
        />
      </form.AppForm>
    </AuthLayoutWrapper>
  );
};

export default VerifyScreen;
