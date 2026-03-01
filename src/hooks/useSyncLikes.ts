import {useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {usePostsStore} from '../stores/postsStore';
import type {Post} from '../types';

/**
 * Syncs cached post state (likes + comment counts) into local posts on focus.
 * Use in any screen that maintains its own local posts array.
 */
export function useSyncLikes(
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>,
) {
  useFocusEffect(
    useCallback(() => {
      const apply = usePostsStore.getState().applyPostCache;
      setPosts(prev => apply(prev));
    }, [setPosts]),
  );
}

/**
 * Syncs cached post state for a single post on focus.
 * Use in PostDetailScreen or similar single-post views.
 */
export function useSyncPostLike(
  setPost: React.Dispatch<React.SetStateAction<Post | null>>,
) {
  useFocusEffect(
    useCallback(() => {
      const cache = usePostsStore.getState().postCache;
      setPost(prev => {
        if (!prev) return prev;
        const cached = cache[prev.id];
        if (
          cached &&
          (cached.is_liked !== prev.is_liked ||
            cached.like_count !== prev.like_count ||
            cached.comment_count !== prev.comment_count ||
            cached.is_bookmarked !== prev.is_bookmarked ||
            cached.is_reposted !== prev.is_reposted ||
            cached.repost_count !== prev.repost_count)
        ) {
          return {...prev, ...cached};
        }
        return prev;
      });
    }, [setPost]),
  );
}
