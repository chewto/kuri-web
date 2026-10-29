import React from 'react';
import { Calendar, Building2, MoreVertical, Edit2, Trash2, PauseCircle, PlayCircle, ShieldCheck } from 'lucide-react';
import { Subscription } from '../../types/subscription';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscription: Subscription) => void;
  onToggleStatus?: (subscription: Subscription) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const cycleLabels = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    yearly: 'Anual',
  };

  const statusBadges = {
    active: {
      label: 'Activa',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    paused: {
      label: 'Pausada',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    cancelled: {
      label: 'Cancelada',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
  };

  // Normalizar gasto mensual
  const normalizedMonthlyCost = () => {
    if (subscription.billing_cycle === 'monthly') return subscription.cost;
    if (subscription.billing_cycle === 'yearly') return subscription.cost / 12;
    if (subscription.billing_cycle === 'quarterly') return subscription.cost / 3;
    return subscription.cost;
  };

  const currentBadge = statusBadges[subscription.status] || statusBadges.active;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0"
            style={{ backgroundColor: subscription.category_color || '#10B981' }}
          >
            {subscription.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-slate-900 truncate" title={subscription.name}>
              {subscription.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              {subscription.category_name && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${subscription.category_color || '#10B981'}15`,
                    color: subscription.category_color || '#10B981',
                  }}
                >
                  {subscription.category_name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Menu Actions */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(subscription);
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  Editar servicio
                </button>

                {onToggleStatus && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleStatus(subscription);
                    }}
                    className="w-full text-left px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    {subscription.status === 'active' ? (
                      <>
                        <PauseCircle className="w-3.5 h-3.5 text-amber-500" />
                        Pausar suscripción
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                        Reactivar suscripción
                      </>
                    )}
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(subscription);
                  }}
                  className="w-full text-left px-3.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Middle info: Cost & Cycle */}
      <div className="my-4 py-3 px-3.5 bg-slate-50 rounded-xl flex items-baseline justify-between">
        <div>
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Coste por ciclo
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-slate-900">
              {formatCurrency(subscription.cost)}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              / {cycleLabels[subscription.billing_cycle]}
            </span>
          </div>
        </div>

        {subscription.billing_cycle !== 'monthly' && (
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Equiv. mensual</span>
            <span className="text-xs font-semibold text-slate-700">
              ~{formatCurrency(normalizedMonthlyCost())}/mes
            </span>
          </div>
        )}
      </div>

      {/* Bottom info: Company, Next Billing, Status */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Próximo cobro:
          </span>
          <span className="font-semibold text-slate-800">
            {subscription.next_billing_date}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            Empresa / Cliente:
          </span>
          <span className="font-medium text-slate-800 truncate max-w-[140px]" title={subscription.company_name || 'Uso Interno'}>
            {subscription.company_name || 'Uso Interno / Org'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            Estado:
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${currentBadge.bg}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${currentBadge.dot}`} />
            {currentBadge.label}
          </span>
        </div>
      </div>
    </div>
  );
};
export default SubscriptionCard;
