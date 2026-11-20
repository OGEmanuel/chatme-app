import { canSendMessage } from '../canSendMessage';

describe('canSendMessage', () => {
  it('accepts non-empty text for a resolved, idle conversation', () => {
    expect(canSendMessage('Hello', true, 'conversation-1', false)).toBe(true);
  });

  it('rejects empty text', () => {
    expect(canSendMessage('', true, 'conversation-1', false)).toBe(false);
  });

  it('rejects whitespace-only text', () => {
    expect(canSendMessage('   \n\t', true, 'conversation-1', false)).toBe(false);
  });

  it('rejects unresolved, missing, and pending conversations', () => {
    expect(canSendMessage('Hello', false, 'conversation-1', false)).toBe(false);
    expect(canSendMessage('Hello', true, '', false)).toBe(false);
    expect(canSendMessage('Hello', true, 'conversation-1', true)).toBe(false);
  });
});
