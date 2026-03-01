import {UPLOADS_URL} from '../config';

// REFACTORED: Extracted from PostCard, Avatar, MessageBubble, QuotePostScreen
// to eliminate 4 duplicate implementations of image URL resolution.
//
// The backend returns absolute URLs using its own host (e.g. http://localhost:8080/uploads/…).
// On Android emulator, localhost refers to the emulator itself, not the host machine.
// We rewrite the URL so the /uploads/… path is served from the configured UPLOADS_URL
// (which points to 10.0.2.2 on the emulator).
export function resolveImageUri(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) {
    const uploadsIdx = url.indexOf('/uploads/');
    if (uploadsIdx !== -1) {
      return `${UPLOADS_URL}${url.substring(uploadsIdx + '/uploads'.length)}`;
    }
    return url;
  }
  return `${UPLOADS_URL}/${url}`;
}
