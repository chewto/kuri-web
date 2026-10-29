import api from './api';
import {
  Subscription,
  SubscriptionFormData,
  SubscriptionFilterParams,
} from '../types/subscription';

export const getSubscriptions = async (
  params?: SubscriptionFilterParams
): Promise<Subscription[]> => {
  const queryParams: Record<string, string> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.category_id) queryParams.category_id = params.category_id;
  if (params?.company_id) queryParams.company_id = params.company_id;

  const response = await api.get<Subscription[]>('/api/finance/subscriptions', {
    params: queryParams,
  });
  return response.data;
};

export const createSubscription = async (
  data: SubscriptionFormData
): Promise<{ message: string; subscription: Subscription }> => {
  const response = await api.post<{ message: string; subscription: Subscription }>(
    '/api/finance/subscriptions',
    data
  );
  return response.data;
};

export const updateSubscription = async (
  id: string,
  data: Partial<SubscriptionFormData>
): Promise<{ message: string; subscription: Subscription }> => {
  const response = await api.put<{ message: string; subscription: Subscription }>(
    `/api/finance/subscriptions/${id}`,
    data
  );
  return response.data;
};

export const deleteSubscription = async (
  id: string
): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(
    `/api/finance/subscriptions/${id}`
  );
  return response.data;
};
