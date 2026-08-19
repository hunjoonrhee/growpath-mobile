/** Formats a whole-seconds duration as `mm:ss` - shared by the timer screen and its Live Activity. */
export function formatElapsedSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** Formats a local Date as `YYYY-MM-DD`, matching the sessions.date column's format. */
export function toDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Whole days between a `YYYY-MM-DD` date and today, both in local time. */
export function daysAgo(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - target.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/** "오늘"/"어제"/"N일 전" (or the raw date for a future-dated entry) - shared by the log list and its detail screen. */
export function relativeDateLabel(dateString: string, t: (key: string, options?: Record<string, unknown>) => string): string {
  const days = daysAgo(dateString);
  if (days < 0) return dateString;
  if (days === 0) return t('log.relativeToday');
  if (days === 1) return t('log.relativeYesterday');
  return t('log.relativeDaysAgo', { count: days });
}

/** "8월 15일" / "Aug 15" / "15. Aug." depending on locale - a personal record's date is often too old for relativeDateLabel's "N일 전" to read naturally, and Intl already knows how to localize a month/day pair per-locale for free. */
export function formatShortDate(dateString: string, locale: string): string {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date);
}
