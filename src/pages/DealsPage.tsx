import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { Deal, DealForecast, DealFormData, StageDealsGroup } from '../types/deal';
import { Stage } from '../types/stage';
import { Company } from '../types/company';
import { getStages } from '../services/stageService';
import {
  createDeal,
  deleteDeal,
  getDealForecast,
  getGroupedDeals,
  moveDeal,
  updateDeal,
} from '../services/dealService';
import { getAllCompanies } from '../services/companyService';
import { KanbanBoard } from '../components/deals/KanbanBoard';
import { DealForecastWidget } from '../components/deals/DealForecastWidget';
import { DealModal } from '../components/deals/DealModal';
import { Button } from '../components/common/Button';

const sortByCreatedAtDesc = (a: Deal, b: Deal): number =>
  (b.created_at ?? '').localeCompare(a.created_at ?? '');

const recalcGroup = (group: StageDealsGroup): StageDealsGroup => ({
  ...group,
  total_deals: group.deals.length,
  total_value: group.deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0),
});

const createEmptyGroup = (stage: Stage): StageDealsGroup => ({
  ...stage,
  deals: [],
  total_deals: 0,
  total_value: 0,
});

const mergeStagesWithGroups = (
  stages: Stage[],
  groupedStages: StageDealsGroup[]
): StageDealsGroup[] => {
  const groupedById = new Map(groupedStages.map((group) => [group.id, group]));

  const merged = stages.map((stage) => {
    const group = groupedById.get(stage.id);
    groupedById.delete(stage.id);

    if (!group) return createEmptyGroup(stage);

    return recalcGroup({
      ...group,
      ...stage,
      deals: group.deals ?? [],
    });
  });

  const extraGroups = Array.from(groupedById.values()).map(recalcGroup);

  return [...merged, ...extraGroups].sort((a, b) => a.order - b.order);
};

const moveDealBetweenGroups = (
  groups: StageDealsGroup[],
  dealId: string,
  targetStageId: string
): StageDealsGroup[] => {
  const sourceGroup = groups.find((group) => group.deals.some((deal) => deal.id === dealId));
  const targetGroup = groups.find((group) => group.id === targetStageId);
  const deal = sourceGroup?.deals.find((item) => item.id === dealId);

  if (!sourceGroup || !targetGroup || sourceGroup.id === targetGroup.id || !deal) {
    return groups;
  }

  const optimisticDeal: Deal = {
    ...deal,
    stage_id: targetGroup.id,
    stage_name: targetGroup.name,
    stage_order: targetGroup.order,
    stage_probability: targetGroup.probability,
  };

  return groups.map((group) => {
    if (group.id === sourceGroup.id) {
      return recalcGroup({
        ...group,
        deals: group.deals.filter((item) => item.id !== dealId),
      });
    }

    if (group.id === targetGroup.id) {
      return recalcGroup({
        ...group,
        deals: [optimisticDeal, ...group.deals].sort(sortByCreatedAtDesc),
      });
    }

    return group;
  });
};

const applyServerDeal = (groups: StageDealsGroup[], updatedDeal: Deal): StageDealsGroup[] => {
  const targetGroup = groups.find((group) => group.id === updatedDeal.stage_id);
  if (!targetGroup) return groups;

  return groups.map((group) => {
    const dealsWithoutUpdated = group.deals.filter((deal) => deal.id !== updatedDeal.id);

    if (group.id === targetGroup.id) {
      return recalcGroup({
        ...group,
        deals: [updatedDeal, ...dealsWithoutUpdated].sort(sortByCreatedAtDesc),
      });
    }

    return recalcGroup({ ...group, deals: dealsWithoutUpdated });
  });
};

const removeDealFromGroups = (groups: StageDealsGroup[], dealId: string): StageDealsGroup[] =>
  groups.map((group) => {
    if (!group.deals.some((deal) => deal.id === dealId)) return group;
    return recalcGroup({
      ...group,
      deals: group.deals.filter((deal) => deal.id !== dealId),
    });
  });

