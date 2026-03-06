import {useCallback} from 'react';
import {likePost, unlikePost} from '../api/likes';
import type {Post} from '../types';
import {useOptimisticToggle} from './useOptimisticToggle';

/**
 * REFACTORED: Extracted from ProfileScreen, TagPostsScreen, BookmarksScreen, PostDetailScreen.
 * Provides a single optimistic like toggle that updates both local state and global cache.
 *
 * @param setPosts  State setter for the local posts array (list screens)
 * @param setPost   State setter for a single post (detail screens)
 */
export function useOptimisticLike(
  setPosts?: React.Dispatch<React.SetStateAction<Post[]>>,
  setPost?: React.Dispatch<React.SetStateAction<Post | null>>,
) {
  return useOptimisticToggle(
    {
      context: 'useOptimisticLike',
      getOptimisticUpdate: useCallback((target: Post) => {
        const nextLiked = !target.is_liked;
        const nextCount = target.like_count + (nextLiked ? 1 : -1);
        return {
          updates: {is_liked: nextLiked, like_count: nextCount},
          rollback: {
            is_liked: target.is_liked,
            like_count: target.like_count,
          },
          request: nextLiked ? likePost : unlikePost,
        };
      }, []),
    },
    setPosts,
    setPost,
  );
}
