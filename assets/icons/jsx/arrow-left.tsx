import Svg, { Path } from 'react-native-svg';

const ArrowLeftIcon = (props: { className?: string; stroke?: string }) => {
  const { className, stroke = 'white' } = props;
  return (
    <Svg
      className={className}
      width="24"
      height="24"
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
