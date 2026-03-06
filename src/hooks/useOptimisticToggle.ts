import {useCallback, useRef} from 'react';
import {usePostsStore} from '../stores/postsStore';
import {logError} from '../utils/log';
import type {Post} from '../types';
import {resolveActionTarget, updatePostReference} from '../utils/posts';

interface OptimisticToggleConfig {
  context: string;
  getOptimisticUpdate: (target: Post) => {
    updates: Partial<Post>;
    rollback: Partial<Post>;
    request: (postId: string) => Promise<unknown>;
  };
}

export function useOptimisticToggle(
  config: OptimisticToggleConfig,
  setPosts?: React.Dispatch<React.SetStateAction<Post[]>>,
  setPost?: React.Dispatch<React.SetStateAction<Post | null>>,
) {
  const cachePost = usePostsStore(s => s.cachePost);
  const configRef = useRef(config);
  configRef.current = config;

  return useCallback(
    async (post: Post) => {
      const {context, getOptimisticUpdate} = configRef.current;
      const target = resolveActionTarget(post);
      const {updates, rollback, request} = getOptimisticUpdate(target);

      if (setPosts) {
        setPosts(current =>
          current.map(entry => updatePostReference(entry, target.id, updates)),
        );
      }

      if (setPost) {
        setPost(current =>
          current ? updatePostReference(current, target.id, updates) : current,
        );
      }

      cachePost(target.id, updates);

      try {
        await request(target.id);
      } catch (error: unknown) {
        logError(context, error);

        if (setPosts) {
          setPosts(current =>
            current.map(entry => updatePostReference(entry, target.id, rollback)),
          );
        }

        if (setPost) {
          setPost(current =>
            current ? updatePostReference(current, target.id, rollback) : current,
          );
        }

        cachePost(target.id, rollback);
      }
    },
    [cachePost, setPost, setPosts],
  );
}
