import client from './client';
import type {Post, PaginatedResponse} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function getTimeline(
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Post>> {
  const {data} = await client.get<PaginatedResponse<Post>>('/timeline', {
    params: {page, limit},
  });
  return data;
}
