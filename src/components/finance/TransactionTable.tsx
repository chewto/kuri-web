import React from 'react';
import { ArrowUpRight, ArrowDownRight, Trash2, Calendar, Building2, Tag } from 'lucide-react';
import { Transaction } from '../../types/transaction';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onDelete: (tx: Transaction) => void;
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-12 text-center text-slate-400">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-xs font-medium">Cargando transacciones...</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-12 text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3">
          <Tag className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800">
          No se encontraron movimientos registrados
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          No hay transacciones que coincidan con los filtros seleccionados o aún no has registrado cobros o pagos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Descripción</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Empresa / Cliente</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4 text-right">Monto</th>
              <th className="py-3 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';

              return (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/60 transition-colors group"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {tx.date}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 max-w-xs truncate" title={tx.description}>
                      {tx.description}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {tx.category_name ? (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${tx.category_color || '#10B981'}15`,
                          color: tx.category_color || '#10B981',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: tx.category_color || '#10B981' }}
                        />
                        {tx.category_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">General</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {tx.company_name ? (
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {tx.company_name}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Interno</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        isIncome
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/80'
                      }`}
                    >
                      {isIncome ? (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                          Ingreso
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3 h-3 text-rose-600" />
                          Egreso
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold">
                    <span
                      className={
                        isIncome ? 'text-emerald-600' : 'text-slate-900'
                      }
                    >
                      {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <button
                      type="button"
                      onClick={() => onDelete(tx)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Eliminar transacción"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default TransactionTable;
