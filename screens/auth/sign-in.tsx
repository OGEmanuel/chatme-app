import { useAppForm } from '@/hooks/form';
import useSendRequest from '@/lib/hooks/useSendRequests';
import { toast } from '@/lib/toast';
import { getCallingCode } from '@/lib/utils';
import { revalidateLogic, useField } from '@tanstack/react-form';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';
import countries from 'world-countries';
import z from 'zod';
import AuthLayoutWrapper, {
  AuthLayoutHeader,
  AuthLayoutInnerWrapper,
} from './components/layout-wrapper';
import { MUTATIONS } from './lib/queries';
import { useCountryControlStore } from './store/country-control-store';

const formSchema = z.object({
  phoneNumber: z.string().regex(/^[0-9\s\-().]{7,20}$/, {
    error: 'Please enter a valid phone number.',
  }),
  countryName: z.string(),
});

const SignInScreen = () => {
  const { countryName } = useCountryControlStore();
  const router = useRouter();
  const filterByCountryName = (countryName: string) => {
    return countries.filter(country => country.name.common === countryName);
  };
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const { mutate, isPending } = useSendRequest<
    { phoneNumber: string },
    { resendInSeconds: number; challengeId: string }
  >({
    mutationFn: (data: { phoneNumber: string }) => MUTATIONS.otpRequest(data),
    successToast: {
      title: 'OTP sent successfully',
      description: 'Please check your phone for the OTP code',
    },
    errorToast: {
      title: 'Error',
      description: 'Please try again',
    },
  });

  const form = useAppForm({
    defaultValues: {
      phoneNumber: '',
      countryName: countryName,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      const phoneNumber = `${getCallingCode(
        filterByCountryName(countryName)[0].idd.root,
        filterByCountryName(countryName)[0].idd.suffixes,
      )}${value.phoneNumber}`;

      mutate(
        { phoneNumber },
        {
          onSuccess: (data: {
            resendInSeconds: number;
            challengeId: string;
          }) => {
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
                      router.push({
                        pathname: '/(auth)/verify',
                        params: {
                          phone: phoneNumber,
                          resendInSeconds: data.resendInSeconds.toString(),
                          challengeId: data.challengeId,
                        },
                      }),
                      form.reset());
                  },
                },
              ],
            );
          },
        },
      );
    },
  });

  const phoneNumberField = useField({
    name: 'phoneNumber',
    form,
  });

  return (
    <AuthLayoutWrapper>
      <AuthLayoutInnerWrapper>
        <AuthLayoutHeader header="What’s your phone number?">
          We will send you the verification code
        </AuthLayoutHeader>
        <form.AppField name="phoneNumber">
          {field => (
            <field.TextField
              isPhoneInput
              countryCode={getCallingCode(
                filterByCountryName(countryName)[0].idd.root,
                filterByCountryName(countryName)[0].idd.suffixes,
              )}
              countryFlag={filterByCountryName(countryName)[0].flag}
              inputLabel="Phone Number"
              isValid={phoneNumberField.state.value.length >= 3}
              inputProps={{
                placeholder: 'Phone number',
                keyboardType: 'phone-pad',
                autoCapitalize: 'none',
                autoCorrect: false,
                textContentType: 'telephoneNumber',
                autoComplete: 'tel',
              }}
            />
          )}
        </form.AppField>
      </AuthLayoutInnerWrapper>
      <form.AppForm>
        <form.SubscribeButton
          onPress={form._handleSubmit}
          isPending={isPending}
          disabled={phoneNumberField.state.value.length < 3}
          label={'Next'}
        />
      </form.AppForm>
    </AuthLayoutWrapper>
  );
};

export default SignInScreen;
