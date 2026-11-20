import { usePendingSendStore } from '../lib/store/pending-send-store';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

describe('pending send reconciliation', () => {
  beforeEach(() => {
    usePendingSendStore.setState({ operations: [] });
  });

  it('keeps a failed payload and original client ID durably retryable', () => {
    const operation = {
      accountId: 'account-1',
      conversationId: 'conversation-1',
      clientMessageId: 'client-1',
      text: 'Keep this draft',
      createdAt: '2026-11-20T12:00:00.000Z',
      status: 'pending' as const,
    };

    usePendingSendStore.getState().add(operation);
    usePendingSendStore
      .getState()
      .setStatus('account-1', 'client-1', 'failed');

    expect(usePendingSendStore.getState().operations).toEqual([
      { ...operation, status: 'failed' },
    ]);
  });

  it('removes an operation only after authoritative server confirmation', () => {
    usePendingSendStore.getState().add({
      accountId: 'account-1',
      conversationId: 'conversation-1',
      clientMessageId: 'client-confirmed',
      text: 'Confirmed',
      createdAt: '2026-11-20T12:00:00.000Z',
      status: 'pending',
    });

    usePendingSendStore
      .getState()
      .remove('account-1', 'client-confirmed');

    expect(usePendingSendStore.getState().operations).toEqual([]);
  });
});
