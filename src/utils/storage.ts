import AsyncStorage from '@react-native-async-storage/async-storage';
import type {UserProfile} from '../types';

const TOKEN_KEY = 'sc-token';
const USER_KEY = 'sc-user';
const THEME_KEY = 'sc-theme';

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getUser(): Promise<UserProfile | null> {
  const json = await AsyncStorage.getItem(USER_KEY);
  if (!json) return null;
  try {
    return JSON.parse(json) as UserProfile;
  } catch {
    return null;
  }
}

export async function setUser(user: UserProfile): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function removeUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getTheme(): Promise<'light' | 'dark' | null> {
  const v = await AsyncStorage.getItem(THEME_KEY);
  return v === 'light' || v === 'dark' ? v : null;
}

export async function setTheme(theme: 'light' | 'dark'): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, theme);
}

const CSRF_KEY = 'sc-csrf';

export async function getCsrf(): Promise<string | null> {
  return AsyncStorage.getItem(CSRF_KEY);
}

export async function setCsrf(token: string): Promise<void> {
  await AsyncStorage.setItem(CSRF_KEY, token);
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, CSRF_KEY]);
}
