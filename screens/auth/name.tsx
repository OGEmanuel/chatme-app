import { useAppForm } from '@/hooks/form';
import { revalidateLogic, useField } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import z from 'zod';
import AuthLayoutWrapper, {
  AuthLayoutHeader,
  AuthLayoutInnerWrapper,
} from './components/layout-wrapper';

const formSchema = z.object({
  name: z.string().min(2, {
    error: 'Your name should be at least 2 characters long',
  }),
});

const NameScreen = () => {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      name: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
      router.push('/(auth)/upload');
    },
  });

  const nameField = useField({
    name: 'name',
    form,
  });

  return (
    <AuthLayoutWrapper>
      <AuthLayoutInnerWrapper>
        <AuthLayoutHeader canGoBack header="Whats your name?">
          Write your name. You can change it back in settings.
        </AuthLayoutHeader>
        <View className="gap-8">
          <form.AppField name="name">
            {field => (
              <field.TextField
                inputLabel="Name"
                isValid={nameField.state.value.length >= 2}
                inputProps={{
                  placeholder: 'Name',
                  autoCorrect: false,
                  textContentType: 'givenName',
                  autoComplete: 'given-name',
                }}
              />
            )}
          </form.AppField>
        </View>
      </AuthLayoutInnerWrapper>
      <form.AppForm>
        <form.SubscribeButton
          onPress={form._handleSubmit}
          isPending={false}
          disabled={nameField.state.value.length < 2}
          label={'Next'}
        />
      </form.AppForm>
    </AuthLayoutWrapper>
  );
};

export default NameScreen;
