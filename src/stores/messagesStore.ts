import {create} from 'zustand';
import type {ConversationListItem, Message} from '../types';
import * as api from '../api';
import {WS_URL, PAGINATION_LIMIT} from '../config';
import {getClientToken} from '../api/client';
import {useNotificationsStore} from './notificationsStore';
import {logError} from '../utils/log';

interface MessagesState {
  conversations: ConversationListItem[];
  messages: Record<string, Message[]>;
  ws: WebSocket | null;
  isLoading: boolean;
  connectWS(token: string): void;
  disconnectWS(): void;
  sendMessage(receiverId: string, content: string, imageUrl?: string): boolean;
  receiveMessage(msg: Message): void;
  fetchConversations(): Promise<void>;
  fetchMessages(username: string, page?: number): Promise<Message[]>;
  getUnreadTotal(): number;
}

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;
let reconnectAttempts = 0;
let shouldReconnect = true;
const MAX_RECONNECT_ATTEMPTS = 5;

export const useMessagesStore = create<MessagesState>((set, get) => ({
  conversations: [],
  messages: {},
  ws: null,
  isLoading: false,

  connectWS(token: string) {
    shouldReconnect = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    const state = get();
    if (state.ws) {
      state.ws.onclose = null;
      state.ws.close();
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      reconnectDelay = 1000;
      reconnectAttempts = 0;
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          // Normalize: WS echo omits read_at; ensure it is null
          const msg: Message = {...data, read_at: data.read_at ?? null};
          get().receiveMessage(msg);
        } else if (data.type === 'notification') {
          // WS wraps notification inside a `data` field
          useNotificationsStore.getState().addNotification(data.data);
        }
      } catch (e) {
        logError('ws:onmessage', e);
      }
    };

    ws.onclose = () => {
      set({ws: null});
      if (!shouldReconnect || reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        reconnectTimer = null;
        return;
      }

      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectAttempts += 1;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (!shouldReconnect) {
          return;
        }

        const current = get();
        if (!current.ws) {
          const freshToken = getClientToken();
          if (freshToken) {
            current.connectWS(freshToken);
          }
        }
      }, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, 30000);
    };

    ws.onerror = () => {
      ws.close();
    };

    set({ws});
  },

  disconnectWS() {
    shouldReconnect = false;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectDelay = 1000;
    reconnectAttempts = 0;
    const {ws} = get();
    if (ws) {
      ws.onclose = null;
      ws.close();
      set({ws: null});
    }
  },

  sendMessage(receiverId: string, content: string, imageUrl?: string) {
    const {ws} = get();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'message',
          receiver_id: receiverId,
          content,
          image_url: imageUrl || '',
        }),
      );
      return true;
    }

    return false;
  },

  receiveMessage(msg: Message) {
    set(s => {
      const conv = s.conversations.find(
        c => c.user.id === msg.sender_id || c.user.id === msg.receiver_id,
      );
      const partnerKey = conv?.user.username;

      const newMessages = {...s.messages};
      if (partnerKey) {
        const existing = newMessages[partnerKey] || [];
        if (!existing.some(m => m.id === msg.id)) {
          newMessages[partnerKey] = [...existing, msg];
        }
      }

      // Update conversation list
      const newConversations = s.conversations.map(c => {
        if (c.user.id === msg.sender_id || c.user.id === msg.receiver_id) {
          return {
            ...c,
            last_message: msg,
            // c.user is the conversation partner; increment if they sent it
            unread_count:
              msg.sender_id === c.user.id
                ? c.unread_count + 1
                : c.unread_count,
          };
        }
        return c;
      });

      return {messages: newMessages, conversations: newConversations};
    });
  },

  async fetchConversations() {
    set({isLoading: true});
    try {
      const res = await api.getConversations(1, PAGINATION_LIMIT);
      set({conversations: res.data ?? [], isLoading: false});
    } catch (e) {
      logError('fetchConversations', e);
      set({isLoading: false});
    }
  },

  async fetchMessages(username: string, page = 1) {
    try {
      const res = await api.getMessages(username, page, PAGINATION_LIMIT);
      const msgs = res.data ?? [];
      set(s => ({
        messages: {
          ...s.messages,
          [username]:
            page === 1
              ? msgs
              : [...msgs, ...(s.messages[username] || [])],
        },
      }));
      return msgs;
    } catch (e) {
      logError('fetchMessages', e);
      return [];
    }
  },

  getUnreadTotal() {
    return get().conversations.reduce((sum, c) => sum + c.unread_count, 0);
  },
}));
