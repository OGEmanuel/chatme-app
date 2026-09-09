import { Colors } from '@/constants/theme';
import { PressableScale } from 'pressto';
import { ViewStyle } from 'react-native';

const IconButton = (props: {
  onPress: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
}) => {
  const { onPress, children, style } = props;

  return (
    <PressableScale
      style={{
        width: 40,
        height: 40,
        borderWidth: 1,
        borderColor: Colors.light.other.divider,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        ...style,
      }}
      onPress={onPress}
    >
      {children}
    </PressableScale>
  );
};

export default IconButton;
