import axios from 'axios';
import {NativeModules} from 'react-native';
import {BASE_URL} from '../config';
import {triggerSessionLogout} from '../authSession';
import type {ImageAsset} from '../types';

// Clear the OkHttp cookie jar so it doesn't overwrite our manual CSRF Cookie header.
function clearNativeCookies(): Promise<boolean> {
  return new Promise(resolve => {
    if (NativeModules.Networking?.clearCookies) {
      NativeModules.Networking.clearCookies(resolve);
    } else {
      resolve(false);
    }
  });
}

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
const csrfToken = generateCsrfToken();

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

export function getClientToken(): string | null {
  return authToken;
}

// Clear stale cookies from any previous session on module load
clearNativeCookies();

// On state-changing requests, clear the native cookie jar BEFORE the request
// is sent. OkHttp's BridgeInterceptor loads cookies from the jar and REPLACES
// any manual Cookie header. By clearing the jar first, our manual
// Cookie: sc-csrf=TOKEN survives and matches X-CSRF-Token.
client.interceptors.request.use(async config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  if (config.method && config.method !== 'get') {
    await clearNativeCookies();
    config.headers['X-CSRF-Token'] = csrfToken;
    config.headers.Cookie = `sc-csrf=${csrfToken}`;
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
        triggerSessionLogout();
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
