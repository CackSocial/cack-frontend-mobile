import {useState, useCallback} from 'react';
import type {Message} from '../types';
import {getMessages} from '../api/messages';
import {PAGINATION_LIMIT} from '../config';

export function useConversation(username: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(
    async (reset = false) => {
      if (loading) return;
      const p = reset ? 1 : page;
      if (!reset && !hasMore) return;

      setLoading(true);
      try {
        const res = await getMessages(username, p, PAGINATION_LIMIT);
        const data = res.data ?? [];
        setMessages(prev =>
          reset ? data : [...data, ...prev],
        );
        setPage(p + 1);
        setHasMore(data.length === PAGINATION_LIMIT);
      } catch {}
      setLoading(false);
    },
    [username, page, hasMore, loading],
  );

  const addMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const refresh = useCallback(() => fetch(true), [fetch]);
  const loadMore = useCallback(() => fetch(false), [fetch]);

  return {messages, setMessages, loading, hasMore, refresh, loadMore, addMessage};
}
