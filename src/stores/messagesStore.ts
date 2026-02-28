import {create} from 'zustand';
import type {ConversationListItem, Message} from '../types';
import * as api from '../api';
import {WS_URL, PAGINATION_LIMIT} from '../config';

interface MessagesState {
  conversations: ConversationListItem[];
  messages: Record<string, Message[]>;
  ws: WebSocket | null;
  isLoading: boolean;
  connectWS(token: string): void;
  disconnectWS(): void;
  sendMessage(receiverId: string, content: string, imageUrl?: string): void;
  receiveMessage(msg: Message): void;
  fetchConversations(): Promise<void>;
  fetchMessages(username: string, page?: number): Promise<Message[]>;
  getUnreadTotal(): number;
}

let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let reconnectDelay = 1000;

export const useMessagesStore = create<MessagesState>((set, get) => ({
  conversations: [],
  messages: {},
  ws: null,
  isLoading: false,

  connectWS(token: string) {
    const state = get();
    if (state.ws) {
      state.ws.close();
    }

    const ws = new WebSocket(`${WS_URL}?token=${token}`);

    ws.onopen = () => {
      reconnectDelay = 1000;
    };

    ws.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'message') {
          get().receiveMessage(data as Message);
        }
      } catch {}
    };

    ws.onclose = () => {
      set({ws: null});
      // Reconnect with exponential backoff
      if (reconnectTimer) clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(() => {
        const current = get();
        if (!current.ws) {
          current.connectWS(token);
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
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectDelay = 1000;
    const {ws} = get();
    if (ws) {
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
    }
  },

  receiveMessage(msg: Message) {
    set(s => {
      const conv = s.conversations.find(
        c => c.user.id === msg.sender_id || c.user.id === msg.receiver_id,
      );
      const partnerKey = conv?.user.username;

      const newMessages = {...s.messages};
      if (partnerKey && newMessages[partnerKey]) {
        newMessages[partnerKey] = [...newMessages[partnerKey], msg];
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
    } catch {
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
    } catch {
      return [];
    }
  },

  getUnreadTotal() {
    return get().conversations.reduce((sum, c) => sum + c.unread_count, 0);
  },
}));
