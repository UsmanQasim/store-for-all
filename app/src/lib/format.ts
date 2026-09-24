import type { DayKey, OpeningHours } from '@/types/models';
import { getLocale } from '@/i18n';

export function formatMoney(amount: number | null | undefined, currency = 'PKR'): string {
  const value = Number(amount ?? 0);
  try {
    return new Intl.NumberFormat(getLocale() === 'ur' ? 'ur-PK' : 'en-PK', {
      style: 'currency',
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString()}`;
  }
}

export function formatDistance(meters: number | null | undefined): string | null {
  if (meters == null) return null;
  if (meters < 1000) return `${Math.max(50, Math.round(meters / 10) * 10)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)} km`;
}

export function formatTime(iso: string, timeZone?: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', timeZone });
}

export function formatDate(iso: string, timeZone?: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone });
}

export function formatDateTime(iso: string, timeZone?: string): string {
  return `${formatDate(iso, timeZone)} · ${formatTime(iso, timeZone)}`;
}

export function timeAgo(iso: string): string {
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export const DAY_KEYS: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** YYYY-MM-DD for a Date in the given IANA timezone. */
export function isoDateInTz(d: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  return parts; // en-CA formats as YYYY-MM-DD
}

function dayKeyInTz(d: Date, timeZone: string): DayKey {
  const wd = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(d).toLowerCase().slice(0, 3);
  return wd as DayKey;
}

function hhmmInTz(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(d);
}

/** Open-now check that respects the shop's own timezone and past-midnight ranges. */
export function isOpenNow(hours: OpeningHours | null | undefined, timeZone: string, now = new Date()): boolean {
  if (!hours) return false;
  const today = dayKeyInTz(now, timeZone);
  const t = hhmmInTz(now, timeZone);
  const idx = DAY_KEYS.indexOf(today);
  const yesterday = DAY_KEYS[(idx + 6) % 7];
  const inToday = (hours[today] ?? []).some((r) => (r.close > r.open ? t >= r.open && t < r.close : t >= r.open));
  const spill = (hours[yesterday] ?? []).some((r) => r.close <= r.open && t < r.close);
  return inToday || spill;
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}
