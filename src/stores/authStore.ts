import {create} from 'zustand';
import type {UserProfile} from '../types';
import * as api from '../api';
import {setClientToken} from '../api/client';
import {setLogoutHandler} from '../authSession';
import {useMessagesStore} from './messagesStore';
import * as storage from '../utils/storage';
import {logError, getErrorMessage} from '../utils/log';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login(username: string, password: string): Promise<void>;
  register(
    username: string,
    password: string,
    displayName?: string,
  ): Promise<void>;
  logout(): void;
  updateUser(updates: Partial<UserProfile>): void;
  hydrate(): Promise<void>;
  clearError(): void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  async login(username: string, password: string) {
    set({isLoading: true, error: null});
    try {
      const res = await api.login(username, password);
      setClientToken(res.token);
      await Promise.all([
        storage.setToken(res.token),
        storage.setUser(res.user),
      ]);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e: unknown) {
      set({isLoading: false, error: getErrorMessage(e)});
      throw e;
    }
  },

  async register(username: string, password: string, displayName?: string) {
    set({isLoading: true, error: null});
    try {
      const res = await api.register(username, password, displayName);
      setClientToken(res.token);
      await Promise.all([
        storage.setToken(res.token),
        storage.setUser(res.user),
      ]);
      set({
        user: res.user,
        token: res.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e: unknown) {
      set({isLoading: false, error: getErrorMessage(e)});
      throw e;
    }
  },

  logout() {
    // Fire-and-forget: notify server, then clear local state
    api.logout().catch(error => {
      logError('logout', error);
    });
    // Disconnect WebSocket
    useMessagesStore.getState().disconnectWS();

    setClientToken(null);
    storage.clearAll();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  updateUser(updates: Partial<UserProfile>) {
    const current = get().user;
    if (current) {
      const updated = {...current, ...updates};
      set({user: updated});
      storage.setUser(updated);
    }
  },

  async hydrate() {
    try {
      const [token, user] = await Promise.all([
        storage.getToken(),
        storage.getUser(),
      ]);
      if (token && user) {
        setClientToken(token);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({isLoading: false});
      }
    } catch (e) {
      logError('hydrate', e);
      set({isLoading: false});
    }
  },

  clearError() {
    set({error: null});
  },
}));

setLogoutHandler(() => {
  const {isAuthenticated, logout} = useAuthStore.getState();
  if (isAuthenticated) {
    logout();
  }
});
