import {useState, useCallback} from 'react';
import type {Post, Comment} from '../types';
import {getPost} from '../api/posts';
import {getComments} from '../api/comments';
import {PAGINATION_LIMIT} from '../config';
import {logError} from '../utils/log';

export function usePostDetail(postId: string) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(true);
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

  const fetchComments = useCallback(
    async (reset = false) => {
      const p = reset ? 1 : commentsPage;
      if (!reset && !commentsHasMore) return;

      try {
        const res = await getComments(postId, p, PAGINATION_LIMIT);
        const data = res.data ?? [];
        setComments(prev => (reset ? data : [...prev, ...data]));
        setCommentsPage(p + 1);
        setCommentsHasMore(data.length === PAGINATION_LIMIT);
      } catch (e) {
        logError('usePostDetail:fetchComments', e);
      }
    },
    [postId, commentsPage, commentsHasMore],
  );

  const addComment = useCallback((comment: Comment) => {
    setComments(prev => [...prev, comment]);
    setPost(prev =>
      prev ? {...prev, comment_count: prev.comment_count + 1} : prev,
    );
  }, []);

  const removeComment = useCallback((commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setPost(prev =>
      prev ? {...prev, comment_count: prev.comment_count - 1} : prev,
    );
  }, []);

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
