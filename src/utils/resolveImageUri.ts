import {UPLOADS_URL} from '../config';

// REFACTORED: Extracted from PostCard, Avatar, MessageBubble, QuotePostScreen
// to eliminate 4 duplicate implementations of image URL resolution.
export function resolveImageUri(url: string | undefined): string | null {
  if (!url) return null;
  return url.startsWith('http') ? url : `${UPLOADS_URL}/${url}`;
}