export const DealsPage: React.FC = () => {
  const [stages, setStages] = useState<Stage[]>([]);
  const [groups, setGroups] = useState<StageDealsGroup[]>([]);
  const [forecast, setForecast] = useState<DealForecast | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [movingDealId, setMovingDealId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  const requestIdRef = useRef(0);
  const movingDealRef = useRef<string | null>(null);

  const loadData = useCallback(async (mode: 'initial' | 'refresh' = 'refresh') => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    if (mode === 'initial') {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setErrorMessage(null);

    try {
      // `getStages` auto-initializes the tenant's standard stages on the backend.
      const stageList = await getStages();

      const [groupedResult, forecastResult, companiesResult] = await Promise.allSettled([
        getGroupedDeals(),
        getDealForecast(),
        getAllCompanies(),
      ]);

      if (requestId !== requestIdRef.current) return;

      setStages(stageList);

      if (groupedResult.status === 'fulfilled') {
        setGroups(mergeStagesWithGroups(stageList, groupedResult.value));
      } else {
        if (mode === 'initial') {
          setGroups(stageList.map(createEmptyGroup));
        }
        setErrorMessage('Could not load deals. Check your connection to the server.');
      }

      if (forecastResult.status === 'fulfilled') {
        setForecast(forecastResult.value);
      } else {
        setErrorMessage(
          (previous) =>
            previous ?? 'The board loaded, but pipeline metrics could not be calculated.'
        );
      }

      if (companiesResult.status === 'fulfilled') {
        setCompanies(companiesResult.value);
      } else {
        setErrorMessage(
          (previous) => previous ?? 'Could not load companies for the deal form.'
        );
      }
    } catch {
      if (requestId === requestIdRef.current) {
        setErrorMessage('Could not load the sales pipeline. Check your connection to the server.');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData('initial');

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadData]);

  const refreshForecast = useCallback(async () => {
    try {
      const data = await getDealForecast();
      setForecast(data);
    } catch {
      setErrorMessage('Could not refresh pipeline metrics.');
    }
  }, []);

  const handleMoveDeal = useCallback(
    async (dealId: string, targetStageId: string) => {
      if (movingDealRef.current) return;

      const sourceGroup = groups.find((group) =>
        group.deals.some((deal) => deal.id === dealId)
      );
      if (!sourceGroup || sourceGroup.id === targetStageId) return;

      const snapshot = groups;
      movingDealRef.current = dealId;
      setMovingDealId(dealId);
      setGroups(moveDealBetweenGroups(groups, dealId, targetStageId));

      try {
        const updatedDeal = await moveDeal(dealId, targetStageId);
        setGroups((currentGroups) => applyServerDeal(currentGroups, updatedDeal));
        await refreshForecast();
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setGroups(snapshot);
        setErrorMessage(
          error.response?.data?.message ||
            'Could not move the deal. Its previous stage was restored.'
        );
      } finally {
        movingDealRef.current = null;
        setMovingDealId(null);
      }
    },
    [groups, refreshForecast]
  );

  const handleSaveDeal = async (data: DealFormData) => {
    if (selectedDeal) {
      await updateDeal(selectedDeal.id, data);
    } else {
      await createDeal(data);
    }

    await loadData('refresh');
  };

  const handleDeleteDeal = async (dealId: string) => {
    const deal = groups.flatMap((group) => group.deals).find((item) => item.id === dealId);
    const confirmed = window.confirm(
      `Delete the deal "${deal?.title ?? 'selected'}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await deleteDeal(dealId);
      setGroups((currentGroups) => removeDealFromGroups(currentGroups, dealId));
      await refreshForecast();
    } catch {
      setErrorMessage('Could not delete the deal. Try again.');
    }
  };

  const handleOpenNew = () => {
    setSelectedDeal(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Sales Pipeline</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            View your sales funnel by stage and update each deal's progress with drag and drop.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData('refresh')}
            disabled={isLoading || isRefreshing}
            title="Reload data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="primary" size="md" onClick={handleOpenNew}>
            <Plus className="h-4 w-4" />
            <span>New Deal</span>
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss notice"
            className="ml-4 font-bold text-rose-500 hover:text-rose-700"
          >
            ✕
          </button>
        </div>
      )}

      <DealForecastWidget forecast={forecast} isLoading={isLoading && !forecast} />

      <KanbanBoard
        groups={groups}
        isLoading={isLoading}
        movingDealId={movingDealId}
        onEditDeal={handleOpenEdit}
        onDeleteDeal={handleDeleteDeal}
        onMoveDeal={handleMoveDeal}
        onReload={() => loadData(groups.length === 0 ? 'initial' : 'refresh')}
      />

      <DealModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveDeal}
        initialData={selectedDeal}
        stages={stages}
        companies={companies}
      />
    </div>
  );
};

export default DealsPage;
