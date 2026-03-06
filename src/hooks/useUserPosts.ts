import {useCallback} from 'react';
import type {Post} from '../types';
import {getUserPosts} from '../api/posts';
import {usePaginatedFetch} from './usePaginatedFetch';

export function useUserPosts(username: string) {
  const fetchUserPosts = useCallback(
    async (page: number, limit: number) => {
      const res = await getUserPosts(username, page, limit);
      return res.data ?? [];
    },
    [username],
  );

  const {
    items: posts,
    setItems: setPosts,
    loading,
    hasMore,
    refresh,
    loadMore,
  } = usePaginatedFetch<Post>({
    fetchPage: fetchUserPosts,
    errorContext: 'useUserPosts:fetch',
  });

  return {posts, setPosts, loading, hasMore, refresh, loadMore};
}
