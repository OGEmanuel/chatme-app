// src/socket/realtime.ts
import { socket } from '.';
import { queryClient } from '@/lib/query-client';
import { useSocketStore } from '../store/sockets-control-store';
import { presenceSubscribe, presenceUnsubscribe } from './commands';

const subs = new Map<string, number>(); // conversationId -> refcount
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

function setFlag(
  field: 'online' | 'typing',
  conversationId: string,
  userId: string,
  value: boolean,
) {
  useSocketStore.setState(s => ({
    [field]: {
      ...s[field],
      [conversationId]: {
        ...(s[field][conversationId] ?? {}),
        [userId]: value,
      },
    },
  }));
}

function clearConversation(conversationId: string) {
  useSocketStore.setState(s => {
    const { [conversationId]: _o, ...online } = s.online;
    const { [conversationId]: _t, ...typing } = s.typing;
    return { online, typing };
  });
}

async function subscribeOnServer(conversationId: string) {
  try {
    const res = await presenceSubscribe(conversationId);
    if (!res.ok) {
      console.warn('presence.subscribe rejected', res.error);
      return;
    }
    if (!subs.has(conversationId) || !socket.connected) return;
    useSocketStore.setState(s => ({
      online: {
        ...s.online,
        [conversationId]: Object.fromEntries(
          res.data.participants.map(p => [p.userId, p.status === 'online']),
        ),
      },
      typing: {
        ...s.typing,
        [conversationId]: Object.fromEntries(
          res.data.typing.map(userId => [userId, true]),
        ),
      },
    }));
  } catch (error) {
    console.warn('presence.subscribe failed', error);
  }
}

/** Call from a screen. Returns a release function. */
export function retainConversation(conversationId: string) {
  const count = (subs.get(conversationId) ?? 0) + 1;
  subs.set(conversationId, count);
  if (count === 1 && socket.connected) subscribeOnServer(conversationId);

  return (): void => {
    const next = (subs.get(conversationId) ?? 1) - 1;
    if (next > 0) {
      subs.set(conversationId, next);
      return;
    }
    subs.delete(conversationId);
    clearConversation(conversationId);
    if (socket.connected) {
      presenceUnsubscribe(conversationId).catch(error =>
        console.warn('presence.unsubscribe failed', error),
      );
    }
  };
}

/** Register once, from startSocketLifecycle. Returns cleanup. */
export function registerRealtimeListeners() {
  const onConnect = () => {
    // subscriptions are lost on reconnect: re-subscribe everything still in use
    subs.forEach((_n, id) => subscribeOnServer(id));
  };

  const onDisconnect = () => {
    typingTimers.forEach(clearTimeout);
    typingTimers.clear();
    // state is stale until the next presence.subscribe snapshot
    useSocketStore.setState({ online: {}, typing: {} });
  };

  const onPresence = (p: {
    conversationId: string;
    userId: string;
    status: 'online' | 'offline';
  }) => setFlag('online', p.conversationId, p.userId, p.status === 'online');
  const onMessageCreated = () => {
    void queryClient.invalidateQueries({ queryKey: ['convos'] });
  };

  const onTypingStarted = (t: {
    conversationId: string;
    userId: string;
    expiresAt: string;
  }) => {
    setFlag('typing', t.conversationId, t.userId, true);
    // the server expires typing at expiresAt, so mirror that locally
    const key = `${t.conversationId}:${t.userId}`;
    clearTimeout(typingTimers.get(key));
    typingTimers.set(
      key,
      setTimeout(
        () => setFlag('typing', t.conversationId, t.userId, false),
        Math.max(0, new Date(t.expiresAt).getTime() - Date.now()),
      ),
    );
  };

  const onTypingStopped = (t: { conversationId: string; userId: string }) => {
    clearTimeout(typingTimers.get(`${t.conversationId}:${t.userId}`));
    setFlag('typing', t.conversationId, t.userId, false);
  };

  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  socket.on('presence.changed', onPresence);
  socket.on('message.created', onMessageCreated);
  socket.on('typing.started', onTypingStarted);
  socket.on('typing.stopped', onTypingStopped);

  return () => {
    socket.off('connect', onConnect);
    socket.off('disconnect', onDisconnect);
    socket.off('presence.changed', onPresence);
    socket.off('message.created', onMessageCreated);
    socket.off('typing.started', onTypingStarted);
    socket.off('typing.stopped', onTypingStopped);
    typingTimers.forEach(clearTimeout);
    typingTimers.clear();
  };
}
