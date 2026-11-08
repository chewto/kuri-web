const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})/;

/**
 * Formatea un valor monetario en USD. Muestra decimales solo cuando el monto
 * realmente los tiene, para evitar redondear centavos en el pipeline.
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
 * Formatea un porcentaje numérico (12.5 -> "12.5%").
 */
export const formatPercentage = (value?: number | null, fractionDigits = 2): string => {
  const amount = typeof value === 'number' && Number.isFinite(value) ? value : 0;

  return `${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(amount)}%`;
};

/**
 * Convierte una fecha ISO (YYYY-MM-DD) en una fecha local legible.
 * Se construye con componentes locales para evitar el desfase de zona horaria
 * que produce `new Date('YYYY-MM-DD')`.
 */
export const formatDate = (isoDate?: string | null): string => {
  if (!isoDate) return '';

  const match = DATE_ONLY_REGEX.exec(isoDate);
  if (!match) return isoDate;

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  if (Number.isNaN(date.getTime())) return isoDate;

  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

/**
 * Indica si una fecha ISO de cierre ya pasó respecto al inicio del día actual.
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
