import React, { useState, useEffect } from 'react';
import { X, Repeat, Plus } from 'lucide-react';
import {
  Subscription,
  SubscriptionFormData,
  BillingCycle,
  SubscriptionStatus,
} from '../../types/subscription';
import { Category } from '../../types/category';
import { Company } from '../../types/company';
import { getAllCompanies } from '../../services/companyService';
import { getCategories } from '../../services/categoryService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubscriptionFormData) => Promise<void>;
  initialData?: Subscription | null;
  onOpenCategoryManager?: () => void;
  categories?: Category[];
  onRefreshCategories?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  onOpenCategoryManager,
  categories: categoriesProp,
  onRefreshCategories,
}) => {
  const [formData, setFormData] = useState<SubscriptionFormData>({
    name: '',
    cost: 0,
    billing_cycle: 'monthly',
    next_billing_date: '',
    status: 'active',
    company_id: '',
    category_id: '',
  });

  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (categoriesProp && categoriesProp.length > 0) {
      setCategories(categoriesProp);
    } else {
      getCategories().then(setCategories).catch(() => {});
    }
  }, [isOpen, categoriesProp]);

  useEffect(() => {
    if (!isOpen) return;
    // Cargar empresas y refrescar categorA-as cada vez que se abre
    getAllCompanies().then(setCompanies).catch(() => {});
    onRefreshCategories?.();

    if (initialData) {
      setFormData({
        name: initialData.name,
        cost: initialData.cost,
        billing_cycle: initialData.billing_cycle,
        next_billing_date: initialData.next_billing_date,
        status: initialData.status,
        company_id: initialData.company_id || '',
        category_id: initialData.category_id || '',
      });
    } else {
      const todayStr = new Date().toISOString().split('T')[0];
      setFormData({
        name: '',
        cost: 0,
        billing_cycle: 'monthly',
        next_billing_date: todayStr,
        status: 'active',
        company_id: '',
        category_id: '',
      });
    }
    setErrors({});
  }, [isOpen, initialData, onRefreshCategories]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del servicio o herramienta es requerido.';
    }

    if (formData.cost === undefined || formData.cost === null || isNaN(Number(formData.cost)) || Number(formData.cost) < 0) {
      newErrors.cost = 'El costo debe ser un valor numérico mayor o igual a 0.';
    }

    if (!formData.next_billing_date) {
      newErrors.next_billing_date = 'La fecha de próximo cobro es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        cost: Number(formData.cost),
        company_id: formData.company_id || null,
        category_id: formData.category_id || null,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrors({
        submit: error.response?.data?.message || 'Error al guardar la suscripción. Revisa los datos.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {initialData ? 'Editar Suscripción / SaaS' : 'Nueva Suscripción / SaaS'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialData
                  ? 'Modifica los parámetros y recurrencia del servicio'
                  : 'Registra un software u OPEX recurrente de la organización'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errors.submit}
            </div>
          )}

          <Input
            label="Nombre del Servicio / Herramienta *"
            placeholder="Ej: Claude Pro, AWS Infrastructure, Figma Org, Notion"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Costo / Monto (USD) *"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.cost === 0 && !initialData ? '' : formData.cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  cost: e.target.value === '' ? 0 : parseFloat(e.target.value),
                })
              }
              error={errors.cost}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Ciclo de Cobro *
              </label>
              <select
                value={formData.billing_cycle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    billing_cycle: e.target.value as BillingCycle,
                  })
                }
                className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              >
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Próximo Cobro (Fecha) *"
              type="date"
              value={formData.next_billing_date}
              onChange={(e) =>
                setFormData({ ...formData, next_billing_date: e.target.value })
              }
              error={errors.next_billing_date}
              required
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado *
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as SubscriptionStatus,
                  })
                }
                className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
              >
                <option value="active">Activa</option>
                <option value="paused">Pausada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Categoría Financiera
              </label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Gestionar Categorías
                </button>
              )}
            </div>
            <select
              value={formData.category_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value || null })
              }
              className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">-- Sin categoría asignada --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Empresa cliente o interna */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Empresa / Cliente Asociado (Opcional)
            </label>
            <select
              value={formData.company_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, company_id: e.target.value || null })
              }
              className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">-- Uso Interno / Organización General --</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} {comp.tax_id ? `(${comp.tax_id})` : ''}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Si esta suscripción se adquiere específicamente para un cliente o proyecto, elígelo aquí.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {initialData ? 'Actualizar Suscripción' : 'Guardar Suscripción'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SubscriptionModal;
