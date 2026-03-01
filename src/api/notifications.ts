import client from './client';
import type {Notification} from '../types';
import {PAGINATION_LIMIT} from '../config';

export async function getNotifications(
  page = 1,
  limit = PAGINATION_LIMIT,
): Promise<Notification[]> {
  const {data} = await client.get<Notification[]>(
    '/notifications',
    {params: {page, limit}},
  );
  // Backend uses response.Success (non-paginated) so interceptor returns a plain array
  return Array.isArray(data) ? data : [];
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
