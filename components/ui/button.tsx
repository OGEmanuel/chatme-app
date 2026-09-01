import { Colors } from '@/constants/theme';
import { PressableScale } from 'pressto';
import { ActivityIndicator, Text, useColorScheme } from 'react-native';

const Button = (props: {
  label: string;
  disabled?: boolean;
  isPending?: boolean;
  onPress?: () => void;
}) => {
  const { label, disabled, onPress, isPending } = props;
  const colorScheme = useColorScheme();

  return (
    <PressableScale
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: disabled
          ? Colors.light.primary[200]
          : Colors.light.primary[400],
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
        <Text className="font-sf-pro-bold text-sm/[150%] text-white">
          {label}
        </Text>
      )}
    </PressableScale>
  );
};

export default Button;
