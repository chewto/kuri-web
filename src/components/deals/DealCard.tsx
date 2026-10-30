import React from 'react';
import { Building2, User, Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Deal } from '../../types/deal';
import { formatCurrency, formatDate, isDatePast } from '../../utils/formatters';

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, deal: Deal) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isSaving?: boolean;
}

const STATUS_STYLES: Record<Deal['status'], { label: string; className: string }> = {
  open: {
    label: 'Abierto',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  won: {
    label: 'Ganado',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  lost: {
    label: 'Perdido',
    className: 'bg-rose-50 text-rose-700 border-rose-200',
  },
};

export const DealCard: React.FC<DealCardProps> = ({
  deal,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging = false,
  isSaving = false,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const status = STATUS_STYLES[deal.status] ?? STATUS_STYLES.open;
  const pastDue = deal.status === 'open' && isDatePast(deal.expected_close_date);

  React.useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMenu]);

  return (
    <div
      draggable={!isSaving}
      onDragStart={(e) => {
        setShowMenu(false);
        onDragStart(e, deal);
      }}
      onDragEnd={() => {
        onDragEnd?.();
      }}
      aria-label={`Oportunidad ${deal.title}, valor ${formatCurrency(deal.value)}`}
      className={`group relative bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm transition-all select-none ${
        isSaving
          ? 'opacity-60 cursor-wait'
          : 'cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300'
      } ${isDragging ? 'opacity-40 ring-2 ring-emerald-500/40' : ''}`}
    >
      {/* Top Header: Title & Context Menu */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
          {deal.title}
        </h4>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            aria-label={`Acciones para ${deal.title}`}
            aria-haspopup="menu"
            aria-expanded={showMenu}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div
              role="menu"
              className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20 text-xs"
            >
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onEdit(deal);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                Editar
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDelete(deal.id);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Value & Status Badges */}
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="text-base font-bold text-slate-900 tracking-tight">
          {formatCurrency(deal.value)}
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${status.className}`}
          >
            {status.label}
          </span>
          {deal.stage_probability !== undefined && deal.stage_probability !== null && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
              {deal.stage_probability}%
            </span>
          )}
        </div>
      </div>

      {/* Relations: Company & Contact */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium text-slate-700">
            {deal.company_name || 'Sin empresa'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 truncate">
          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className={`truncate ${deal.contact_name ? 'text-slate-500' : 'text-slate-400'}`}>
            {deal.contact_name || 'Sin contacto'}
          </span>
        </div>

        {deal.expected_close_date && (
          <div
            className={`flex items-center gap-1.5 text-[11px] ${
              pastDue ? 'text-rose-600 font-semibold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className={pastDue ? '' : 'text-slate-500'}>
              {pastDue ? 'Vencido: ' : 'Cierre: '}
              {formatDate(deal.expected_close_date)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
