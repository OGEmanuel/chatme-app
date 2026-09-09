import Svg, { Path } from 'react-native-svg';

const PlusIcon = (props: { size?: number; fill?: string }) => {
  const { size = 24, fill = 'white' } = props;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9996 3.6001C12.6624 3.6001 13.1996 4.13736 13.1996 4.8001V10.8001H19.1996C19.8624 10.8001 20.3996 11.3374 20.3996 12.0001C20.3996 12.6628 19.8623 13.2001 19.1996 13.2001H13.1996V19.2001C13.1996 19.8628 12.6624 20.4001 11.9996 20.4001C11.3369 20.4001 10.7996 19.8628 10.7996 19.2001V13.2001H4.79961C4.13687 13.2001 3.59961 12.6628 3.59961 12.0001C3.59961 11.3374 4.13687 10.8001 4.79961 10.8001L10.7996 10.8001V4.8001C10.7996 4.13736 11.3369 3.6001 11.9996 3.6001Z"
        fill={fill}
      />
    </Svg>
  );
};

export default PlusIcon;
