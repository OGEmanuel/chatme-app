import Svg, { Path } from 'react-native-svg';

const LockClosedIcon = (props: { size?: number; fill?: string }) => {
  const { size = 32, fill = '#57B77D' } = props;

  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.9998 14.4V11.2C7.9998 6.78167 11.5815 3.19995 15.9998 3.19995C20.4181 3.19995 23.9998 6.78167 23.9998 11.2V14.4C25.7671 14.4 27.1998 15.8326 27.1998 17.6V25.5999C27.1998 27.3673 25.7671 28.7999 23.9998 28.7999H7.9998C6.23249 28.7999 4.7998 27.3673 4.7998 25.5999V17.6C4.7998 15.8326 6.23249 14.4 7.9998 14.4ZM20.7998 11.2V14.4H11.1998V11.2C11.1998 8.54898 13.3488 6.39995 15.9998 6.39995C18.6508 6.39995 20.7998 8.54898 20.7998 11.2Z"
        fill={fill}
      />
    </Svg>
  );
};

export default LockClosedIcon;
