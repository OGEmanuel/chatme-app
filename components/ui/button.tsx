import { Colors } from '@/constants/theme';
import { cn } from '@/lib/utils';
import { PressableScale } from 'pressto';
import { ActivityIndicator, Text, useColorScheme } from 'react-native';

const Button = (props: {
  label: string;
  disabled?: boolean;
  isPending?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
}) => {
  const { label, disabled, onPress, isPending, variant = 'primary' } = props;
  const colorScheme = useColorScheme();

  return (
    <PressableScale
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor:
          variant === 'primary'
            ? disabled
              ? Colors[colorScheme ?? 'light'].primary[200]
              : Colors[colorScheme ?? 'light'].primary[400]
            : Colors[colorScheme ?? 'light'].primary[50],
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isPending ? (
        <ActivityIndicator
          size="small"
          color={colorScheme === 'dark' ? 'white' : 'black'}
        />
      ) : (
        <Text
          className={cn(
            'font-sf-pro-bold text-sm/[150%]',
            variant === 'primary' ? 'text-white' : 'text-primary-400',
          )}
        >
          {label}
        </Text>
      )}
    </PressableScale>
  );
};

export default Button;
