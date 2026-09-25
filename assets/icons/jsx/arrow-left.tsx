import Svg, { Path } from 'react-native-svg';

const ArrowLeftIcon = (props: {
  className?: string;
  stroke?: string;
  size?: string;
}) => {
  const { className, stroke = 'white', size = '24' } = props;
  return (
    <Svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
    >
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

export default ArrowLeftIcon;
