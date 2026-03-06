import {useCallback} from 'react';
import {bookmarkPost, unbookmarkPost} from '../api/bookmarks';
import type {Post} from '../types';
import {useOptimisticToggle} from './useOptimisticToggle';

/**
 * Optimistic bookmark toggle that updates local state + global cache + API.
 * Same pattern as useOptimisticLike.
 *
 * @param setPosts  State setter for the local posts array (list screens)
 * @param setPost   State setter for a single post (detail screens)
 */
export function useOptimisticBookmark(
  setPosts?: React.Dispatch<React.SetStateAction<Post[]>>,
  setPost?: React.Dispatch<React.SetStateAction<Post | null>>,
) {
  return useOptimisticToggle(
    {
      context: 'useOptimisticBookmark',
      getOptimisticUpdate: useCallback((target: Post) => {
        const nextBookmarked = !target.is_bookmarked;
        return {
          updates: {is_bookmarked: nextBookmarked},
          rollback: {is_bookmarked: target.is_bookmarked},
          request: nextBookmarked ? bookmarkPost : unbookmarkPost,
        };
      }, []),
    },
    setPosts,
    setPost,
  );
}
