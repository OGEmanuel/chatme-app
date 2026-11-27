import { useAuthStore } from '../store/auth-store';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(() => Promise.resolve()),
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

describe('auth routing recovery', () => {
  beforeEach(() => {
    useAuthStore.setState({
      hasHydrated: true,
      hydrationError: null,
      accessToken: null,
      refreshToken: null,
      userId: null,
      sessionGeneration: 1,
      isLoggedIn: false,
      hasCompletedOnboarding: false,
      pendingDestination: null,
    });
  });

  it('preserves a concrete chat destination through logout', () => {
    useAuthStore.getState().setPendingDestination({
      pathname: '/chat/[id]',
      params: { id: 'conversation-42', target: 'conversation' },
    });

    useAuthStore.getState().logOut();

    expect(useAuthStore.getState().pendingDestination).toEqual({
      pathname: '/chat/[id]',
      params: { id: 'conversation-42', target: 'conversation' },
    });
  });

  it('uses server profile completion and resumes after setup', () => {
    useAuthStore.getState().setPendingDestination({
      pathname: '/chat/[id]',
      params: { id: 'conversation-42', target: 'conversation' },
    });
    useAuthStore.getState().completeOnboarding();

    expect(useAuthStore.getState().hasCompletedOnboarding).toBe(true);

    useAuthStore.getState().consumePendingDestination();
    expect(useAuthStore.getState().pendingDestination).toBeNull();
  });

  it('does not mark hydration complete after a storage read failure', () => {
    useAuthStore.setState({
      hasHydrated: false,
      hydrationError: 'Could not read your saved login',
    });

    expect(useAuthStore.getState().hasHydrated).toBe(false);
    expect(useAuthStore.getState().hydrationError).toContain(
      'Could not read your saved login',
    );
  });
});
