import {useState, useCallback, useRef} from 'react';
import type {Post} from '../types';
import {getUserPosts} from '../api/posts';
import {PAGINATION_LIMIT} from '../config';
import {logError} from '../utils/log';

export function useUserPosts(username: string) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);

  const fetch = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;
      const page = reset ? 1 : pageRef.current;
      if (!reset && !hasMoreRef.current) return;

      loadingRef.current = true;
      setLoading(true);
      try {
        const res = await getUserPosts(username, page, PAGINATION_LIMIT);
        const data = res.data ?? [];
        setPosts(prev => (reset ? data : [...prev, ...data]));
        pageRef.current = page + 1;
        hasMoreRef.current = data.length === PAGINATION_LIMIT;
        setHasMore(hasMoreRef.current);
      } catch (e) {
        logError('useUserPosts:fetch', e);
      }
      loadingRef.current = false;
      setLoading(false);
    },
    [username],
  );

  const refresh = useCallback(() => fetch(true), [fetch]);
  const loadMore = useCallback(() => fetch(false), [fetch]);

  return {posts, setPosts, loading, hasMore, refresh, loadMore};
}
