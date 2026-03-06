import {useCallback, useRef, useState} from 'react';
import {PAGINATION_LIMIT} from '../config';
import {logError} from '../utils/log';

type MergeItems<T> = (current: T[], incoming: T[]) => T[];

interface UsePaginatedFetchOptions<T> {
  fetchPage: (page: number, limit: number) => Promise<T[]>;
  errorContext: string;
  mergeItems?: MergeItems<T>;
  limit?: number;
}

function defaultMerge<T>(current: T[], incoming: T[]): T[] {
  return [...current, ...incoming];
}

export function usePaginatedFetch<T>({
  fetchPage,
  errorContext,
  mergeItems,
  limit = PAGINATION_LIMIT,
}: UsePaginatedFetchOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);
  const mergeRef = useRef<MergeItems<T>>(mergeItems ?? defaultMerge);
  const errorContextRef = useRef(errorContext);

  mergeRef.current = mergeItems ?? defaultMerge;
  errorContextRef.current = errorContext;

  const fetch = useCallback(
    async (reset = false) => {
      if (loadingRef.current) return;

      const page = reset ? 1 : pageRef.current;
      if (!reset && !hasMoreRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const data = await fetchPage(page, limit);
        setItems(current =>
          reset ? data : mergeRef.current(current, data),
        );
        pageRef.current = page + 1;
        hasMoreRef.current = data.length === limit;
        setHasMore(hasMoreRef.current);
      } catch (error: unknown) {
        logError(errorContextRef.current, error);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [fetchPage, limit],
  );

  const refresh = useCallback(() => fetch(true), [fetch]);
  const loadMore = useCallback(() => fetch(false), [fetch]);

  return {items, setItems, loading, hasMore, refresh, loadMore};
}
