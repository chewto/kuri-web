import React, { useState, useEffect } from 'react';
import { X, CreditCard, Plus } from 'lucide-react';
import { TransactionFormData, TransactionType } from '../../types/transaction';
import { Category } from '../../types/category';
import { Company } from '../../types/company';
import { getAllCompanies } from '../../services/companyService';
import { getCategories } from '../../services/categoryService';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  defaultType?: TransactionType;
  onOpenCategoryManager?: () => void;
  categories?: Category[];
  onRefreshCategories?: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultType = 'income',
  onOpenCategoryManager,
  categories: categoriesProp,
  onRefreshCategories,
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    type: defaultType,
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    company_id: '',
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
    getAllCompanies().then(setCompanies).catch(() => {});
    onRefreshCategories?.();

    const todayStr = new Date().toISOString().split('T')[0];
    setFormData({
      type: defaultType,
      amount: 0,
      description: '',
      date: todayStr,
      category_id: '',
      company_id: '',
    });
    setErrors({});
  }, [isOpen, defaultType, onRefreshCategories]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'A transaction description is required.';
    }

    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'The amount must be a decimal number greater than 0.';
    }

    if (!formData.date) {
      newErrors.date = 'Transaction date is required.';
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
        amount: Number(formData.amount),
        category_id: formData.category_id || null,
        company_id: formData.company_id || null,
      });
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setErrors({
        submit: error.response?.data?.message || "Couldn't save the transaction. Check your details.",
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
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Record Cash Transaction
              </h2>
              <p className="text-xs text-slate-500">
                Record a client payment or an operating expense
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

          {/* Transaction type with a visual pill selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Transaction Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  formData.type === 'income'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Income (+ Inflow)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                  formData.type === 'expense'
                    ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Expense (- Outflow)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Amount (USD) *"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={formData.amount === 0 ? '' : formData.amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  amount: e.target.value === '' ? 0 : parseFloat(e.target.value),
                })
              }
              error={errors.amount}
              required
            />

            <Input
              label="Transaction Date *"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              error={errors.date}
              required
            />
          </div>

          <Input
            label="Description / Details *"
            placeholder="E.g. Acme monthly invoice payment, AWS server purchase"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            error={errors.description}
            required
          />

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Category
              </label>
              {onOpenCategoryManager && (
                <button
                  type="button"
                  onClick={onOpenCategoryManager}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Manage Categories
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
              <option value="">-- No category assigned --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Client or internal company */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Related Company (Optional)
            </label>
            <select
              value={formData.company_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, company_id: e.target.value || null })
              }
              className="block w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">-- No associated company (Internal) --</option>
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} {comp.tax_id ? `(${comp.tax_id})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Record Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default TransactionModal;
