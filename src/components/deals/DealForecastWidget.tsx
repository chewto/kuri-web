import React from 'react';
import { DollarSign, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { DealForecast } from '../../types/deal';
import { formatCurrency } from '../../utils/formatters';

interface DealForecastWidgetProps {
  forecast: DealForecast | null;
  isLoading?: boolean;
}

const formatPeriod = (forecast: DealForecast | null): string => {
  if (!forecast?.period) return 'Current period';

  const date = new Date(forecast.period.year, forecast.period.month - 1, 1);
  if (Number.isNaN(date.getTime())) return 'Current period';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const DealForecastWidget: React.FC<DealForecastWidgetProps> = ({ forecast, isLoading }) => {
  if (isLoading) {
    return (
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-slate-200/80 bg-white p-5"
          >
            <div className="mb-3 h-4 w-1/2 rounded bg-slate-100"></div>
            <div className="h-7 w-3/4 rounded bg-slate-200"></div>
          </div>
        ))}
      </div>
    );
  }

  const openValue = forecast?.total_open_value ?? 0;
  const wonMonthValue = forecast?.total_won_month ?? 0;
  const weightedValue = forecast?.weighted_pipeline_value ?? 0;
  const openCount = forecast?.counts.open ?? 0;
  const wonCount = forecast?.counts.won ?? 0;
  const lostCount = forecast?.counts.lost ?? 0;
  const periodLabel = formatPeriod(forecast);

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Open Pipeline */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Pipeline
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(openValue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">{openCount}</span> deals in progress
          </div>
        </div>
      </div>

      {/* 2. Deals Won This Month */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Won This Month
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(wonMonthValue)}
          </div>
          <div
            className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"
            title="Historical count of won deals for this workspace"
          >
            <span className="font-semibold text-blue-600">{wonCount}</span> won overall
            <span className="text-slate-400">· {periodLabel}</span>
          </div>
        </div>
      </div>

      {/* 3. Weighted Forecast */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Weighted Forecast
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold tracking-tight text-slate-900">
            {formatCurrency(weightedValue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            Projection based on stage probability
          </div>
        </div>
      </div>

      {/* 4. Status Summary */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Distribution
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <div>
            <span className="block text-lg font-bold text-emerald-600">{openCount}</span>
            <span className="text-[11px] text-slate-400">Open</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="block text-lg font-bold text-blue-600">{wonCount}</span>
            <span className="text-[11px] text-slate-400">Won</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="block text-lg font-bold text-rose-500">{lostCount}</span>
            <span className="text-[11px] text-slate-400">Lost</span>
          </div>
        </div>
      </div>
    </div>
  );
};
