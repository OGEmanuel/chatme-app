import { fireEvent, render, screen } from '@testing-library/react-native';
import { MessageComposer } from '../message-composer';

jest.mock('pressto', () => ({
  PressableScale: 'Pressable',
}));

jest.mock('@/assets/icons/jsx/paper-airplane-icon', () => () => null);

describe('MessageComposer', () => {
  it('disables Send for an empty draft', () => {
    render(
      <MessageComposer
        message=""
        editable
        isSending={false}
        canSend={false}
        colorScheme="light"
        onChangeText={jest.fn()}
        onSend={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Send message').props.accessibilityState.disabled).toBe(
      true,
    );
  });

  it('updates the draft and sends a non-empty draft', () => {
    const onChangeText = jest.fn();
    const onSend = jest.fn();
    render(
      <MessageComposer
        message=""
        editable
        isSending={false}
        canSend
        colorScheme="light"
        onChangeText={onChangeText}
        onSend={onSend}
      />,
    );

    fireEvent.changeText(screen.getByPlaceholderText('Write a message...'), 'Hello');
    fireEvent.press(screen.getByLabelText('Send message'));

    expect(onChangeText).toHaveBeenCalledWith('Hello');
    expect(onSend).toHaveBeenCalledTimes(1);
  });
});
