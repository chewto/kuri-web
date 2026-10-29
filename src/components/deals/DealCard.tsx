import React from 'react';
import { Building2, User, Calendar, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Deal } from '../../types/deal';

interface DealCardProps {
  deal: Deal;
  onEdit: (deal: Deal) => void;
  onDelete: (dealId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, deal: Deal) => void;
}

export const DealCard: React.FC<DealCardProps> = ({ deal, onEdit, onDelete, onDragStart }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatMoney = (val: number = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  const getStatusBadge = () => {
    switch (deal.status) {
      case 'won':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Ganado
          </span>
        );
      case 'lost':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Perdido
          </span>
        );
      default:
        return null;
    }
  };

  const isPastDue = deal.expected_close_date
    ? new Date(deal.expected_close_date) < new Date(new Date().setHours(0, 0, 0, 0)) && deal.status === 'open'
    : false;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, deal)}
      className="group relative bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top Header: Title & Context Menu */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
          {deal.title}
        </h4>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-6 w-32 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-20 text-xs">
              <button
                type="button"
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
      <div className="mt-2.5 flex items-center justify-between">
        <div className="text-base font-bold text-slate-900 tracking-tight">
          {formatMoney(deal.value)}
        </div>
        <div className="flex items-center gap-1.5">
          {getStatusBadge()}
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

        {deal.contact_name && (
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-500">{deal.contact_name}</span>
          </div>
        )}

        {deal.expected_close_date && (
          <div
            className={`flex items-center gap-1.5 text-[11px] ${
              isPastDue ? 'text-rose-600 font-semibold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isPastDue ? 'Vencido: ' : 'Cierre: '}
              {deal.expected_close_date}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
