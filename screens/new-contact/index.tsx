import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import QrcodeIcon from '@/assets/icons/jsx/qrcode-icon';
import UploadImageIcon from '@/assets/icons/jsx/upload-image-icon';
import UserIcon from '@/assets/icons/jsx/user-icon';
import TextCustom from '@/components/ui/text';
import { useAppForm } from '@/hooks/form';
import { filterByCountryName, getCallingCode } from '@/lib/utils';
import { revalidateLogic, useField } from '@tanstack/react-form';
import { PressableScale } from 'pressto';
import { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import z from 'zod';
import { useCountryControlStore } from '../auth/store/country-control-store';
import Header from '../components/header';

const formSchema = z.object({
  firstName: z.string().min(2, { error: 'First name is too short' }),
  lastName: z.string().min(2, { error: 'Last name is too short' }),
  phoneNumber: z.string().regex(/^[0-9\s\-().]{7,20}$/, {
    error: 'Please enter a valid phone number.',
  }),
  countryName: z.string(),
});

const NewContactScreen = () => {
  const { countryName } = useCountryControlStore();
  const { bottom } = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const form = useAppForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      countryName: countryName,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  const phoneNumberField = useField({
    name: 'phoneNumber',
    form,
  });

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      className="flex-1"
      keyboardVerticalOffset={8}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={{
            paddingBottom: keyboardVisible ? undefined : bottom,
          }}
          className="flex-1"
        >
          <Header>
            <View className="flex-row items-center justify-between pb-[8rem] pt-4">
              <PressableScale>
                <ArrowLeftIcon />
              </PressableScale>
              <TextCustom className="font-sf-pro-bold text-lg/[125%]">
                New Contact
              </TextCustom>
              <View className="size-6" />
            </View>
          </Header>
          <View className="flex-1 justify-between px-6">
            <View className="flex-1 gap-6">
              <View className="relative -mt-[5.5rem] size-[11rem] items-center justify-center self-center rounded-full border-4 border-neutral-900 bg-neutral-100">
                <UserIcon fill="white" size={'116'} />
                <View className="absolute bottom-0 right-0">
                  <UploadImageIcon />
                </View>
              </View>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: 24,
                  gap: 24,
                }}
              >
                <View className="flex-1 gap-6">
                  <form.AppField name="firstName">
                    {field => (
                      <field.TextField
                        icon={<UserIcon />}
                        wrapperClassName="p-3"
                        shouldHideError
                        inputLabel="First name"
                        inputProps={{
                          autoCapitalize: 'none',
                          autoCorrect: false,
                          autoComplete: 'off',
                          keyboardType: 'default',
                          returnKeyType: 'search',
                          clearButtonMode: 'while-editing',
                          enablesReturnKeyAutomatically: true,
                          placeholder: 'First name',
                          placeholderTextColor: '#6E8597',
                          className:
                            'ios:h-6 android:py-0 android:px-0 font-inter flex-1 font-sf-pro-display text-neutral-900 dark:text-white',
                        }}
                      />
                    )}
                  </form.AppField>
                  <form.AppField name="lastName">
                    {field => (
                      <field.TextField
                        icon={<UserIcon />}
                        wrapperClassName="p-3"
                        shouldHideError
                        inputLabel="Last name"
                        inputProps={{
                          autoCapitalize: 'none',
                          autoCorrect: false,
                          autoComplete: 'off',
                          keyboardType: 'default',
                          returnKeyType: 'search',
                          clearButtonMode: 'while-editing',
                          enablesReturnKeyAutomatically: true,
                          placeholder: 'Last name',
                          placeholderTextColor: '#6E8597',
                          className:
                            'ios:h-6 android:py-0 android:px-0 font-inter flex-1 font-sf-pro-display text-neutral-900 dark:text-white',
                        }}
                      />
                    )}
                  </form.AppField>
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
                  <Pressable className="items-center gap-2">
                    <QrcodeIcon />
                    <TextCustom className="leading-[150%] !text-neutral-200">
                      Or add via QR code
                    </TextCustom>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
            <form.AppForm>
              <form.SubscribeButton
                onPress={form._handleSubmit}
                isPending={false}
                //   disabled={phoneNumberField.state.value.length < 3}
                label={'Next'}
              />
            </form.AppForm>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default NewContactScreen;
