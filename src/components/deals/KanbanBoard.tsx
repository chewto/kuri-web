import React, { useState } from 'react';
import { GripVertical, Inbox, RefreshCw } from 'lucide-react';
import { Deal, StageDealsGroup } from '../../types/deal';
import { KanbanColumn } from './KanbanColumn';
import { formatCurrency } from '../../utils/formatters';

interface KanbanBoardProps {
  groups: StageDealsGroup[];
  isLoading: boolean;
  movingDealId: string | null;
  onEditDeal: (deal: Deal) => void;
  onDeleteDeal: (dealId: string) => void;
  onMoveDeal: (dealId: string, targetStageId: string) => void;
  onReload: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  groups,
  isLoading,
  movingDealId,
  onEditDeal,
  onDeleteDeal,
  onMoveDeal,
  onReload,
}) => {
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, deal: Deal) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedDealId(deal.id);
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
  };

  const handleDropDeal = (targetStageId: string, dealId: string) => {
    setDraggedDealId(null);

    if (!dealId) return;

    const sourceGroup = groups.find((group) => group.deals.some((deal) => deal.id === dealId));
    if (!sourceGroup || sourceGroup.id === targetStageId) return;

    onMoveDeal(dealId, targetStageId);
  };

  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading deals board">
        <div className="flex items-center justify-between">
          <div className="h-4 w-44 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-52 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="overflow-hidden pb-2">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((column) => (
              <div
                key={column}
                className="h-[calc(100vh-22rem)] min-h-[280px] w-80 flex-shrink-0 animate-pulse rounded-2xl border border-slate-200/80 bg-slate-100/70 p-3.5"
              >
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="mt-2 h-3 w-20 rounded bg-slate-200/70" />
                <div className="mt-4 space-y-2.5">
                  {[1, 2].map((card) => (
                    <div key={card} className="h-32 rounded-xl border border-slate-200/70 bg-white p-3">
                      <div className="h-3 w-3/4 rounded bg-slate-200" />
                      <div className="mt-3 h-5 w-1/2 rounded bg-slate-100" />
                      <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-800">No stages configured</h3>
        <p className="mt-1 max-w-sm text-xs text-slate-500">
          Your sales funnel has no stages yet. Reload to initialize the workspace's standard stages,
          or check your connection to the server.
        </p>
        <button
          type="button"
          onClick={onReload}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reload board
        </button>
      </div>
    );
  }

  const totalDeals = groups.reduce((sum, group) => sum + group.total_deals, 0);
  const totalValue = groups.reduce((sum, group) => sum + group.total_value, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-slate-400">
            Pipeline stages
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 font-semibold text-slate-700">
            {groups.length}
          </span>
          <span className="text-slate-300">·</span>
          <span>
            {totalDeals} {totalDeals === 1 ? 'deal' : 'deals'}
          </span>
          <span className="text-slate-300">·</span>
          <span className="font-semibold text-slate-700">{formatCurrency(totalValue)}</span>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-slate-400">
          <GripVertical className="h-3.5 w-3.5" />
          Drag cards between stages to update the pipeline
        </p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-h-[280px] gap-4 px-0.5">
          {groups.map((group) => (
            <KanbanColumn
              key={group.id}
              group={group}
              onEditDeal={onEditDeal}
              onDeleteDeal={onDeleteDeal}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDropDeal={handleDropDeal}
              draggedDealId={draggedDealId}
              movingDealId={movingDealId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
