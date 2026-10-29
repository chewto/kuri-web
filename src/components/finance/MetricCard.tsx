import React from 'react';

export interface MetricCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'emerald' | 'rose' | 'blue' | 'slate' | 'amber';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  amount,
  subtitle,
  icon: Icon,
  variant = 'slate',
  trend,
}) => {
  const variantStyles = {
    emerald: {
      border: 'border-emerald-200/80',
      bgIcon: 'bg-emerald-50 text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    rose: {
      border: 'border-rose-200/80',
      bgIcon: 'bg-rose-50 text-rose-600',
      valueColor: 'text-rose-700',
    },
    blue: {
      border: 'border-blue-200/80',
      bgIcon: 'bg-blue-50 text-blue-600',
      valueColor: 'text-blue-700',
    },
    slate: {
      border: 'border-slate-200',
      bgIcon: 'bg-slate-100 text-slate-700',
      valueColor: 'text-slate-900',
    },
    amber: {
      border: 'border-amber-200/80',
      bgIcon: 'bg-amber-50 text-amber-600',
      valueColor: 'text-amber-700',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      className={`bg-white rounded-2xl border ${currentVariant.border} p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <h3 className={`text-2xl font-bold tracking-tight mt-1.5 ${currentVariant.valueColor}`}>
            {formatCurrency(amount)}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${currentVariant.bgIcon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default MetricCard;
