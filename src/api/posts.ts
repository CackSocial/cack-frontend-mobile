import client, {buildFormData} from './client';
import type {Post, PaginatedResponse, ImageAsset} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function createPost(
  content: string,
  image?: ImageAsset,
): Promise<Post> {
  const form = buildFormData({content}, image);
  const {data} = await client.post<Post>('/posts', form, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return data;
}

export async function getPost(id: string): Promise<Post> {
  const {data} = await client.get<Post>(`/posts/${id}`);
  return data;
}

export async function deletePost(id: string): Promise<void> {
  await client.delete(`/posts/${id}`);
}

export async function getUserPosts(
  username: string,
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Post>> {
  const {data} = await client.get<PaginatedResponse<Post>>(
    `/users/${username}/posts`,
    {params: {page, limit}},
  );
  return data;
}

export async function repost(postId: string): Promise<Post> {
  const {data} = await client.post<Post>(`/posts/${postId}/repost`);
  return data;
}

export async function deleteRepost(postId: string): Promise<void> {
  await client.delete(`/posts/${postId}/repost`);
}

export async function quotePost(
  postId: string,
  content: string,
  image?: ImageAsset,
): Promise<Post> {
  const form = buildFormData({content}, image);
  const {data} = await client.post<Post>(`/posts/${postId}/quote`, form, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return data;
}
