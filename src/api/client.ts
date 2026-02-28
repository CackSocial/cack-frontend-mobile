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

export function setClientToken(token: string | null) {
  authToken = token;
}

client.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Unwrap { success, data } envelope; reject on failure
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
