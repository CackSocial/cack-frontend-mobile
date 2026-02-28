import {useState, useCallback} from 'react';
import type {Post} from '../types';
import {getTimeline} from '../api/timeline';
import {PAGINATION_LIMIT} from '../config';
import {logError} from '../utils/log';

export function useTimeline() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(
    async (reset = false) => {
      if (loading) return;
      const p = reset ? 1 : page;
      if (!reset && !hasMore) return;

      if (reset) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await getTimeline(p, PAGINATION_LIMIT);
        const data = res.data ?? [];
        setPosts(prev => (reset ? data : [...prev, ...data]));
        setPage(p + 1);
        setHasMore(data.length === PAGINATION_LIMIT);
      } catch (e) {
        logError('useTimeline:fetch', e);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [page, hasMore, loading],
  );

  const refresh = useCallback(() => fetch(true), [fetch]);
  const loadMore = useCallback(() => fetch(false), [fetch]);

  return {posts, setPosts, loading, refreshing, hasMore, refresh, loadMore};
}
