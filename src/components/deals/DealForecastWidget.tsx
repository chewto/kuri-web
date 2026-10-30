import React from 'react';
import { DollarSign, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { DealForecast } from '../../types/deal';
import { formatCurrency } from '../../utils/formatters';

interface DealForecastWidgetProps {
  forecast: DealForecast | null;
  isLoading?: boolean;
}

const formatPeriod = (forecast: DealForecast | null): string => {
  if (!forecast?.period) return 'Periodo actual';

  const date = new Date(forecast.period.year, forecast.period.month - 1, 1);
  if (Number.isNaN(date.getTime())) return 'Periodo actual';

  return new Intl.DateTimeFormat('es-VE', {
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
      {/* 1. Pipeline Total Abierto */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Pipeline Total
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
            <span className="font-semibold text-emerald-600">{openCount}</span> tratos en curso
          </div>
        </div>
      </div>

      {/* 2. Negocios Ganados este Mes */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ganados Este Mes
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
            title="Conteo histórico de tratos ganados del tenant"
          >
            <span className="font-semibold text-blue-600">{wonCount}</span> ganados en total
            <span className="text-slate-400">· {periodLabel}</span>
          </div>
        </div>
      </div>

      {/* 3. Forecast Ponderado */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Forecast Ponderado
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
            Proyección según probabilidad de etapa
          </div>
        </div>
      </div>

      {/* 4. Resumen de Estados */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-colors hover:border-slate-300">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Distribución Total
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <BarChart3 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <div>
            <span className="block text-lg font-bold text-emerald-600">{openCount}</span>
            <span className="text-[11px] text-slate-400">Abiertos</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="block text-lg font-bold text-blue-600">{wonCount}</span>
            <span className="text-[11px] text-slate-400">Ganados</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <span className="block text-lg font-bold text-rose-500">{lostCount}</span>
            <span className="text-[11px] text-slate-400">Perdidos</span>
          </div>
        </div>
      </div>
    </div>
  );
};
