import api from './api';
import { Contact, ContactFormData } from '../types/contact';
import { Paginated } from '../types/pagination';

export interface GetContactsParams {
  search?: string;
  company_id?: string;
  page?: number;
  per_page?: number;
}

export const getContacts = async (params?: GetContactsParams): Promise<Paginated<Contact>> => {
  const response = await api.get('/api/contacts', { params });
  const data = response.data;
  if (Array.isArray(data)) {
    return { items: data, total: data.length, page: 1, per_page: data.length || 1, pages: 1 };
  }
  const items: Contact[] = data.items || data.contacts || data.data || [];
  return {
    items,
    total: data.total ?? items.length,
    page: data.page ?? 1,
    per_page: (data.per_page ?? items.length) || 1,
    pages: data.pages ?? (items.length > 0 ? 1 : 0),
  };
};

export const getContactById = async (id: string): Promise<Contact> => {
  const response = await api.get(`/api/contacts/${id}`);
  return response.data.contact || response.data.data || response.data;
};

export const createContact = async (data: ContactFormData): Promise<Contact> => {
  const response = await api.post('/api/contacts', data);
  return response.data.contact || response.data.data || response.data;
};

export const updateContact = async (id: string, data: Partial<ContactFormData>): Promise<Contact> => {
  const response = await api.put(`/api/contacts/${id}`, data);
  return response.data.contact || response.data.data || response.data;
};

export const deleteContact = async (id: string): Promise<void> => {
  await api.delete(`/api/contacts/${id}`);
};
