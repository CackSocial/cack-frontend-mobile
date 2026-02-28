// Environment-driven configuration
// Override via react-native-config or build-time env injection

export const BASE_URL =
  (globalThis as any).__DEV_API_BASE_URL__ ||
  'http://10.0.2.2:8080/api/v1'; // 10.0.2.2 = host loopback on Android emulator

export const WS_URL =
  (globalThis as any).__DEV_WS_URL__ ||
  'ws://10.0.2.2:8080/api/v1/ws';

export const UPLOADS_URL =
  (globalThis as any).__DEV_UPLOADS_URL__ ||
  'http://10.0.2.2:8080/uploads';

export const PAGINATION_LIMIT = 20;
export const MAX_POST_LENGTH = 5000;
export const MAX_COMMENT_LENGTH = 2000;
export const MAX_IMAGE_SIZE_MB = 10;
