import React from 'react';
import { DollarSign, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { DealForecast } from '../../types/deal';

interface DealForecastWidgetProps {
  forecast: DealForecast | null;
  isLoading?: boolean;
}

export const DealForecastWidget: React.FC<DealForecastWidgetProps> = ({ forecast, isLoading }) => {
  const formatMoney = (val: number = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse"
          >
            <div className="h-4 bg-slate-100 rounded w-1/2 mb-3"></div>
            <div className="h-7 bg-slate-200 rounded w-3/4"></div>
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Pipeline Total Abierto */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pipeline Activo
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatMoney(openValue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-emerald-600">{openCount}</span> tratos en curso
          </div>
        </div>
      </div>

      {/* 2. Negocios Ganados este Mes */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Ganados (Este Mes)
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatMoney(wonMonthValue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="font-semibold text-blue-600">{wonCount}</span> tratos cerrados ganados
          </div>
        </div>
      </div>

      {/* 3. Forecast Ponderado */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Forecast Ponderado
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatMoney(weightedValue)}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            Proyección basada en probabilidad
          </div>
        </div>
      </div>

      {/* 4. Resumen de Estados */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4.5 shadow-sm hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Distribución Total
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
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
