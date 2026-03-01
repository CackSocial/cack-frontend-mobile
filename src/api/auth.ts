import client from './client';
import type {AuthResponse} from '../types';

export async function login(
  username: string,
  password: string,
): Promise<AuthResponse> {
  const {data} = await client.post<AuthResponse>('/auth/login', {
    username,
    password,
  });
  return data;
}

export async function register(
  username: string,
  password: string,
  displayName?: string,
): Promise<AuthResponse> {
  const {data} = await client.post<AuthResponse>('/auth/register', {
    username,
    password,
    display_name: displayName || username,
  });
  return data;
}

export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}
