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
      // For reposts, target the original post
      const target = post.post_type === 'repost' && post.original_post ? post.original_post : post;
      const was = target.is_reposted;
      const newReposted = !was;
      const newCount = target.repost_count + (was ? -1 : 1);

      const applyUpdate = (p: Post): Post => {
        if (p.id === target.id) return {...p, is_reposted: newReposted, repost_count: newCount};
        if (p.original_post?.id === target.id) {
          return {...p, original_post: {...p.original_post, is_reposted: newReposted, repost_count: newCount}};
        }
        return p;
      };
      const revertUpdate = (p: Post): Post => {
        if (p.id === target.id) return {...p, is_reposted: was, repost_count: target.repost_count};
        if (p.original_post?.id === target.id) {
          return {...p, original_post: {...p.original_post, is_reposted: was, repost_count: target.repost_count}};
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
      cachePost(target.id, {is_reposted: newReposted, repost_count: newCount});

      try {
        was ? await deleteRepost(target.id) : await repost(target.id);
      } catch (e: unknown) {
        logError('useOptimisticRepost', e);
        // Rollback
        if (setPosts) {
          setPosts(prev => prev.map(revertUpdate));
        }
        if (setPost) {
          setPost(prev => prev ? revertUpdate(prev) : prev);
        }
        cachePost(target.id, {is_reposted: was, repost_count: target.repost_count});
      }
    },
    [setPosts, setPost, cachePost],
  );

  return toggleRepost;
}
