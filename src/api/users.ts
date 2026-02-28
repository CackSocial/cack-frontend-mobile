import client from './client';
import type {UserProfile, PaginatedResponse} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function getUser(username: string): Promise<UserProfile> {
  const {data} = await client.get<UserProfile>(`/users/${username}`);
  return data;
}

export async function updateMe(
  updates: Partial<Pick<UserProfile, 'display_name' | 'bio'>>,
): Promise<UserProfile> {
  const {data} = await client.put<UserProfile>('/users/me', updates);
  return data;
}

export async function searchUsers(
  query: string,
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<UserProfile>> {
  const {data} = await client.get<PaginatedResponse<UserProfile>>('/users', {
    params: {q: query, page, limit},
  });
  return data;
}

export async function getFollowers(
  username: string,
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<UserProfile>> {
  const {data} = await client.get<PaginatedResponse<UserProfile>>(
    `/users/${username}/followers`,
    {params: {page, limit}},
  );
  return data;
}

export async function getFollowing(
  username: string,
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<UserProfile>> {
  const {data} = await client.get<PaginatedResponse<UserProfile>>(
    `/users/${username}/following`,
    {params: {page, limit}},
  );
  return data;
}
