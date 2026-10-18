import { Company } from './company';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone?: string | null;
  position?: string | null;
  company_id?: string | null;
  company?: Company | null;
  created_at: string;
  updated_at?: string;
}

export interface ContactFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  company_id?: string;
}
