import api from './api';
import {
  Transaction,
  TransactionFormData,
  TransactionFilterParams,
  TransactionListResponse,
} from '../types/transaction';

export const getTransactions = async (
  params?: TransactionFilterParams
): Promise<TransactionListResponse> => {
  const queryParams: Record<string, string | number | boolean> = {};

  if (params?.type) queryParams.type = params.type;
  if (params?.start_date) queryParams.start_date = params.start_date;
  if (params?.end_date) queryParams.end_date = params.end_date;
  if (params?.category_id) queryParams.category_id = params.category_id;
  if (params?.company_id) queryParams.company_id = params.company_id;
  if (params?.page) queryParams.page = params.page;
  if (params?.per_page) queryParams.per_page = params.per_page;
  if (params?.all) queryParams.all = params.all;

  const response = await api.get<TransactionListResponse>(
    '/api/finance/transactions',
    { params: queryParams }
  );
  return response.data;
};

export const createTransaction = async (
  data: TransactionFormData
): Promise<{ message: string; transaction: Transaction }> => {
  const response = await api.post<{ message: string; transaction: Transaction }>(
    '/api/finance/transactions',
    data
  );
  return response.data;
};

export const deleteTransaction = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/api/finance/transactions/${id}`
  );
  return response.data;
};
