import client from './client';
import type {Tag, Post, PaginatedResponse} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function getTrendingTags(): Promise<Tag[]> {
  const {data} = await client.get<Tag[]>('/tags/trending');
  return data;
}

export async function getTagPosts(
  tagName: string,
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Post>> {
  const {data} = await client.get<PaginatedResponse<Post>>(
    `/tags/${tagName}/posts`,
    {params: {page, limit}},
  );
  return data;
}
