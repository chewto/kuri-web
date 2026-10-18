import api from './api';
import { Company, CompanyFormData } from '../types/company';
import { Paginated } from '../types/pagination';

export interface GetCompaniesParams {
  search?: string;
  industry?: string;
  page?: number;
  per_page?: number;
}

const normalizePaginated = <T>(data: any): Paginated<T> => {
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, per_page: data.length || 1, pages: 1 };
  }
  const items: T[] = data.items || data.companies || data.data || [];
  return {
    items,
    total: data.total ?? items.length,
    page: data.page ?? 1,
    per_page: (data.per_page ?? items.length) || 1,
    pages: data.pages ?? (items.length > 0 ? 1 : 0),
  };
};

export const getCompaniesPage = async (params?: GetCompaniesParams): Promise<Paginated<Company>> => {
  const response = await api.get('/api/companies', { params });
  return normalizePaginated<Company>(response.data);
};

export const getAllCompanies = async (search?: string): Promise<Company[]> => {
  const response = await api.get('/api/companies', {
    params: { all: 1, search: search || undefined },
  });
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.items || response.data.companies || response.data.data || [];
};

export const getCompanyById = async (id: string): Promise<Company> => {
  const response = await api.get(`/api/companies/${id}`);
  return response.data.company || response.data.data || response.data;
};

export const createCompany = async (data: CompanyFormData): Promise<Company> => {
  const response = await api.post('/api/companies', data);
  return response.data.company || response.data.data || response.data;
};

export const updateCompany = async (id: string, data: Partial<CompanyFormData>): Promise<Company> => {
  const response = await api.put(`/api/companies/${id}`, data);
  return response.data.company || response.data.data || response.data;
};

export const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/api/companies/${id}`);
};
