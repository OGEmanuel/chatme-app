import ArrowLeftIcon from '@/assets/icons/jsx/arrow-left';
import IconButton from '@/components/ui/icon-button';
import TextCustom from '@/components/ui/text';
import { Colors } from '@/constants/theme';
import { useAppForm } from '@/hooks/form';
import { cn } from '@/lib/utils';
import { revalidateLogic, useField } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import { PressableScale } from 'pressto';
import { useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import z from 'zod';
import BackspaceIcon from './assets/icons/backspace-icon';

const PIN_LENGTH = 4;

const formSchema = z.object({
  pin: z.string().length(PIN_LENGTH, { message: 'Invalid pin code' }),
});

const SetupPinScreen = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      pin: '',
    },
    validationLogic: revalidateLogic(),
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  const pinField = useField({
    name: 'pin',
    form,
  });

  const handlePress = (btn: string) => {
    if (pinField.state.value.length < PIN_LENGTH) {
      pinField.setValue(pinField.state.value + btn);
    }
  };

  const handleBackspace = () => {
    if (pinField.state.value.length > 0) {
      pinField.setValue(pinField.state.value.slice(0, -1));
    }
  };

  useEffect(() => {
    if (pinField.state.value.length === PIN_LENGTH) {
      form._handleSubmit();
    }
  }, [pinField.state.value]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 px-6 pb-2 pt-3">
      <View className="flex flex-1 justify-between pb-7">
        <View className="gap-20">
          <IconButton onPress={() => router.back()}>
            <ArrowLeftIcon
              stroke={colorScheme === 'dark' ? 'white' : 'black'}
            />
          </IconButton>
          <View className="gap-8">
            <View className="items-center gap-3">
              <TextCustom className="text-center font-sf-pro-bold text-2xl/[125%]">
                Setup pin code
              </TextCustom>
              <TextCustom className="max-w-60 text-center text-sm/[150%] tracking-[0.5px] text-neutral-300 dark:text-neutral-200">
                Make sure the code is safe and no one else knows.
              </TextCustom>
            </View>
            <View className="flex-row gap-4 self-center">
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <View
                  key={index}
                  className={cn(
                    'size-4 items-center justify-center rounded-full border border-neutral-50 dark:border-neutral-300',
                    index < pinField.state.value.length &&
                      '!border-transparent bg-primary-400',
                  )}
                />
              ))}
            </View>
          </View>
        </View>
        <View className="flex-row flex-wrap justify-center gap-x-14 gap-y-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 0].map(btn => (
            <PressableScale
              disabled={btn === 10}
              onPress={() => handlePress(btn.toString())}
              style={{
                height: 72,
                width: 72,
                borderRadius: 999,
                borderWidth: colorScheme === 'dark' ? 0 : 1,
                backgroundColor:
                  colorScheme === 'light'
                    ? undefined
                    : Colors.light.neutral[700],
                borderColor: Colors[colorScheme ?? 'light'].other.divider,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: btn === 10 ? 0 : 1,
              }}
              key={btn}
            >
              <TextCustom className="font-sf-pro-bold text-2xl/[125%]">
                {btn}
              </TextCustom>
            </PressableScale>
          ))}
          <PressableScale
            style={{
              height: 72,
              width: 72,
              borderRadius: 999,
              borderWidth: colorScheme === 'dark' ? 0 : 1,
              backgroundColor:
                colorScheme === 'light' ? undefined : Colors.light.neutral[700],
              borderColor: Colors[colorScheme ?? 'light'].other.divider,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleBackspace}
          >
            <BackspaceIcon
              fill={
                colorScheme === 'dark' ? 'white' : Colors.light.neutral[900]
              }
            />
          </PressableScale>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SetupPinScreen;
