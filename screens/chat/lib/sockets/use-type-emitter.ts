// src/socket/useTypingEmitter.ts
import { useCallback, useEffect, useRef } from 'react';
import { typingStart, typingStop } from './commands';

export function useTypingEmitter(conversationId: string) {
  const lastSent = useRef(0);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stop = useCallback(() => {
    if (idle.current) {
      clearTimeout(idle.current);
    }
    if (lastSent.current && conversationId) {
      lastSent.current = 0;
      typingStop(conversationId).catch(error =>
        console.warn('typing.stop failed', error),
      );
    }
  }, [conversationId]);

  const onChangeText = useCallback(() => {
    if (!conversationId) return;
    const now = Date.now();
    if (now - lastSent.current > 3000) {
      lastSent.current = now;
      typingStart(conversationId).catch(error =>
        console.warn('typing.start failed', error),
      );
    }
    if (idle.current) {
      clearTimeout(idle.current);
    }
    idle.current = setTimeout(stop, 2000);
  }, [conversationId, stop]);

  useEffect(() => stop, [stop]); // stop on unmount
  return { onChangeText, stop }; // call stop() after sending a message
}
