/**
 * Logs errors in development builds only.
 * No-op in production for performance.
 */
export function logError(context: string, error: unknown): void {
  if (__DEV__) {
    console.warn(`[${context}]`, error);
  }
}

// REFACTORED: Type-safe error message extraction to replace `(e: any) => e.message`
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
}
