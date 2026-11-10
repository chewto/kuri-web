const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Formats a monetary value in USD. Decimals are shown only when the amount
 * actually has cents, so pipeline totals are not rounded unnecessarily.
 */
export const formatCurrency = (value?: number | null): string => {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  const hasCents = Math.abs(amount % 1) > 0.000001;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(amount);
};

/**
 * Formats a numeric percentage (12.5 -> "12.5%").
 */
export const formatPercentage = (value?: number | null, fractionDigits = 2): string => {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;

  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(amount)}%`;
};

/**
 * Converts an ISO date (YYYY-MM-DD) into a readable local date.
 * Components are built in local time to avoid the timezone offset produced
 * by `new Date('YYYY-MM-DD')`.
 */
export const formatDate = (isoDate?: string | null): string => {
  if (!isoDate) return '';

  const match = DATE_ONLY_REGEX.exec(isoDate);
  if (!match) return isoDate;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

/**
 * Returns whether an ISO close date is already in the past relative to the
 * start of the current day.
 */
export const isDatePast = (isoDate?: string | null): boolean => {
  if (!isoDate) return false;

  const match = DATE_ONLY_REGEX.exec(isoDate);
  if (!match) return false;

  const [, year, month, day] = match;
  const target = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return target.getTime() < today.getTime();
};
