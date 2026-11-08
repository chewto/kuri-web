import React from 'react';
import { PieChart } from 'lucide-react';
import { ExpensesByCategory } from '../../types/analytics';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface ExpenseBreakdownChartProps {
  categories: ExpensesByCategory[];
  totalOpex: number;
  isLoading?: boolean;
}

const FALLBACK_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'];

const CHART_RADIUS = 42;
const CHART_CIRCUMFERENCE = 2 * Math.PI * CHART_RADIUS;

export const ExpenseBreakdownChart: React.FC<ExpenseBreakdownChartProps> = ({
  categories,
  totalOpex,
  isLoading = false,
}) => {
  if (isLoading && categories.length === 0) {
    return (
      <div className="h-[360px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
        <div className="h-4 w-1/3 rounded bg-slate-100" />
        <div className="mx-auto mt-10 h-40 w-40 rounded-full bg-slate-100" />
        <div className="mt-10 h-3 w-2/3 rounded bg-slate-100" />
      </div>
    );
  }

  const categoryTotal = categories.reduce(
    (sum, category) => sum + Math.max(0, category.amount),
    0
  );
  const chartTotal = categoryTotal > 0 ? categoryTotal : totalOpex;
  const hasData = categories.length > 0 && chartTotal > 0;

  let accumulatedArc = 0;
  const segments = categories.map((category, index) => {
    const amount = Math.max(0, category.amount);
    const fraction = chartTotal > 0 ? amount / chartTotal : 0;
    const arc = fraction * CHART_CIRCUMFERENCE;
    const segment = {
      key: category.category_id || `${category.category_name}-${index}`,
      name: category.category_name,
      color: category.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length],
      amount,
      percentage: chartTotal > 0 ? (amount / chartTotal) * 100 : 0,
      arc,
      offset: accumulatedArc,
    };
    accumulatedArc += arc;
    return segment;
  });

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Distribución de Gastos</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            OPEX por categoría en el periodo seleccionado
          </p>
        </div>
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
          <PieChart className="h-5 w-5" />
        </div>
      </div>

      {!hasData ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <PieChart className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">Sin gastos registrados</p>
          <p className="mt-1 max-w-xs text-xs text-slate-500">
            Registra suscripciones o egresos con categoría para visualizar su distribución.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid flex-1 grid-cols-1 items-center gap-6 sm:grid-cols-2">
          <div className="relative mx-auto h-48 w-48">
            <svg
              viewBox="0 0 120 120"
              className="h-full w-full -rotate-90"
              role="img"
              aria-label={`Distribución de gastos por categoría. Total: ${formatCurrency(
                chartTotal
              )}`}
            >
              <circle
                cx="60"
                cy="60"
                r={CHART_RADIUS}
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="14"
              />
              {segments.map((segment) => (
                <circle
                  key={segment.key}
                  cx="60"
                  cy="60"
                  r={CHART_RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="14"
                  strokeDasharray={`${segment.arc} ${CHART_CIRCUMFERENCE - segment.arc}`}
                  strokeDashoffset={-segment.offset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                OPEX total
              </span>
              <span className="mt-0.5 text-lg font-bold text-slate-900">
                {formatCurrency(totalOpex > 0 ? totalOpex : chartTotal)}
              </span>
              <span className="text-[10px] text-slate-400">
                {categories.length} categorías
              </span>
            </div>
          </div>

          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {segments.map((segment) => (
              <li
                key={segment.key}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="truncate text-xs font-medium text-slate-700">
                    {segment.name}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-slate-800">
                    {formatCurrency(segment.amount)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatPercentage(segment.percentage)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExpenseBreakdownChart;
