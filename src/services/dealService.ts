import api from './api';
import { Deal, DealFormData, DealStatus, StageDealsGroup, DealForecast } from '../types/deal';
import { Paginated } from '../types/pagination';

export interface GetDealsParams {
  stage_id?: string;
  status?: DealStatus;
  company_id?: string;
  contact_id?: string;
  search?: string;
  grouped?: boolean | number | string;
  all?: boolean | number | string;
  page?: number;
  per_page?: number;
}

export interface GetForecastParams {
  year?: number;
  month?: number;
}

export const getDeals = async (params?: GetDealsParams): Promise<Paginated<Deal>> => {
  const response = await api.get('/api/deals', { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, per_page: data.length || 1, pages: 1 };
  }
  const items: Deal[] = data.items || data.deals || data.data || [];
  return {
    items,
    total: data.total ?? items.length,
    page: data.page ?? 1,
    per_page: (data.per_page ?? items.length) || 1,
    pages: data.pages ?? (items.length > 0 ? 1 : 0),
  };
};

export const getGroupedDeals = async (params?: {
  status?: DealStatus;
  company_id?: string;
  search?: string;
}): Promise<StageDealsGroup[]> => {
  const response = await api.get('/api/deals', {
    params: {
      grouped: true,
      ...params,
    },
  });
  return response.data.stages || [];
};

export const getDealById = async (id: string): Promise<Deal> => {
  const response = await api.get(`/api/deals/${id}`);
  return response.data.deal || response.data;
};

export const createDeal = async (data: DealFormData): Promise<Deal> => {
  const response = await api.post('/api/deals', data);
  return response.data.deal || response.data;
};

export const updateDeal = async (id: string, data: Partial<DealFormData>): Promise<Deal> => {
  const response = await api.put(`/api/deals/${id}`, data);
  return response.data.deal || response.data;
};

export const moveDeal = async (
  id: string,
  stage_id: string,
  status?: DealStatus
): Promise<Deal> => {
  const payload: { stage_id: string; status?: DealStatus } = { stage_id };
  if (status) {
    payload.status = status;
  }
  const response = await api.patch(`/api/deals/${id}/move`, payload);
  return response.data.deal || response.data;
};

export const deleteDeal = async (id: string): Promise<void> => {
  await api.delete(`/api/deals/${id}`);
};

export const getDealForecast = async (params?: GetForecastParams): Promise<DealForecast> => {
  const response = await api.get('/api/deals/forecast', { params });
  return response.data;
};
