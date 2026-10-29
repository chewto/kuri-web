import React, { useState } from 'react';
import { DealCard } from './DealCard';
import { Deal, StageDealsGroup } from '../../types/deal';

interface KanbanColumnProps {
  group: StageDealsGroup;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, deal: Deal) => void;
  onDropDeal: (targetStageId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  group,
  onEditDeal,
  onDeleteDeal,
  onDragStart,
  onDropDeal,
}) => {
  const [isOver, setIsOver] = useState(false);

  const formatMoney = (val: number = 0) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsOver(false);
    onDropDeal(group.id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-shrink-0 w-80 bg-slate-100/70 rounded-2xl border transition-all ${
        isOver
          ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-200/60">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide truncate max-w-[170px]" title={group.name}>
              {group.name}
            </h3>
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 text-slate-700">
              {group.total_deals}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
            {group.probability}% prob.
          </span>
        </div>

        {/* Subtotal de la etapa */}
        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="text-slate-800 font-bold">{formatMoney(group.total_value)}</span>
        </div>
      </div>

      {/* Cards List Area */}
      <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-270px)] min-h-[140px]">
        {group.deals.length === 0 ? (
          <div className="h-28 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
            {isOver ? 'Soltar aquí' : 'Sin tratos en esta etapa'}
          </div>
        ) : (
          group.deals.map((deal) => (
            <DealCard
              key={deal.id}
              deal={deal}
              onEdit={onEditDeal}
              onDelete={onDeleteDeal}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
};
