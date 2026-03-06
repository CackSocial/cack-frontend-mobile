import {useCallback} from 'react';
import {repost, deleteRepost} from '../api/posts';
import type {Post} from '../types';
import {useOptimisticToggle} from './useOptimisticToggle';

/**
 * Optimistic repost toggle that updates local state + global cache + API.
 * Same pattern as useOptimisticLike.
 *
 * @param setPosts  State setter for the local posts array (list screens)
 * @param setPost   State setter for a single post (detail screens)
 */
export function useOptimisticRepost(
  setPosts?: React.Dispatch<React.SetStateAction<Post[]>>,
  setPost?: React.Dispatch<React.SetStateAction<Post | null>>,
) {
  return useOptimisticToggle(
    {
      context: 'useOptimisticRepost',
      getOptimisticUpdate: useCallback((target: Post) => {
        const nextReposted = !target.is_reposted;
        const nextCount = target.repost_count + (nextReposted ? 1 : -1);
        return {
          updates: {is_reposted: nextReposted, repost_count: nextCount},
          rollback: {
            is_reposted: target.is_reposted,
            repost_count: target.repost_count,
          },
          request: nextReposted ? repost : deleteRepost,
        };
      }, []),
    },
    setPosts,
    setPost,
  );
}
