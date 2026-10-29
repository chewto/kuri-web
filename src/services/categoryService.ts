import api from './api';
import { Category, CategoryFormData } from '../types/category';

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/api/finance/categories');
  return response.data;
};

export const createCategory = async (data: CategoryFormData): Promise<{ message: string; category: Category }> => {
  const response = await api.post<{ message: string; category: Category }>('/api/finance/categories', data);
  return response.data;
};
