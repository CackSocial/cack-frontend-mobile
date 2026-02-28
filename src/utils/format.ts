import {formatDistanceToNow, format, isToday, isYesterday} from 'date-fns';

export function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return formatDistanceToNow(date, {addSuffix: true});
  } catch {
    return '';
  }
}

export function formatMessageTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
      return 'Yesterday';
    }
    return format(date, 'MMM d');
  } catch {
    return '';
  }
}

export function formatFullDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy · h:mm a');
  } catch {
    return '';
  }
}

export function formatCount(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(num);
}
