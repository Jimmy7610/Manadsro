// INSTÄLLNING - Locale för datumformatering
const DEFAULT_LOCALE = 'sv-SE';

export function formatDate(dateStr: string, locale: string = DEFAULT_LOCALE): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateFull(dateStr: string, locale: string = DEFAULT_LOCALE): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthName(monthStr: string, locale: string = DEFAULT_LOCALE): string {
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString(locale, { month: 'long' });
}

export function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return date >= startOfWeek && date <= endOfWeek;
}

export function daysUntil(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
