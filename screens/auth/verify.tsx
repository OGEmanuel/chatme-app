import TextCustom from '@/components/ui/text';
import { useAppForm } from '@/hooks/form';
import useSendRequest from '@/lib/hooks/useSendRequests';
import { toast } from '@/lib/toast';
import { revalidateLogic } from '@tanstack/react-form';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import z from 'zod';
import AuthLayoutWrapper, {
  AuthLayoutHeader,
  AuthLayoutInnerWrapper,
} from './components/layout-wrapper';
import { MUTATIONS } from './lib/queries';
import { Platform } from 'react-native';

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
  const [timer, setTimer] = useState(parseInt(resendInSeconds) ?? 30);
  const router = useRouter();
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const { mutate, isPending } = useSendRequest<
    {
      challengeId: string;
      code: string;
      device: { name: string; platform: string };
    },
    { accessToken: string; refreshToken: string }
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

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer(timer => timer - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

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
          onSuccess: () => {
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
          Alert.alert(
            'OTP Sent!',
            `Please copy this code 1234 for user verification`,
            [
              {
                text: 'Copy',
                style: 'default',
                onPress: () => {
                  (copyToClipboard(`1234`),
                    toast.success('Code copied!', 'Please check your phone'),
                    setTimer(data.resendInSeconds));
                },
              },
            ],
          );
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
              If you don't get the code, resend it in{' '}
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
