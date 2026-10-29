import React, { useState, useEffect, useCallback } from 'react';
import {
  CreditCard,
  Plus,
  RefreshCw,
  Filter,
  TrendingUp,
  TrendingDown,
  Tag,
} from 'lucide-react';
import {
  Transaction,
  TransactionFormData,
  TransactionType,
} from '../types/transaction';
import { Category } from '../types/category';
import {
  getTransactions,
  createTransaction,
  deleteTransaction,
} from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { TransactionTable } from '../components/finance/TransactionTable';
import { TransactionModal } from '../components/finance/TransactionModal';
import { CategoryManagerModal } from '../components/categories/CategoryManagerModal';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  // Paginación y Filtros
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, per_page: 20 });
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modales
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultModalType, setDefaultModalType] = useState<TransactionType>('income');
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorNotification(null);
      const data = await getTransactions({
        type: typeFilter,
        category_id: categoryFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        per_page: 20,
      });
      setTransactions(data.items);
      setPagination({
        total: data.total,
        pages: data.pages,
        per_page: data.per_page,
      });
      if (data.pages > 0 && page > data.pages) {
        setPage(data.pages);
      }
    } catch {
      setErrorNotification(
        'No se pudieron cargar las transacciones. Verifica la conexión con el servidor.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, categoryFilter, startDate, endDate, page]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      // Ignorar error de categorA-as
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, categoryFilter, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleCreateTransaction = async (formData: TransactionFormData) => {
    await createTransaction(formData);
    await fetchTransactions();
  };

  const handleDelete = async (tx: Transaction) => {
    const confirmed = window.confirm(
      `¿Estás seguro de que deseas eliminar el movimiento "${tx.description}"?`
    );
    if (!confirmed) return;

    try {
      await deleteTransaction(tx.id);
      await fetchTransactions();
    } catch {
      alert('Error al eliminar la transacción.');
    }
  };

  const handleOpenNewIncome = () => {
    setDefaultModalType('income');
    setModalOpen(true);
  };

  const handleOpenNewExpense = () => {
    setDefaultModalType('expense');
    setModalOpen(true);
  };

  // Cálculo de subtotales de la lista cargada
  const currentIncomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const currentExpenseTotal = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">
              Transacciones & Movimientos de Caja
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registro detallado y conciliación de ingresos por ventas y salidas operativas.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={isLoading}
            title="Recargar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={() => setCategoryModalOpen(true)}
          >
            <Tag className="w-4 h-4 text-slate-500" />
            <span>Categorías</span>
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleOpenNewExpense}
            className="border-rose-200 text-rose-700 hover:bg-rose-50"
          >
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span>Registrar Gasto</span>
          </Button>
          <Button variant="primary" size="md" onClick={handleOpenNewIncome}>
            <Plus className="w-4 h-4" />
            <span>Registrar Ingreso</span>
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1">
          {/* Type filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:inline-block" />
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as TransactionType | '')
              }
              className="rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">Todos los Tipos</option>
              <option value="income">Solo Ingresos (+)</option>
              <option value="expense">Solo Egresos (-)</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-300 py-2 px-3 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            >
              <option value="">Todas las Categorías</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Desde:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-lg border border-slate-300 py-1.5 px-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
            <span>Hasta:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-lg border border-slate-300 py-1.5 px-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>

          {(typeFilter || categoryFilter || startDate || endDate) && (
            <button
              type="button"
              onClick={() => {
                setTypeFilter('');
                setCategoryFilter('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Resumen de página */}
        <div className="flex items-center gap-3 self-end lg:self-auto text-xs bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
          <span className="text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            +${currentIncomeTotal.toFixed(2)}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500 flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            -${currentExpenseTotal.toFixed(2)}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            Total:{' '}
            <strong className="text-slate-800">{pagination.total}</strong>
          </span>
        </div>
      </div>

      {/* Tabla */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* Paginación */}
      <Pagination
        page={page}
        pages={pagination.pages}
        total={pagination.total}
        perPage={pagination.per_page}
        onPageChange={setPage}
        disabled={isLoading}
      />

      {/* Modal Nueva Transacción */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTransaction}
        defaultType={defaultModalType}
        onOpenCategoryManager={() => setCategoryModalOpen(true)}
        categories={categories}
        onRefreshCategories={fetchCategories}
      />

      {/* Modal Categorías */}
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
export default TransactionsPage;
