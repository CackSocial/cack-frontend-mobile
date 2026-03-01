import client from './client';
import type {Notification, PaginatedResponse} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function getNotifications(
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<PaginatedResponse<Notification>> {
  const {data} = await client.get<PaginatedResponse<Notification>>(
    '/notifications',
    {params: {page, limit}},
  );
  return data;
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await client.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await client.put('/notifications/read-all');
}

export async function getUnreadNotificationCount(): Promise<number> {
  const {data} = await client.get<{count: number}>('/notifications/unread-count');
  return data.count;
}
