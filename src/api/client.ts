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

// Client-generated CSRF token for the double-submit cookie pattern.
// The backend only checks that the Cookie value matches the header value;
// it does NOT verify against a server-stored token. So we generate our own
// and send it as both `Cookie: sc-csrf=TOKEN` and `X-CSRF-Token: TOKEN`.
// If the server sets a new CSRF cookie (e.g. on login), we adopt it so the
// native cookie store and our manual header stay in sync.
let csrfToken = generateCsrfToken();

function generateCsrfToken(): string {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * 16)];
  }
  return result;
}

export function setClientToken(token: string | null) {
  authToken = token;
}

client.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  // Double-submit CSRF: send matching cookie + header on state-changing requests
  if (config.method && config.method !== 'get') {
    config.headers['X-CSRF-Token'] = csrfToken;
    config.headers.Cookie = `sc-csrf=${csrfToken}`;
  }
  return config;
});

// Unwrap { success, data } envelope
client.interceptors.response.use(
  response => {
    // If the server set a new sc-csrf cookie, adopt it so the native cookie
    // store and our manual X-CSRF-Token header stay in sync.
    const setCookie = response.headers?.['set-cookie'];
    if (setCookie) {
      const raw = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
      const match = raw.match(/sc-csrf=([^;]+)/);
      if (match) {
        csrfToken = match[1];
      }
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
