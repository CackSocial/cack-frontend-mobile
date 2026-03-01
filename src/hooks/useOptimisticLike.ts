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
      // For reposts, target the original post
      const target = post.post_type === 'repost' && post.original_post ? post.original_post : post;
      const was = target.is_liked;
      const newLiked = !was;
      const newCount = target.like_count + (was ? -1 : 1);

      const applyUpdate = (p: Post): Post => {
        if (p.id === target.id) return {...p, is_liked: newLiked, like_count: newCount};
        if (p.original_post?.id === target.id) {
          return {...p, original_post: {...p.original_post, is_liked: newLiked, like_count: newCount}};
        }
        return p;
      };
      const revertUpdate = (p: Post): Post => {
        if (p.id === target.id) return {...p, is_liked: was, like_count: target.like_count};
        if (p.original_post?.id === target.id) {
          return {...p, original_post: {...p.original_post, is_liked: was, like_count: target.like_count}};
        }
        return p;
      };

      // Optimistic update
      if (setPosts) {
        setPosts(prev => prev.map(applyUpdate));
      }
      if (setPost) {
        setPost(prev => prev ? applyUpdate(prev) : prev);
      }
      cachePost(target.id, {is_liked: newLiked, like_count: newCount});

      try {
        was ? await unlikePost(target.id) : await likePost(target.id);
      } catch (e: unknown) {
        logError('useOptimisticLike', e);
        // Rollback
        if (setPosts) {
          setPosts(prev => prev.map(revertUpdate));
        }
        if (setPost) {
          setPost(prev => prev ? revertUpdate(prev) : prev);
        }
        cachePost(target.id, {is_liked: was, like_count: target.like_count});
      }
    },
    [setPosts, setPost, cachePost],
  );

  return toggleLike;
}
