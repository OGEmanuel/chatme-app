import { useFieldContext, useFormContext } from '@/hooks/form-contexts';
import { cn } from '@/lib/utils';
import UserIcon from '@/assets/icons/jsx/user-icon';
import { Colors } from '@/constants/theme';
import { useSelector } from '@tanstack/react-form';
import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  TextInputProps,
  useColorScheme,
  View,
} from 'react-native';
import Button from './ui/button';
import TextCustom from './ui/text';

export function SubscribeButton({
  label,
  isPending,
  onPress,
  disabled,
}: {
  label: string;
  className?: string;
  isPending?: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={state => state.isSubmitting}>
      {isSubmitting => (
        <Button
          onPress={onPress}
          isPending={isPending || isSubmitting}
          disabled={isPending || isSubmitting || disabled}
          label={label}
        />
      )}
    </form.Subscribe>
  );
}

const ErrorMessages = ({
  errors,
  className,
}: {
  errors: Array<string | { message: string }>;
  className?: string;
}) => {
  return (
    <>
      {errors.map(error => (
        <View
          key={typeof error === 'string' ? error : error.message}
          className="flex-row items-center gap-2"
        >
          <TextCustom
            className={cn('font-inter text-sm/5 !text-red-600', className)}
          >
            {typeof error === 'string' ? error : error.message}
          </TextCustom>
        </View>
      ))}
    </>
  );
};

type TextFieldProps = {
  inputProps?: TextInputProps;
  inputLabel?: string;
  onPasswordViewToggle?: () => void;
  shouldHideError?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
  floatValue?: number;
  labelWrapperClassName?: string;
  countryCode?: string;
  countryFlag?: string;
  isPhoneInput?: boolean;
  isValid?: boolean;
};

export const TextField = (props: TextFieldProps) => {
  const {
    inputProps,
    inputLabel,
    countryCode,
    countryFlag,
    shouldHideError,
    wrapperClassName,
    isPhoneInput,
    isValid,
  } = props;
  const field = useFieldContext<string>();
  const errors = useSelector(field.store, state => state.meta.errors);
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme();

  return (
    <View className="gap-2">
      <View>
        <TextCustom className="font-sf-pro-medium text-sm/[150%] dark:text-neutral-50">
          {inputLabel}
        </TextCustom>
      </View>
      <View
        className={cn(
          'h-14 flex-row items-center rounded-2xl border border-other-divider px-5',
          isPhoneInput ? 'gap-4' : 'gap-3',
          isValid
            ? 'border-primary-400 bg-primary-50 dark:bg-neutral-800'
            : 'dark:border-neutral-300',
        )}
      >
        {isPhoneInput ? (
          <Link href="/(form-sheets)/world-countries" push asChild>
            <Pressable className="flex-row items-center gap-3">
              <TextCustom className="">{countryFlag}</TextCustom>
              <TextCustom className="font-sf-pro-bold text-sm/[150%]">
                {countryCode}
              </TextCustom>
            </Pressable>
          </Link>
        ) : (
          <UserIcon
            fill={
              isValid
                ? Colors.light.primary[400]
                : colorScheme === 'dark'
                  ? Colors.dark.neutral[200]
                  : Colors.light.neutral[300]
            }
          />
        )}
        <TextInput
          className={cn(
            'ios:h-5 android:py-0 android:px-0 font-inter flex-1 font-sf-pro-medium text-sm/[150%] text-neutral-900 dark:text-white',
            inputProps?.className,
          )}
          placeholderTextColor={
            colorScheme === 'dark'
              ? Colors.dark.neutral[300]
              : Colors.light.neutral[200]
          }
          ref={inputRef}
          value={field.state.value}
          onFocus={e => {
            inputProps?.onFocus?.(e);
          }}
          onBlur={e => {
            field.handleBlur();
            inputProps?.onBlur?.(e);
          }}
          onChangeText={text => {
            field.handleChange(text);
            inputProps?.onChangeText?.(text);
          }}
          {...inputProps}
        />
      </View>
      {field.state.meta.isTouched && !shouldHideError && (
        <ErrorMessages errors={errors} />
      )}
    </View>
  );
};

export const OTPField = (props: {
  OTP_LENGTH?: number;
  shouldHideError?: boolean;
}) => {
  const { OTP_LENGTH = 4, shouldHideError } = props;
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const field = useFieldContext<string>();
  const errors = useSelector(field.store, state => state.meta.errors);
  const code = field.state.value;

  useEffect(() => {
    if (!isFocused) {
      inputRef.current?.focus();
    }
  }, [isFocused, inputRef]);

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= OTP_LENGTH) {
      field.handleChange(cleaned);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    field.handleBlur();
  };

  return (
    <View className="relative gap-2">
      <Pressable onPress={() => inputRef.current?.focus()}>
        <TextInput
          ref={inputRef}
          value={field.state.value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          className="absolute opacity-0"
          textContentType="oneTimeCode"
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
        />
        <View className="flex-row gap-4">
          {Array.from({ length: OTP_LENGTH }).map((_, index) => {
            const isActive = isFocused && index === code.length;

            return (
              <Pressable
                key={index}
                onPress={() => inputRef.current?.focus()}
                className={cn(
                  'size-14 items-center justify-center rounded-2xl border',
                  isActive
                    ? 'border-primary-400 bg-primary-50 dark:bg-neutral-800'
                    : 'border-other-divider dark:border-neutral-300',
                )}
              >
                <TextCustom className="font-sf-pro-bold text-[1.75rem]/[125%]">
                  {code[index] || ''}
                </TextCustom>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
      {field.state.meta.isTouched && !shouldHideError && (
        <ErrorMessages errors={errors} />
      )}
    </View>
  );
};

type RadioButtonProps = {
  value: string;
  label: string;
  shouldHideError?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
};

export function RadioButton({
  value,
  label,
  shouldHideError,
  wrapperClassName,
  labelClassName,
}: RadioButtonProps) {
  const field = useFieldContext<string>();
  const errors = useSelector(field.store, state => state.meta.errors);

  const selected = field.state.value === value;

  return (
    <View className={cn('gap-1', wrapperClassName)}>
      <Pressable
        onPress={() => field.handleChange(value)}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
        className="flex-row items-center justify-between"
      >
        <TextCustom
          className={cn(
            'font-inter-semibold leading-[22px]',
            label === 'Saved' && 'text-yellow-700',
            labelClassName,
          )}
        >
          {label}
        </TextCustom>
        <View
          className={`border-neutralDark-500 size-9 items-center justify-center rounded-full border-[2.25px]`}
        >
          <View
            className={cn(
              'size-3 rounded-full',
              selected
                ? 'bg-gray-400'
                : 'border-neutralDark-500 border-[2.25px]',
            )}
          />
        </View>
      </Pressable>
      {field.state.meta.isTouched && !shouldHideError && (
        <ErrorMessages errors={errors} />
      )}
    </View>
  );
}
