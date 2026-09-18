import { getFullWidth } from '@/lib/utils';
import { Image, View } from 'react-native';

const MyCode = () => {
  return (
    <View
      style={{
        width: getFullWidth(),
      }}
      className="flex-1 items-center justify-center px-6"
    >
      <View className="size-[13.5rem] overflow-hidden rounded-2xl">
        <Image
          source={{
            uri: 'https://res.cloudinary.com/dl56ef7sx/image/upload/v1789738907/7c4e7655aea750ec43c715603efb4f4cc9f15fcb_klgq48.png',
          }}
          className="size-full"
        />
      </View>
    </View>
  );
};

export default MyCode;
