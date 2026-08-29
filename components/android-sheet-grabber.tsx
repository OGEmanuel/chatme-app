import { cn } from '@/lib/utils';
import { View } from 'react-native';

export const AndroidSheetGrabber = (props: { className?: string }) => {
  const { className } = props;
  return (
    <View className={cn('ios:hidden items-center py-1', className)}>
      <View className="h-1.5 w-10 rounded-full bg-gray-100 dark:bg-white/10" />
    </View>
  );
};

export default AndroidSheetGrabber;
