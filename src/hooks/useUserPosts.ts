import {useState, useCallback} from 'react';
import type {Post} from '../types';
import {getUserPosts} from '../api/posts';
import {PAGINATION_LIMIT} from '../config';

export function useUserPosts(username: string) {
  const [posts, setPosts] = useState<Post[]>([]);
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
        const res = await getUserPosts(username, p, PAGINATION_LIMIT);
        const data = res.data ?? [];
        setPosts(prev => (reset ? data : [...prev, ...data]));
        setPage(p + 1);
        setHasMore(data.length === PAGINATION_LIMIT);
      } catch {}
      setLoading(false);
    },
    [username, page, hasMore, loading],
  );

  const refresh = useCallback(() => fetch(true), [fetch]);
  const loadMore = useCallback(() => fetch(false), [fetch]);

  return {posts, setPosts, loading, hasMore, refresh, loadMore};
}
