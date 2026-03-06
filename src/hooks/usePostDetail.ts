import {useState, useCallback} from 'react';
import type {Post, Comment} from '../types';
import {getPost} from '../api/posts';
import {getComments} from '../api/comments';
import {logError} from '../utils/log';
import {usePaginatedFetch} from './usePaginatedFetch';

export function usePostDetail(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPost = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPost(postId);
      setPost(data);
    } catch (e) {
      logError('usePostDetail:fetchPost', e);
    }
    setLoading(false);
  }, [postId]);

  const fetchCommentsPage = useCallback(
    async (page: number, limit: number) => {
      const res = await getComments(postId, page, limit);
      return res.data ?? [];
    },
    [postId],
  );

  const {
    items: comments,
    setItems: setComments,
    hasMore: commentsHasMore,
    refresh: refreshComments,
    loadMore: loadMoreComments,
  } = usePaginatedFetch<Comment>({
    fetchPage: fetchCommentsPage,
    errorContext: 'usePostDetail:fetchComments',
  });

  const fetchComments = useCallback(
    async (reset = false) => {
      if (reset) {
        await refreshComments();
        return;
      }

      await loadMoreComments();
    },
    [loadMoreComments, refreshComments],
  );

  const addComment = useCallback((comment: Comment) => {
    setComments(current => [...current, comment]);
    setPost(prev =>
      prev ? {...prev, comment_count: prev.comment_count + 1} : prev,
    );
  }, [setComments]);

  const removeComment = useCallback((commentId: string) => {
    setComments(current => current.filter(comment => comment.id !== commentId));
    setPost(prev =>
      prev ? {...prev, comment_count: prev.comment_count - 1} : prev,
    );
  }, [setComments]);

  return {
    post,
    setPost,
    comments,
    loading,
    commentsHasMore,
    fetchPost,
    fetchComments,
    addComment,
    removeComment,
  };
}
