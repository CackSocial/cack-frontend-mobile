import axios from 'axios';
import {BASE_URL} from '../config';
import type {ImageAsset} from '../types';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {'Content-Type': 'application/json'},
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

// Extract sc-csrf cookie from Set-Cookie response headers
function extractCsrfFromHeaders(headers: any): string | null {
  const setCookie = headers?.['set-cookie'];
  if (!setCookie) return null;
  const cookies: string[] = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const cookie of cookies) {
    const match = cookie.match(/sc-csrf=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

// Unwrap { success, data } envelope; capture CSRF token from auth responses
client.interceptors.response.use(
  response => {
    // Capture CSRF token from Set-Cookie header (login/register)
    const csrf = extractCsrfFromHeaders(response.headers);
    if (csrf) {
      csrfToken = csrf;
    }

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
