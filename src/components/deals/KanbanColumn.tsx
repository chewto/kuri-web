import React, { useRef, useState } from 'react';
import { DealCard } from './DealCard';
import { Deal, StageDealsGroup } from '../../types/deal';
import { formatCurrency } from '../../utils/formatters';

interface KanbanColumnProps {
  group: StageDealsGroup;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, deal: Deal) => void;
  onDragEnd: () => void;
  onDropDeal: (targetStageId: string, dealId: string) => void;
  draggedDealId: string | null;
  movingDealId: string | null;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  group,
  onEditDeal,
  onDeleteDeal,
  onDragStart,
  onDragEnd,
  onDropDeal,
  draggedDealId,
  movingDealId,
}) => {
  const [isOver, setIsOver] = useState(false);
  const dragDepth = useRef(0);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current += 1;
    setIsOver(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) {
      setIsOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragDepth.current = 0;
    setIsOver(false);

    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (dealId) {
      onDropDeal(group.id, dealId);
    }
  };

  return (
    <section
      aria-label={`Etapa ${group.name}`}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex h-[calc(100vh-22rem)] min-h-[280px] w-80 flex-shrink-0 flex-col rounded-2xl border transition-all ${
        isOver
          ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-500/20'
          : 'border-slate-200/80 bg-slate-100/70 hover:border-slate-300'
      }`}
    >
      {/* Column Header */}
      <div className="border-b border-slate-200/60 p-3.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <h3
              className="max-w-[170px] truncate text-xs font-bold uppercase tracking-wide text-slate-800"
              title={group.name}
            >
              {group.name}
            </h3>
            <span className="inline-flex items-center justify-center rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
              {group.total_deals}
            </span>
          </div>
          <span className="shrink-0 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
            {group.probability}% prob.
          </span>
        </div>

        {/* Subtotal de la etapa */}
        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="font-bold text-slate-800">{formatCurrency(group.total_value)}</span>
        </div>
      </div>

      {/* Cards List Area */}
      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-2.5">
        {group.deals.length === 0 ? (
          <div
            className={`flex h-28 items-center justify-center rounded-xl border border-dashed text-xs transition-colors ${
              isOver
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-400'
            }`}
          >
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
              onDragEnd={onDragEnd}
              isDragging={draggedDealId === deal.id}
              isSaving={movingDealId === deal.id}
            />
          ))
        )}
      </div>
    </section>
  );
};
