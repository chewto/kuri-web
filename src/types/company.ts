export interface Company {
  id: string;
  name: string;
  tax_id?: string | null;
  industry?: string | null;
  website?: string | null;
  phone?: string | null;
  address?: string | null;
  created_at: string;
  updated_at?: string;
  contacts_count?: number;
}

export interface CompanyFormData {
  name: string;
  tax_id?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
}
