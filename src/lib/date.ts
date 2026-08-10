/** Whole days between a `YYYY-MM-DD` date and today, both in local time. */
export function daysAgo(dateString: string): number {
  const [year, month, day] = dateString.split('-').map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = today.getTime() - target.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
