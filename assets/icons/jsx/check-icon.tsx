import Svg, { Path } from 'react-native-svg';

const CheckIcon = (props: { size?: string; stroke?: string }) => {
  const { size = '24', stroke = 'white' } = props;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13L9 17L19 7"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CheckIcon;
