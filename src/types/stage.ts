export interface Stage {
  id: string;
  tenant_id: string;
  name: string;
  order: number;
  probability: number;
  created_at?: string;
}

export interface StageFormData {
  name: string;
  order?: number;
  probability?: number;
  init_defaults?: boolean;
}
