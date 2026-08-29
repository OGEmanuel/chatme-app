import { useAppForm } from '@/hooks/form';
import { getCallingCode } from '@/lib/utils';
import { revalidateLogic, useField } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import countries from 'world-countries';
import z from 'zod';
import AuthLayoutWrapper, {
  AuthLayoutHeader,
  AuthLayoutInnerWrapper,
} from './components/layout-wrapper';
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
      console.log(value);
      router.push({
        pathname: '/(auth)/verify',
        params: {
          phone: `${getCallingCode(
            filterByCountryName(countryName)[0].idd.root,
            filterByCountryName(countryName)[0].idd.suffixes,
          )}${value.phoneNumber}`,
        },
      });
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
          isPending={false}
          disabled={phoneNumberField.state.value.length < 3}
          label={'Next'}
        />
      </form.AppForm>
    </AuthLayoutWrapper>
  );
};

export default SignInScreen;
