import { View } from 'react-native';
import { Text } from 'react-native-svg';
import { ToastConfig } from 'react-native-toast-message';
import TextCustom from '../ui/text';

const toastConfig: ToastConfig = {
  success: ({ text1, text2 }) => (
    <View
      className="w-[80%] flex-row items-center gap-2 rounded-xl bg-primary-400 p-3"
      style={{
        shadowColor: '#08080E',
        shadowOffset: {
          width: 1,
          height: 4,
        },
        shadowOpacity: 0.059,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View>
        {text1 && (
          <TextCustom className="font-sf-pro-medium leading-[22px] -tracking-[0.05em] text-white">
            {text1}
          </TextCustom>
        )}
        {text2 && (
          <TextCustom className="leading-[22px] -tracking-[0.05em] !text-white">
            {text2}
          </TextCustom>
        )}
      </View>
    </View>
  ),

  error: ({ text1, text2 }) => (
    <View
      className="bg-other-danger w-[80%] flex-row items-center gap-2 rounded-xl p-3"
      style={{
        shadowColor: '#08080E',
        shadowOffset: {
          width: 1,
          height: 4,
        },
        shadowOpacity: 0.059,
        shadowRadius: 12,
        elevation: 4,
      }}
    >
      <View>
        {text1 && (
          <TextCustom className="font-sf-pro-medium leading-[22px] -tracking-[0.05em] text-white">
            {text1}
          </TextCustom>
        )}
        {text2 && (
          <TextCustom className="leading-[22px] -tracking-[0.05em] text-white">
            {text2}
          </TextCustom>
        )}
      </View>
    </View>
  ),

  info: ({ text1, text2 }) => (
    <View>
      <View>
        {text1 && <Text>{text1}</Text>}
        {text2 && <Text>{text2}</Text>}
      </View>
    </View>
  ),
};

export { toastConfig };
