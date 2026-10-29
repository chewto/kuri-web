import api from './api';
import { Stage, StageFormData } from '../types/stage';

export const getStages = async (): Promise<Stage[]> => {
  const response = await api.get('/api/deals/stages');
  return response.data;
};

export const createStage = async (data: StageFormData): Promise<Stage> => {
  const response = await api.post('/api/deals/stages', data);
  return response.data.stage || response.data;
};

export const updateStage = async (id: string, data: Partial<StageFormData>): Promise<Stage> => {
  const response = await api.put(`/api/deals/stages/${id}`, data);
  return response.data.stage || response.data;
};

export const deleteStage = async (id: string): Promise<void> => {
  await api.delete(`/api/deals/stages/${id}`);
};
