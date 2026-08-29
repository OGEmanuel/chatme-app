import { cn } from '@/lib/utils';
import { Text, TextProps } from 'react-native';

const TextCustom = (props: TextProps) => {
  const { className, children } = props;

  return (
    <Text
      className={cn(
        'font-sf-pro-display text-neutral-900 dark:text-white',
        className,
      )}
    >
      {children}
    </Text>
  );
};

export default TextCustom;
