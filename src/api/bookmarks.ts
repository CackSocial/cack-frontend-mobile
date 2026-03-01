import client from './client';
import type {Post, PaginatedResponse} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function bookmarkPost(postId: string): Promise<void> {
  await client.post(`/posts/${postId}/bookmark`);
}

export async function unbookmarkPost(postId: string): Promise<void> {
  await client.delete(`/posts/${postId}/bookmark`);
}

export async function getBookmarks(
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Post>> {
  const {data} = await client.get<PaginatedResponse<Post>>('/bookmarks', {
    params: {page, limit},
  });
  return data;
}
