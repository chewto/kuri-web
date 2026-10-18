import api from './api';
import { ActivityLog, ActivityFormData } from '../types/activity';

export const getContactActivities = async (contactId: string): Promise<ActivityLog[]> => {
  const response = await api.get(`/api/contacts/${contactId}/activities`);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.items || response.data.activities || response.data.data || [];
};

export const createActivity = async (
  contactId: string,
  data: ActivityFormData
): Promise<ActivityLog> => {
  const response = await api.post(`/api/contacts/${contactId}/activities`, data);
  return response.data.activity || response.data.data || response.data;
};
