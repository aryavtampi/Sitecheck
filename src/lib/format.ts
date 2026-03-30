import { formatDistanceToNow, format, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'h:mm a');
}

export function formatCountdown(deadline: string | Date): { hours: number; minutes: number; seconds: number; expired: boolean } {
  const now = new Date();
  const target = new Date(deadline);

  if (now >= target) {
    return { hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor((target.getTime() - now.getTime()) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, expired: false };
}

export function formatCoordinate(value: number, type: 'lat' | 'lng'): string {
  const direction = type === 'lat' ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
  return `${Math.abs(value).toFixed(6)}° ${direction}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
