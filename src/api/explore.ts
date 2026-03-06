import client from './client';
import {PAGINATION_LIMIT} from '../config';
import type {PaginatedResponse, Post, SuggestedUser} from '../types';

export async function getSuggestedUsers(
  limit = 10,
): Promise<SuggestedUser[]> {
  const {data} = await client.get('/explore/suggested-users', {
    params: {limit},
  });
  return data ?? [];
}

export async function getPopularPosts(
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Post>> {
  const {data} = await client.get('/explore/popular', {
    params: {page, limit},
  });
  return data;
}

export async function getDiscoverFeed(
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Post>> {
  const {data} = await client.get('/explore/discover', {
    params: {page, limit},
  });
  return data;
}
