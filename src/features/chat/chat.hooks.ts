import { useEffect, useRef, useState } from 'react';
import { subscribeToInbox, subscribeToMessages } from './chat.api';
import type { ChatMessage, ChatThread } from './chat.types';

export function useChatInbox(uid: string | null) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uid) {
      setThreads([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsub = subscribeToInbox(
      uid,
      (data) => {
        setThreads(data);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return unsub;
  }, [uid]);

  return { threads, isLoading, error };
}

export function useChatMessages(threadId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!threadId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsub = subscribeToMessages(
      threadId,
      (data) => {
        setMessages(data);
        setIsLoading(false);
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return unsub;
  }, [threadId]);

  return { messages, isLoading, error };
}

export function useTotalUnreadCount(uid: string | null): number {
  const [count, setCount] = useState(0);
  const { threads } = useChatInbox(uid);

  useEffect(() => {
    if (!uid) { setCount(0); return; }
    const total = threads.reduce((sum, t) => {
      const mine = t.buyerId === uid ? t.unreadCountBuyer : t.unreadCountSeller;
      return sum + mine;
    }, 0);
    setCount(total);
  }, [threads, uid]);

  return count;
}
