import {useCallback} from 'react';
import {likePost, unlikePost} from '../api/likes';
import {usePostsStore} from '../stores/postsStore';
import {logError} from '../utils/log';
import type {Post} from '../types';

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
  const cachePost = usePostsStore(s => s.cachePost);

  const toggleLike = useCallback(
    async (post: Post) => {
      const was = post.is_liked;
      const newLiked = !was;
      const newCount = post.like_count + (was ? -1 : 1);

      // Optimistic update
      if (setPosts) {
        setPosts(prev =>
          prev.map(p =>
            p.id === post.id
              ? {...p, is_liked: newLiked, like_count: newCount}
              : p,
          ),
        );
      }
      if (setPost) {
        setPost(prev =>
          prev && prev.id === post.id
            ? {...prev, is_liked: newLiked, like_count: newCount}
            : prev,
        );
      }
      cachePost(post.id, {is_liked: newLiked, like_count: newCount});

      try {
        was ? await unlikePost(post.id) : await likePost(post.id);
      } catch (e: unknown) {
        logError('useOptimisticLike', e);
        // Rollback
        if (setPosts) {
          setPosts(prev =>
            prev.map(p =>
              p.id === post.id
                ? {...p, is_liked: was, like_count: post.like_count}
                : p,
            ),
          );
        }
        if (setPost) {
          setPost(prev =>
            prev && prev.id === post.id
              ? {...prev, is_liked: was, like_count: post.like_count}
              : prev,
          );
        }
        cachePost(post.id, {is_liked: was, like_count: post.like_count});
      }
    },
    [setPosts, setPost, cachePost],
  );

  return toggleLike;
}
