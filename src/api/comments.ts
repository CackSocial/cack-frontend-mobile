import client from './client';
import type {Comment, PaginatedResponse} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function createComment(
  postId: string,
  content: string,
): Promise<Comment> {
  const {data} = await client.post<Comment>(`/posts/${postId}/comments`, {
    content,
  });
  return data;
}

export async function getComments(
  postId: string,
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Comment>> {
  const {data} = await client.get<PaginatedResponse<Comment>>(
    `/posts/${postId}/comments`,
    {params: {page, limit}},
  );
  return data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await client.delete(`/comments/${commentId}`);
}
