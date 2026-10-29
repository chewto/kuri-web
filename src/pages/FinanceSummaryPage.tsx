import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Repeat,
  Plus,
  RefreshCw,
  Calendar,
  Layers,
} from 'lucide-react';
import { FinanceSummary } from '../types/financeSummary';
import { SubscriptionFormData } from '../types/subscription';
import { TransactionFormData } from '../types/transaction';
import { Category } from '../types/category';
import { getFinanceSummary } from '../services/financeSummaryService';
import { createSubscription } from '../services/subscriptionService';
import { createTransaction } from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { MetricCard } from '../components/finance/MetricCard';
import { UpcomingRenewalsWidget } from '../components/finance/UpcomingRenewalsWidget';
import { SubscriptionModal } from '../components/finance/SubscriptionModal';
import { TransactionModal } from '../components/finance/TransactionModal';
import { CategoryManagerModal } from '../components/categories/CategoryManagerModal';
import { Button } from '../components/common/Button';

export const FinanceSummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  // Modales
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [catModalOpen, setCatModalOpen] = useState(false);

  // CategorA-as compartidas para los selects de los modales
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      // Ignorar error de categorA-as secundarias
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorNotification(null);
      const data = await getFinanceSummary();
      setSummary(data);
    } catch {
      setErrorNotification(
        'No se pudo cargar el resumen financiero. Verifica la conexión con el servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleCreateSubscription = async (formData: SubscriptionFormData) => {
    await createSubscription(formData);
    await fetchSummary();
  };

  const handleCreateTransaction = async (formData: TransactionFormData) => {
    await createTransaction(formData);
    await fetchSummary();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Visión General Financiera & OPEX
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Control consolidado de costes operativos fijos, suscripciones de software y flujo de caja mensual.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSummary}
            disabled={isLoading}
            title="Recargar métricas"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setSubModalOpen(true)}
          >
            <Repeat className="w-4 h-4 text-emerald-600" />
            <span>Nueva Suscripción</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setTxModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Movimiento</span>
          </Button>
        </div>
      </div>

      {errorNotification && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
          <span>{errorNotification}</span>
          <button
            type="button"
            onClick={() => setErrorNotification(null)}
            className="text-rose-500 hover:text-rose-700 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tarjetas KPI Financieras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Gasto Fijo Mensual (MRR OPEX)"
          amount={summary?.monthly_expense_mrr || 0}
          subtitle={`${summary?.active_subscriptions_count || 0} suscripciones SaaS activas`}
          icon={Repeat}
          variant="slate"
        />

        <MetricCard
          title="Ingresos del Mes Actual"
          amount={summary?.current_month_balance.total_income || 0}
          subtitle="Cobros y facturación registrados"
          icon={TrendingUp}
          variant="emerald"
        />

        <MetricCard
          title="Gastos del Mes Actual"
          amount={summary?.current_month_balance.total_expenses || 0}
          subtitle="Salidas de caja en el mes"
          icon={TrendingDown}
          variant="rose"
        />

        <MetricCard
          title="Balance Neto del Mes"
          amount={summary?.current_month_balance.net_balance || 0}
          subtitle={`Total de ${summary?.current_month_balance.transactions_count || 0} transacciones`}
          icon={DollarSign}
          variant={
            (summary?.current_month_balance.net_balance || 0) >= 0
              ? 'emerald'
              : 'rose'
          }
        />
      </div>

      {/* Main Grid: Upcoming Renewals + Cash Flow Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Upcoming Renewals Widget */}
        <div className="lg:col-span-2">
          <UpcomingRenewalsWidget
            renewals7={
              summary?.upcoming_renewals.next_7_days || { count: 0, items: [] }
            }
            renewals30={
              summary?.upcoming_renewals.next_30_days || { count: 0, items: [] }
            }
          />
        </div>

        {/* Right: Operational Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Resumen de Ciclo y Caja
                </h3>
                <p className="text-xs text-slate-500">
                  Periodo actual en curso
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Periodo de corte:
                </span>
                <span className="font-semibold text-slate-800">
                  {summary?.current_month_balance.start_date || '---'} al{' '}
                  {summary?.current_month_balance.end_date || '---'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Herramientas registradas:</span>
                <span className="font-semibold text-slate-800">
                  {summary?.active_subscriptions_count || 0} activas
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total movimientos mes:</span>
                <span className="font-semibold text-slate-800">
                  {summary?.current_month_balance.transactions_count || 0}
                </span>
              </div>
            </div>

            {/* Quick action banners */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-800">
                Gestión de OPEX y Software
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Centraliza las licencias de herramientas como Claude, AWS, Google Workspace y Figma para auditar costes por equipo o cliente.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(true)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Gestionar Categorías →
                </button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Métricas calculadas en tiempo real para tu organización
          </div>
        </div>
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        onSubmit={handleCreateSubscription}
        onOpenCategoryManager={() => setCatModalOpen(true)}
        categories={categories}
        onRefreshCategories={fetchCategories}
      />

      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSubmit={handleCreateTransaction}
        onOpenCategoryManager={() => setCatModalOpen(true)}
        categories={categories}
        onRefreshCategories={fetchCategories}
      />

      <CategoryManagerModal
        isOpen={catModalOpen}
        onClose={() => {
          setCatModalOpen(false);
          fetchCategories();
        }}
        onCategoryCreated={(cat) => {
          setCategories((prev) => [...prev, cat]);
        }}
      />
    </div>
  );
};
export default FinanceSummaryPage;
