import api from './api';
import { ProfitabilitySummary } from '../types/analytics';

export interface ProfitabilityParams {
  year?: number;
  month?: number;
}

export const getProfitabilitySummary = async (
  params?: ProfitabilityParams
): Promise<ProfitabilitySummary> => {
  const response = await api.get<ProfitabilitySummary>('/api/analytics/profitability', {
    params,
  });
  return response.data;
};
