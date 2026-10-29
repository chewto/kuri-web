import api from './api';
import { FinanceSummary } from '../types/financeSummary';

export const getFinanceSummary = async (): Promise<FinanceSummary> => {
  const response = await api.get<FinanceSummary>('/api/finance/summary');
  return response.data;
};
