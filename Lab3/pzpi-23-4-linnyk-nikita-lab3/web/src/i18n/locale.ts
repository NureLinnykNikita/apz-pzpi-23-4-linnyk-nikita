/**
 * Locale & timezone utilities — all formatting goes through here so that
 * switching language or timezone in Settings immediately affects every view.
 *
 * Timezone resolution order:
 *   1. localStorage `lb_timezone`  (user's explicit preference)
 *   2. Intl.DateTimeFormat().resolvedOptions().timeZone  (browser's OS timezone)
 */

/** Map our 2-char language code to a BCP-47 locale tag */
export function getLangLocale(lang: string): string {
  const map: Record<string, string> = { uk: 'uk-UA', en: 'en-US' };
  return map[lang] ?? 'en-US';
}

/** Read stored timezone or fall back to the browser's detected timezone */
export function getUserTimezone(): string {
  return (
    localStorage.getItem('lb_timezone') ||
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
}

/** Persist timezone choice to localStorage (called from Settings) */
export function setTimezone(tz: string): void {
  localStorage.setItem('lb_timezone', tz);
}

/**
 * Format an absolute date.
 * Default: "15 Dec 2024" (en) / "15 груд. 2024 р." (uk)
 */
export function formatDate(
  date: string | Date,
  lang: string,
  options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
): string {
  return new Intl.DateTimeFormat(getLangLocale(lang), {
    timeZone: getUserTimezone(),
    ...options,
  }).format(new Date(date));
}

/**
 * Format a date with full month name.
 * "15 December 2024" (en) / "15 грудня 2024 р." (uk)
 */
export function formatDateLong(date: string | Date, lang: string): string {
  return formatDate(date, lang, { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Format date + time.
 * "15 Dec 2024, 14:30" (en) / "15 груд. 2024 р., 14:30" (uk)
 */
export function formatDateTime(date: string | Date, lang: string): string {
  return formatDate(date, lang, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format today's date as weekday + day + month (for the Home page header).
 * "Monday, 15 December" (en) / "понеділок, 15 грудня" (uk)
 */
export function formatTodayLong(lang: string): string {
  return new Intl.DateTimeFormat(getLangLocale(lang), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: getUserTimezone(),
  }).format(new Date());
}

/**
 * Get the current hour (0–23) in the user's timezone.
 * Used for the greeting logic ("Good morning / evening / …").
 */
export function getCurrentHour(): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone: getUserTimezone(),
  }).formatToParts(new Date());
  const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '12', 10);
  // Intl may return 24 for midnight in hour12:false mode → normalise
  return h === 24 ? 0 : h;
}

/**
 * Format a number with locale-aware digit grouping.
 * 1234567 → "1 234 567" (uk-UA) / "1,234,567" (en-US)
 */
export function formatNumber(n: number, lang: string): string {
  return new Intl.NumberFormat(getLangLocale(lang)).format(n);
}

/**
 * Compact number format for large values.
 * 12345 → "12K" (en) / "12 тис." (uk)
 */
export function formatCompact(n: number, lang: string): string {
  return new Intl.NumberFormat(getLangLocale(lang), { notation: 'compact' }).format(n);
}

/**
 * Curated list of common IANA timezones for the Settings dropdown.
 * Extend freely — the rest of the system needs no changes.
 */
export const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: 'Pacific/Honolulu', label: 'UTC−10  Honolulu' },
  { value: 'America/Anchorage', label: 'UTC−9   Anchorage' },
  { value: 'America/Los_Angeles', label: 'UTC−8/−7  Los Angeles' },
  { value: 'America/Denver', label: 'UTC−7/−6  Denver' },
  { value: 'America/Chicago', label: 'UTC−6/−5  Chicago' },
  { value: 'America/New_York', label: 'UTC−5/−4  New York' },
  { value: 'America/Sao_Paulo', label: 'UTC−3    São Paulo' },
  { value: 'Atlantic/Azores', label: 'UTC−1    Azores' },
  { value: 'UTC', label: 'UTC+0    UTC' },
  { value: 'Europe/London', label: 'UTC+0/+1  London' },
  { value: 'Europe/Paris', label: 'UTC+1/+2  Paris · Berlin · Warsaw' },
  { value: 'Europe/Kyiv', label: 'UTC+2/+3  Kyiv · Bucharest' },
  { value: 'Europe/Istanbul', label: 'UTC+3    Istanbul' },
  { value: 'Asia/Dubai', label: 'UTC+4    Dubai' },
  { value: 'Asia/Karachi', label: 'UTC+5    Karachi' },
  { value: 'Asia/Kolkata', label: 'UTC+5:30  Kolkata' },
  { value: 'Asia/Dhaka', label: 'UTC+6    Dhaka' },
  { value: 'Asia/Bangkok', label: 'UTC+7    Bangkok' },
  { value: 'Asia/Shanghai', label: 'UTC+8    Beijing · Singapore' },
  { value: 'Asia/Tokyo', label: 'UTC+9    Tokyo' },
  { value: 'Australia/Sydney', label: 'UTC+10/+11  Sydney' },
  { value: 'Pacific/Auckland', label: 'UTC+12/+13  Auckland' },
];
