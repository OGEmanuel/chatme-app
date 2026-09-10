import Svg, { Path } from 'react-native-svg';

const CheveronLeftIcon = (props: { size?: number; stroke?: string }) => {
  const { size = 24, stroke = 'white' } = props;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 19L8 12L15 5"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default CheveronLeftIcon;
