import {useCallback} from 'react';
import {bookmarkPost, unbookmarkPost} from '../api/bookmarks';
import {usePostsStore} from '../stores/postsStore';
import {logError} from '../utils/log';
import type {Post} from '../types';

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
  const cachePost = usePostsStore(s => s.cachePost);

  const toggleBookmark = useCallback(
    async (post: Post) => {
      // For reposts, target the original post
      const target = post.post_type === 'repost' && post.original_post ? post.original_post : post;
      const was = target.is_bookmarked;
      const newBookmarked = !was;

      const applyUpdate = (p: Post): Post => {
        if (p.id === target.id) return {...p, is_bookmarked: newBookmarked};
        if (p.original_post?.id === target.id) {
          return {...p, original_post: {...p.original_post, is_bookmarked: newBookmarked}};
        }
        return p;
      };
      const revertUpdate = (p: Post): Post => {
        if (p.id === target.id) return {...p, is_bookmarked: was};
        if (p.original_post?.id === target.id) {
          return {...p, original_post: {...p.original_post, is_bookmarked: was}};
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
      cachePost(target.id, {is_bookmarked: newBookmarked});

      try {
        was ? await unbookmarkPost(target.id) : await bookmarkPost(target.id);
      } catch (e: unknown) {
        logError('useOptimisticBookmark', e);
        // Rollback
        if (setPosts) {
          setPosts(prev => prev.map(revertUpdate));
        }
        if (setPost) {
          setPost(prev => prev ? revertUpdate(prev) : prev);
        }
        cachePost(target.id, {is_bookmarked: was});
      }
    },
    [setPosts, setPost, cachePost],
  );

  return toggleBookmark;
}
