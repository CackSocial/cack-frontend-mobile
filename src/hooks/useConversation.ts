import {useCallback} from 'react';
import type {Message} from '../types';
import {getMessages} from '../api/messages';
import {usePaginatedFetch} from './usePaginatedFetch';

export function useConversation(username: string) {
  const fetchMessagesPage = useCallback(
    async (page: number, limit: number) => {
      const res = await getMessages(username, page, limit);
      return res.data ?? [];
    },
    [username],
  );

  const {
    items: messages,
    setItems: setMessages,
    loading,
    hasMore,
    refresh,
    loadMore,
  } = usePaginatedFetch<Message>({
    fetchPage: fetchMessagesPage,
    errorContext: 'useConversation:fetch',
    mergeItems: (current, incoming) => [...incoming, ...current],
  });

  const addMessage = useCallback((msg: Message) => {
    setMessages(current => [...current, msg]);
  }, [setMessages]);

  return {messages, setMessages, loading, hasMore, refresh, loadMore, addMessage};
}
