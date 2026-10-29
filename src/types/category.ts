export interface Category {
  id: string;
  tenant_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface CategoryFormData {
  name: string;
  color?: string;
}
