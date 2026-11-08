import React from 'react';
import { CreditCard, DollarSign, Flame, TrendingUp } from 'lucide-react';
import { ProfitabilitySummary } from '../../types/analytics';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

interface ProfitabilityWidgetProps {
  summary: ProfitabilitySummary | null;
  isLoading?: boolean;
}

type Tone = 'emerald' | 'rose' | 'amber' | 'blue';

const toneStyles: Record<
  Tone,
  { border: string; icon: string; value: string; chip: string }
> = {
  emerald: {
    border: 'border-emerald-200/80',
    icon: 'bg-emerald-50 text-emerald-600',
    value: 'text-emerald-700',
    chip: 'bg-emerald-50 text-emerald-700',
  },
  rose: {
    border: 'border-rose-200/80',
    icon: 'bg-rose-50 text-rose-600',
    value: 'text-rose-700',
    chip: 'bg-rose-50 text-rose-700',
  },
  amber: {
    border: 'border-amber-200/80',
    icon: 'bg-amber-50 text-amber-600',
    value: 'text-amber-700',
    chip: 'bg-amber-50 text-amber-700',
  },
  blue: {
    border: 'border-sky-200/80',
    icon: 'bg-sky-50 text-sky-600',
    value: 'text-sky-700',
    chip: 'bg-sky-50 text-sky-700',
  },
};

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: Tone;
  footer: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tone,
  footer,
}) => {
  const styles = toneStyles[tone];

  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${styles.border}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {title}
            </span>
            <h3 className={`mt-1.5 text-2xl font-bold tracking-tight ${styles.value}`}>
              {value}
            </h3>
            {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <div className={`rounded-xl p-3 ${styles.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
        {footer}
      </div>
    </div>
  );
};

const KpiSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {[1, 2, 3, 4].map((item) => (
      <div
        key={item}
        className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
      >
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="mt-4 h-7 w-3/4 rounded bg-slate-200" />
        <div className="mt-8 h-3 w-full rounded bg-slate-100" />
      </div>
    ))}
  </div>
);

export const ProfitabilityWidget: React.FC<ProfitabilityWidgetProps> = ({
  summary,
  isLoading = false,
}) => {
  if (isLoading && !summary) {
    return <KpiSkeleton />;
  }

  const revenue = summary?.revenue.deals_won_total ?? 0;
  const wonDeals = summary?.revenue.deals_won_count ?? 0;
  const opex = summary?.opex.total ?? 0;
  const subscriptionsMonthly = summary?.opex.subscriptions_monthly ?? 0;
  const transactionExpenses = summary?.opex.transactions_expenses ?? 0;
  const activeSubscriptions = summary?.opex.active_subscriptions_count ?? 0;
  const netMargin = summary?.profitability.net_margin ?? 0;
  const marginPercentage = summary?.profitability.margin_percentage ?? 0;
  const burnRateMonthly = summary?.burn_rate.monthly ?? 0;
  const burnRateAnnual = summary?.burn_rate.annual ?? 0;
  const isProfitable = netMargin >= 0;
  const marginTone: Tone = isProfitable ? 'emerald' : 'rose';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Ingresos por Ventas"
        value={formatCurrency(revenue)}
        subtitle={`${wonDeals} tratos ganados en el periodo`}
        icon={TrendingUp}
        tone="emerald"
        footer={
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Basado en deals con estado ganado
          </span>
        }
      />

      <KpiCard
        title="Gastos Operativos (OPEX)"
        value={formatCurrency(opex)}
        subtitle="Suscripciones activas + egresos del periodo"
        icon={CreditCard}
        tone="rose"
        footer={
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>
              SaaS: <strong className="text-slate-700">{formatCurrency(subscriptionsMonthly)}</strong>
            </span>
            <span>
              Egresos:{' '}
              <strong className="text-slate-700">{formatCurrency(transactionExpenses)}</strong>
            </span>
          </div>
        }
      />

      <KpiCard
        title="Margen Neto Real"
        value={formatCurrency(netMargin)}
        subtitle={isProfitable ? 'Ingresos menos OPEX' : 'Pérdida operativa del periodo'}
        icon={DollarSign}
        tone={marginTone}
        footer={
          <div className="flex items-center justify-between gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${toneStyles[marginTone].chip}`}
            >
              {isProfitable ? 'Margen' : 'Pérdida'} {formatPercentage(marginPercentage)}
            </span>
            <span className="text-[11px] text-slate-400">
              {formatCurrency(revenue)} − {formatCurrency(opex)}
            </span>
          </div>
        }
      />

      <KpiCard
        title="Burn Rate Mensual"
        value={formatCurrency(burnRateMonthly)}
        subtitle={`${activeSubscriptions} suscripciones activas`}
        icon={Flame}
        tone="amber"
        footer={
          <div className="flex items-center justify-between gap-2">
            <span>
              Anualizado: <strong className="text-slate-700">{formatCurrency(burnRateAnnual)}</strong>
            </span>
            <span className="text-[11px] text-slate-400">Solo coste fijo SaaS</span>
          </div>
        }
      />
    </div>
  );
};

export default ProfitabilityWidget;
