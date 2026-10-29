export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  tenant_id: string;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  company_id: string | null;
  company_name: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  created_at: string;
}

export interface TransactionFormData {
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  category_id?: string | null;
  company_id?: string | null;
}

export interface TransactionFilterParams {
  type?: TransactionType | '';
  start_date?: string;
  end_date?: string;
  category_id?: string;
  company_id?: string;
  page?: number;
  per_page?: number;
  all?: boolean;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}
