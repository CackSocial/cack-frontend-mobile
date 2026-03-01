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
      const was = post.is_bookmarked;
      const newBookmarked = !was;

      // Optimistic update
      if (setPosts) {
        setPosts(prev =>
          prev.map(p =>
            p.id === post.id ? {...p, is_bookmarked: newBookmarked} : p,
          ),
        );
      }
      if (setPost) {
        setPost(prev =>
          prev && prev.id === post.id
            ? {...prev, is_bookmarked: newBookmarked}
            : prev,
        );
      }
      cachePost(post.id, {is_bookmarked: newBookmarked});

      try {
        was ? await unbookmarkPost(post.id) : await bookmarkPost(post.id);
      } catch (e: unknown) {
        logError('useOptimisticBookmark', e);
        // Rollback
        if (setPosts) {
          setPosts(prev =>
            prev.map(p =>
              p.id === post.id ? {...p, is_bookmarked: was} : p,
            ),
          );
        }
        if (setPost) {
          setPost(prev =>
            prev && prev.id === post.id
              ? {...prev, is_bookmarked: was}
              : prev,
          );
        }
        cachePost(post.id, {is_bookmarked: was});
      }
    },
    [setPosts, setPost, cachePost],
  );

  return toggleBookmark;
}
