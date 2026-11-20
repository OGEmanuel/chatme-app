import PaperAirplaneIcon from '@/assets/icons/jsx/paper-airplane-icon';
import { Colors } from '@/constants/theme';
import { PressableScale } from 'pressto';
import { TextInput, View } from 'react-native';

type MessageComposerProps = {
  message: string;
  editable: boolean;
  isSending: boolean;
  canSend: boolean;
  colorScheme: 'light' | 'dark';
  onChangeText: (text: string) => void;
  onSend: () => void;
};

export function MessageComposer({
  message,
  editable,
  isSending,
  canSend,
  colorScheme,
  onChangeText,
  onSend,
}: MessageComposerProps) {
  return (
    <View className="flex-1 flex-row items-center self-center">
      <TextInput
        value={message}
        editable={editable}
        onChangeText={onChangeText}
        selectionColor={Colors[colorScheme].primary[400]}
        placeholder="Write a message..."
        placeholderTextColor={
          colorScheme === 'dark'
            ? Colors[colorScheme].neutral[200]
            : Colors[colorScheme].neutral[300]
        }
        multiline
        className="android:p-0 max-h-16 flex-1 font-sf-pro-display text-base/[150%] text-neutral-600 dark:text-white"
      />
      <PressableScale
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors[colorScheme].primary[400],
        }}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend, busy: isSending }}
        onPress={onSend}
      >
        <PaperAirplaneIcon />
      </PressableScale>
    </View>
  );
}
