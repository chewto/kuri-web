import React, { useState } from 'react';
import { Calendar, AlertCircle, Clock, CheckCircle2, Building2 } from 'lucide-react';
import { UpcomingRenewalsGroup } from '../../types/financeSummary';
import { Subscription } from '../../types/subscription';

interface UpcomingRenewalsWidgetProps {
  renewals7: UpcomingRenewalsGroup;
  renewals30: UpcomingRenewalsGroup;
  onSelectSubscription?: (sub: Subscription) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const UpcomingRenewalsWidget: React.FC<UpcomingRenewalsWidgetProps> = ({
  renewals7,
  renewals30,
  onSelectSubscription,
}) => {
  const [activeTab, setActiveTab] = useState<'7days' | '30days'>('7days');

  const currentGroup = activeTab === '7days' ? renewals7 : renewals30;

  const calculateDaysRemaining = (targetDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(targetDateStr + 'T00:00:00');
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Upcoming Renewals & SaaS Payments
            </h2>
            <p className="text-xs text-slate-500">
              Alerts for recurring subscriptions scheduled for billing
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('7days')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === '7days'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Next 7 days ({renewals7?.count || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('30days')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === '30days'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Next 30 days ({renewals30?.count || 0})
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[380px] divide-y divide-slate-100">
        {!currentGroup || currentGroup.items.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              No payments due in this period
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              You don't have any active SaaS tools or services due in the next{' '}
              {activeTab === '7days' ? '7 days' : '30 days'}.
            </p>
          </div>
        ) : (
          currentGroup.items.map((sub) => {
            const daysLeft = calculateDaysRemaining(sub.next_billing_date);
            const isUrgent = daysLeft <= 3;

            return (
              <div
                key={sub.id}
                onClick={() => onSelectSubscription && onSelectSubscription(sub)}
                className={`py-3.5 px-3 rounded-xl transition-all flex items-center justify-between gap-3 ${
                  onSelectSubscription ? 'hover:bg-slate-50 cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                    style={{ backgroundColor: sub.category_color || '#3B82F6' }}
                  >
                    {sub.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-800 truncate">
                        {sub.name}
                      </span>
                      {sub.category_name && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium truncate hidden sm:inline-block"
                          style={{
                            backgroundColor: `${sub.category_color || '#3B82F6'}15`,
                            color: sub.category_color || '#3B82F6',
                          }}
                        >
                          {sub.category_name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {sub.next_billing_date}
                      </span>
                      {sub.company_name && (
                        <span className="flex items-center gap-1 truncate text-slate-400">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{sub.company_name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-bold text-sm text-slate-900">
                    {formatCurrency(sub.cost)}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isUrgent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        {daysLeft <= 0 ? 'Due today' : `In ${daysLeft}d`}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        In {daysLeft} days
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default UpcomingRenewalsWidget;
