import axios from 'axios';
import CookieManager from '@react-native-cookies/cookies';
import {BASE_URL} from '../config';
import type {ImageAsset} from '../types';

// Base URL without the /api/v1 path, used for cookie domain lookups
const COOKIE_URL = BASE_URL.replace(/\/api\/v\d+$/, '');

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {'Content-Type': 'application/json'},
  withCredentials: true,
});

// Token will be set by auth store after login/hydration
let authToken: string | null = null;
let csrfToken: string | null = null;

export function setClientToken(token: string | null) {
  authToken = token;
}

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}

export function getCsrfToken(): string | null {
  return csrfToken;
}

/** Read sc-csrf cookie from native cookie jar and cache it in memory */
export async function refreshCsrfToken(): Promise<string | null> {
  try {
    const cookies = await CookieManager.get(COOKIE_URL);
    const csrf = cookies['sc-csrf']?.value ?? null;
    if (csrf) csrfToken = csrf;
    return csrf;
  } catch {
    return null;
  }
}

client.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  // Attach CSRF token on state-changing requests
  if (csrfToken && config.method && config.method !== 'get') {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Unwrap { success, data } envelope
client.interceptors.response.use(
  response => {
    const body = response.data;
    if (body && typeof body === 'object' && 'success' in body) {
      if (!body.success) {
        return Promise.reject(new Error(body.message || 'Request failed'));
      }
      // Paginated responses carry page/limit/total alongside data
      if ('page' in body) {
        return {
          ...response,
          data: {data: body.data, page: body.page, limit: body.limit, total: body.total},
        };
      }
      return {...response, data: body.data};
    }
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      // Auto-logout on expired/invalid token (skip auth endpoints)
      const url = error.config?.url || '';
      if (!url.startsWith('/auth/')) {
        // Lazy import to avoid circular dependency
        const {useAuthStore} = require('../stores/authStore');
        const {isAuthenticated, logout} = useAuthStore.getState();
        if (isAuthenticated) {
          logout();
        }
      }
    }
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Network error';
    return Promise.reject(new Error(msg));
  },
);

export function buildFormData(
  fields: Record<string, string>,
  image?: ImageAsset,
): FormData {
  const form = new FormData();
  Object.entries(fields).forEach(([k, v]) => form.append(k, v));
  if (image) {
    form.append('image', {
      uri: image.uri,
      name: image.fileName ?? 'upload.jpg',
      type: image.type ?? 'image/jpeg',
    } as unknown as Blob);
  }
  return form;
}

export default client;
