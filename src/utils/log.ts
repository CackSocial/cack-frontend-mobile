/**
 * Logs errors in development builds only.
 * No-op in production for performance.
 */
export function logError(context: string, error: unknown): void {
  if (__DEV__) {
    console.warn(`[${context}]`, error);
  }
}
