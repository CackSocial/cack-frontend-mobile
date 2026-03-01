import {create} from 'zustand';
import type {Notification} from '../types';
import * as api from '../api';
import {PAGINATION_LIMIT} from '../config';
import {logError} from '../utils/log';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  fetchNotifications(reset?: boolean): Promise<void>;
  fetchUnreadCount(): Promise<void>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  addNotification(notification: Notification): void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  page: 1,
  hasMore: true,
  isLoading: false,

  async fetchNotifications(reset = false) {
    const state = get();
    if (state.isLoading) return;
    if (!reset && !state.hasMore) return;

    const page = reset ? 1 : state.page;
    set({isLoading: true});

    try {
      const items = await api.getNotifications(page, PAGINATION_LIMIT);
      const existing = reset ? [] : state.notifications;
      const existingIds = new Set(existing.map(n => n.id));
      const deduped = items.filter(n => !existingIds.has(n.id));
      set({
        notifications: reset ? items : [...existing, ...deduped],
        page: page + 1,
        hasMore: items.length === PAGINATION_LIMIT,
        isLoading: false,
      });
    } catch (e) {
      logError('fetchNotifications', e);
      set({isLoading: false});
    }
  },

  async fetchUnreadCount() {
    try {
      const count = await api.getUnreadNotificationCount();
      set({unreadCount: count});
    } catch (e) {
      logError('fetchUnreadCount', e);
    }
  },

  async markAsRead(id: string) {
    set(s => ({
      notifications: s.notifications.map(n =>
        n.id === id ? {...n, is_read: true} : n,
      ),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
    try {
      await api.markNotificationAsRead(id);
    } catch (e) {
      logError('markAsRead', e);
    }
  },

  async markAllAsRead() {
    set(s => ({
      notifications: s.notifications.map(n => ({...n, is_read: true})),
      unreadCount: 0,
    }));
    try {
      await api.markAllNotificationsAsRead();
    } catch (e) {
      logError('markAllAsRead', e);
    }
  },

  addNotification(notification: Notification) {
    set(s => {
      if (s.notifications.some(n => n.id === notification.id)) return s;
      return {
        notifications: [notification, ...s.notifications],
        unreadCount: s.unreadCount + 1,
      };
    });
  },
}));
