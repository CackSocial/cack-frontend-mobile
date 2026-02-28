import client, {buildFormData} from './client';
import type {
  ConversationListItem,
  Message,
  PaginatedResponse,
  ImageAsset,
} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function getConversations(
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<ConversationListItem>> {
  const {data} = await client.get<PaginatedResponse<ConversationListItem>>(
    '/messages/conversations',
    {params: {page, limit}},
  );
  return data;
}

export async function getMessages(
  username: string,
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Message>> {
  const {data} = await client.get<PaginatedResponse<Message>>(
    `/messages/${username}`,
    {params: {page, limit}},
  );
  return data;
}

export async function sendMessage(
  username: string,
  content: string,
  image?: ImageAsset,
): Promise<Message> {
  const form = buildFormData({content}, image);
  const {data} = await client.post<Message>(`/messages/${username}`, form, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return data;
}
