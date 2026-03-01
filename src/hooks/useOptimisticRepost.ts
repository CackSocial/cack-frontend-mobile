import {useCallback} from 'react';
import {repost, deleteRepost} from '../api/posts';
import {usePostsStore} from '../stores/postsStore';
import {logError} from '../utils/log';
import type {Post} from '../types';

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
  const cachePost = usePostsStore(s => s.cachePost);

  const toggleRepost = useCallback(
    async (post: Post) => {
      const was = post.is_reposted;
      const newReposted = !was;
      const newCount = post.repost_count + (was ? -1 : 1);

      // Optimistic update
      if (setPosts) {
        setPosts(prev =>
          prev.map(p =>
            p.id === post.id
              ? {...p, is_reposted: newReposted, repost_count: newCount}
              : p,
          ),
        );
      }
      if (setPost) {
        setPost(prev =>
          prev && prev.id === post.id
            ? {...prev, is_reposted: newReposted, repost_count: newCount}
            : prev,
        );
      }
      cachePost(post.id, {is_reposted: newReposted, repost_count: newCount});

      try {
        was ? await deleteRepost(post.id) : await repost(post.id);
      } catch (e: unknown) {
        logError('useOptimisticRepost', e);
        // Rollback
        if (setPosts) {
          setPosts(prev =>
            prev.map(p =>
              p.id === post.id
                ? {...p, is_reposted: was, repost_count: post.repost_count}
                : p,
            ),
          );
        }
        if (setPost) {
          setPost(prev =>
            prev && prev.id === post.id
              ? {...prev, is_reposted: was, repost_count: post.repost_count}
              : prev,
          );
        }
        cachePost(post.id, {is_reposted: was, repost_count: post.repost_count});
      }
    },
    [setPosts, setPost, cachePost],
  );

  return toggleRepost;
}
