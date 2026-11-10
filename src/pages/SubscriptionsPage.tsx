import React, { useState, useEffect, useCallback } from 'react';
import {
  Repeat,
  Plus,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Tag,
} from 'lucide-react';
import {
  Subscription,
  SubscriptionFormData,
  SubscriptionStatus,
} from '../types/subscription';
import { Category } from '../types/category';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../services/subscriptionService';
import { getCategories } from '../services/categoryService';
import { SubscriptionCard } from '../components/finance/SubscriptionCard';
import { SubscriptionModal } from '../components/finance/SubscriptionModal';
import { CategoryManagerModal } from '../components/categories/CategoryManagerModal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorNotification(null);
      const data = await getSubscriptions({
        status: statusFilter,
        category_id: categoryFilter || undefined,
      });
      setSubscriptions(data);
    } catch {
      setErrorNotification(
        "Couldn't load subscriptions. Check the server connection."
      );
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      // Ignore secondary category error
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handleCreateOrUpdate = async (formData: SubscriptionFormData) => {
    if (selectedSubscription) {
      await updateSubscription(selectedSubscription.id, formData);
    } else {
      await createSubscription(formData);
    }
    await fetchSubscriptions();
  };

  const handleEdit = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setModalOpen(true);
  };

  const handleDelete = async (sub: Subscription) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the subscription "${sub.name}"?`
    );
    if (!confirmed) return;

    try {
      await deleteSubscription(sub.id);
      await fetchSubscriptions();
    } catch {
      alert("Couldn't delete the subscription.");
    }
  };

  const handleToggleStatus = async (sub: Subscription) => {
    try {
      const nextStatus: SubscriptionStatus =
        sub.status === 'active' ? 'paused' : 'active';
      await updateSubscription(sub.id, { status: nextStatus });
      await fetchSubscriptions();
    } catch {
      alert("Couldn't update the subscription status.");
    }
  };

  const handleOpenNew = () => {
    setSelectedSubscription(null);
    setModalOpen(true);
  };

  // Local filtering by search term (name or company)
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      sub.name.toLowerCase().includes(term) ||
      (sub.company_name && sub.company_name.toLowerCase().includes(term))
    );
  });

  // Calculate total MRR for active subscriptions
  const totalActiveMRR = filteredSubscriptions
    .filter((s) => s.status === 'active')
    .reduce((acc, curr) => {
      if (curr.billing_cycle === 'monthly') return acc + curr.cost;
      if (curr.billing_cycle === 'yearly') return acc + curr.cost / 12;
      if (curr.billing_cycle === 'quarterly') return acc + curr.cost / 3;
      return acc + curr.cost;
    }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Repeat className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Subscriptions & SaaS (OPEX)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage software, cloud infrastructure, and recurring licenses by client or organization.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptions}
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setCategoryModalOpen(true)}
          >
            <Tag className="w-4 h-4 text-slate-500" />
            <span>Categories</span>
          </Button>
          <Button variant="primary" size="md" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" />
            <span>New Subscription</span>
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

      {/* Toolbar & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="w-full sm:w-64">
            <Input
              placeholder="Search tools or clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:inline-block" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as SubscriptionStatus | '')
              }
              className="w-full sm:w-auto rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="cancelled">Canceled</option>
            </select>
          </div>

          {/* Category filter */}
          <div className="w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick summary of filtered MRR */}
        <div className="flex items-center gap-3 self-end md:self-auto text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
          <span className="text-slate-500">
            Total:{' '}
            <strong className="text-slate-800">
              {filteredSubscriptions.length}
            </strong>{' '}
            services
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            Active MRR:{' '}
            <strong className="text-emerald-700">
              ${totalActiveMRR.toFixed(2)}/mo
            </strong>
          </span>
        </div>
      </div>

      {/* Subscriptions grid */}
      {isLoading ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs font-medium">Loading SaaS subscriptions...</p>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="p-16 bg-white rounded-2xl border border-slate-200 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Repeat className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            No subscriptions found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || statusFilter || categoryFilter
              ? 'Try changing or clearing the selected filters.'
              : 'Add your first software tool to audit recurring costs.'}
          </p>
          <div className="mt-4">
            <Button variant="primary" size="sm" onClick={handleOpenNew}>
              <Plus className="w-4 h-4" />
              <span>Add Your First Subscription</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSubscriptions.map((sub) => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Subscription Modal */}
      <SubscriptionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedSubscription}
        onOpenCategoryManager={() => setCategoryModalOpen(true)}
        categories={categories}
        onRefreshCategories={fetchCategories}
      />

      {/* Categories Modal */}
      <CategoryManagerModal
        isOpen={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          fetchCategories();
        }}
        onCategoryCreated={(cat) => {
          setCategories((prev) => [...prev, cat]);
        }}
      />
    </div>
  );
};
export default SubscriptionsPage;
