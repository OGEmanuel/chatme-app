import Toast from 'react-native-toast-message';

export const toast = {
  success(title: string, message?: string) {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
    });
  },

  error(title: string, message?: string) {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
    });
  },

  info(title: string, message?: string) {
    Toast.show({
      type: 'info',
      text1: title,
      text2: message,
    });
  },

  action({
    title,
    message,
    icon,
    action,
    className,
  }: {
    title: string;
    message?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    className?: string;
  }) {
    Toast.show({
      type: 'action',
      text1: title,
      text2: message,
      props: {
        icon,
        action,
        className,
      },
      position: 'bottom',
      bottomOffset: 100,
    });
  },

  hide() {
    Toast.hide();
  },
};
