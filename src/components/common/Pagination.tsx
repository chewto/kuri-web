import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  page: number;
  pages: number;
  total?: number;
  perPage?: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  pages,
  total,
  perPage,
  onPageChange,
  disabled = false,
}) => {
  if (pages <= 1) {
    return null;
  }

  const from = perPage ? (page - 1) * perPage + 1 : undefined;
  const to = perPage && total !== undefined ? Math.min(page * perPage, total) : undefined;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
      {total !== undefined && from !== undefined && to !== undefined ? (
        <p className="text-xs text-slate-500">
          Mostrando <strong className="text-slate-700">{from}</strong>–
          <strong className="text-slate-700">{to}</strong> de{' '}
          <strong className="text-slate-700">{total}</strong>
        </p>
      ) : (
        <span />
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Anterior</span>
        </Button>

        <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
          Página {page} de {pages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page >= pages}
        >
          <span>Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
