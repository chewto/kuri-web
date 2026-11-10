import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, Calendar, RefreshCw } from 'lucide-react';
import {
  PipelineDistribution,
  ProfitabilitySummary,
} from '../types/analytics';
import { getProfitabilitySummary } from '../services/analyticsService';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import { Button } from '../components/common/Button';
import { ProfitabilityWidget } from '../components/analytics/ProfitabilityWidget';
import { ExpenseBreakdownChart } from '../components/analytics/ExpenseBreakdownChart';

const getInitialPeriod = (): string => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${today.getFullYear()}-${month}`;
};

const parsePeriod = (value: string): { year: number; month: number } | null => {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (year < 2000 || year > 2100 || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
};

const formatPeriodLabel = (summary: ProfitabilitySummary | null): string => {
  if (!summary) return 'Current period';

  const date = new Date(summary.period.year, summary.period.month - 1, 1);
  if (Number.isNaN(date.getTime())) return 'Current period';

  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
};

interface PipelineStatusPanelProps {
  pipeline: PipelineDistribution | null;
  isLoading: boolean;
}

const PipelineStatusPanel: React.FC<PipelineStatusPanelProps> = ({
  pipeline,
  isLoading,
}) => {
  if (isLoading && !pipeline) {
    return (
      <div className="h-[360px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="mt-6 space-y-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-3 w-1/3 rounded bg-slate-100" />
              <div className="h-2 w-full rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statuses = [
    {
      key: 'open',
      label: 'Open',
      data: pipeline?.open,
      bar: 'bg-sky-500',
      text: 'text-sky-700',
    },
    {
      key: 'won',
      label: 'Won',
      data: pipeline?.won,
      bar: 'bg-emerald-500',
      text: 'text-emerald-700',
    },
    {
      key: 'lost',
      label: 'Lost',
      data: pipeline?.lost,
      bar: 'bg-rose-500',
      text: 'text-rose-700',
    },
  ];

  const totalCount = pipeline?.total.count ?? 0;
  const totalValue = pipeline?.total.total_value ?? 0;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Pipeline Status</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Opportunity distribution across the workspace
          </p>
        </div>
        <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
          <BarChart3 className="h-5 w-5" />
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700">No opportunities recorded</p>
          <p className="mt-1 max-w-xs text-xs text-slate-500">
            Create deals in the sales module to view the funnel distribution.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 flex-1 space-y-5">
            {statuses.map((status) => {
              const percentage = status.data?.percentage ?? 0;
              return (
                <div key={status.key}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700">
                      {status.label}
                    </span>
                    <span className={`text-xs font-semibold ${status.text}`}>
                      {status.data?.count ?? 0} · {formatCurrency(status.data?.total_value ?? 0)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${status.bar}`}
                      style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    />
                  </div>
                  <div className="mt-1 flex justify-end">
                    <span className="text-[10px] text-slate-400">
                      {formatPercentage(percentage)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs">
            <span className="text-slate-500">
              Total: <strong className="text-slate-800">{totalCount}</strong> opportunities
            </span>
            <span className="font-semibold text-slate-800">
              {formatCurrency(totalValue)}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<string>(getInitialPeriod);
  const [summary, setSummary] = useState<ProfitabilitySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    const parsedPeriod = parsePeriod(period);
    if (!parsedPeriod) return;

    setIsLoading(true);
    setErrorNotification(null);

    try {
      const data = await getProfitabilitySummary({
        year: parsedPeriod.year,
        month: parsedPeriod.month,
      });
      setSummary(data);
    } catch {
      setErrorNotification(
        "Couldn't load profitability analytics. Check the server connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Analytics & Profitability
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Sales revenue, consolidated OPEX, actual net margin, and sales pipeline health.
          </p>
          <p className="mt-1 text-[11px] font-medium capitalize text-slate-400">
            {formatPeriodLabel(summary)} · {summary?.period.start_date || '—'} to{' '}
            {summary?.period.end_date || '—'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-slate-400" />
            <label htmlFor="analytics-period" className="text-xs font-medium text-slate-600">
              Period
            </label>
            <input
              id="analytics-period"
              type="month"
              value={period}
              min="2000-01"
              max="2100-12"
              onChange={(event) => setPeriod(event.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchSummary()}
            disabled={isLoading}
            title="Refresh analytics"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {errorNotification && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <span>{errorNotification}</span>
          <button
            type="button"
            onClick={() => setErrorNotification(null)}
            className="ml-4 font-bold text-rose-500 hover:text-rose-700"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      <ProfitabilityWidget summary={summary} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ExpenseBreakdownChart
            categories={summary?.expense_categories ?? []}
            totalOpex={summary?.opex.total ?? 0}
            isLoading={isLoading}
          />
        </div>
        <PipelineStatusPanel pipeline={summary?.pipeline_status ?? null} isLoading={isLoading} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-[11px] text-slate-400 shadow-sm">
        Calculations based on won deals, active subscriptions, and transactions in the
        period for your organization.
      </div>
    </div>
  );
};

export default AnalyticsPage;
