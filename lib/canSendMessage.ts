export const canSendMessage = (
  text: string,
  hasDestination: boolean,
  conversationId: string,
  isSending: boolean,
): boolean =>
  text.trim().length > 0 &&
  hasDestination &&
  conversationId.length > 0 &&
  !isSending;
