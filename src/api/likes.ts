import client from './client';
import type {UserProfile, PaginatedResponse} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function likePost(postId: string): Promise<void> {
  await client.post(`/posts/${postId}/like`);
}

export async function unlikePost(postId: string): Promise<void> {
  await client.delete(`/posts/${postId}/like`);
}

export async function getPostLikers(
  postId: string,
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<UserProfile>> {
  const {data} = await client.get<PaginatedResponse<UserProfile>>(
    `/posts/${postId}/likes`,
    {params: {page, limit}},
  );
  return data;
}
