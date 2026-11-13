import { parseDate } from './validators';

export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfWeek() {
  const date = startOfToday();
  const day = date.getDay() === 0 ? 7 : date.getDay();
  date.setDate(date.getDate() - (day - 1));
  return date;
}

export function startOfMonth() {
  const date = startOfToday();
  date.setDate(1);
  return date;
}

export function getPeriodRange(period, rangeFrom, rangeTo) {
  if (period === 'today') return { from: startOfToday(), to: null };
  if (period === 'week') return { from: startOfWeek(), to: null };
  if (period === 'month') return { from: startOfMonth(), to: null };

  const from = parseDate(rangeFrom);
  const to = parseDate(rangeTo);
  if (!from || !to) return null;

  to.setDate(to.getDate() + 1);
  return { from, to };
}

export function formatDateTime(value) {
  const date = new Date(value);
  return date.toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}
