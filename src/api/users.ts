import client, {buildFormData} from './client';
import type {UserProfile, PaginatedResponse, ImageAsset} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function getUser(username: string): Promise<UserProfile> {
  const {data} = await client.get<UserProfile>(`/users/${username}`);
  return data;
}

export async function updateMe(
  updates: Partial<Pick<UserProfile, 'display_name' | 'bio'>>,
  avatar?: ImageAsset,
): Promise<UserProfile> {
  const form = new FormData();
  if (updates.display_name !== undefined) {
    form.append('display_name', updates.display_name);
  }
  if (updates.bio !== undefined) {
    form.append('bio', updates.bio);
  }
  if (avatar) {
    form.append('avatar', {
      uri: avatar.uri,
      name: avatar.fileName ?? 'avatar.jpg',
      type: avatar.type ?? 'image/jpeg',
    } as unknown as Blob);
  }
  const {data} = await client.put<UserProfile>('/users/me', form, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return data;
}

export async function deleteAccount(password: string): Promise<void> {
  await client.delete('/users/me', {data: {password}});
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
