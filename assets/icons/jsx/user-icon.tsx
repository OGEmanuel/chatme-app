import Svg, { Path } from 'react-native-svg';

const UserIcon = (props: { className?: string; fill?: string }) => {
  const { className, fill = '#6E8597' } = props;

  return (
    <Svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
    >
      <Path
        d="M10 9C11.6569 9 13 7.65685 13 6C13 4.34315 11.6569 3 10 3C8.34315 3 7 4.34315 7 6C7 7.65685 8.34315 9 10 9Z"
        fill={fill}
      />
      <Path
        d="M3 18C3 14.134 6.13401 11 10 11C13.866 11 17 14.134 17 18H3Z"
        fill={fill}
      />
    </Svg>
  );
};

export default UserIcon;
