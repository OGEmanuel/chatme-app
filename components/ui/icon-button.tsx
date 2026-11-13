import { Colors } from '@/constants/theme';
import { PressableScale } from 'pressto';
import { ViewStyle } from 'react-native';

const IconButton = (props: {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
  disabled?: boolean;
}) => {
  const { onPress, children, style, accessibilityLabel, disabled } = props;

  return (
    <PressableScale
      style={[
        {
          width: 40,
          height: 40,
          borderWidth: 1,
          borderColor: Colors.light.other.divider,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 12,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      {children}
    </PressableScale>
  );
};

export default IconButton;
