import TextCustom from '@/components/ui/text';
import { useAppForm } from '@/hooks/form';
import { revalidateLogic } from '@tanstack/react-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import z from 'zod';
import AuthLayoutWrapper, {
  AuthLayoutHeader,
  AuthLayoutInnerWrapper,
} from './components/layout-wrapper';

const formSchema = z.object({
  otp: z.string().min(4, {
    error: 'OTP should be 4 digits long',
  }),
});

const VerifyScreen = () => {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [timer, setTimer] = useState(30);
  const router = useRouter();

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
      console.log(value);
      router.push('/(auth)/name');
    },
  });

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
            <Pressable>
              <TextCustom className="font-sf-pro-bold text-sm/[150%] !text-primary-400">
                Resend code
              </TextCustom>
            </Pressable>
          </View>
        </View>
      </AuthLayoutInnerWrapper>
      <form.AppForm>
        <form.SubscribeButton
          onPress={form._handleSubmit}
          isPending={false}
          label={'Next'}
        />
      </form.AppForm>
    </AuthLayoutWrapper>
  );
};

export default VerifyScreen;
