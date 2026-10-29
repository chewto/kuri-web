export type DealStatus = 'open' | 'won' | 'lost';

export interface Deal {
  id: string;
  tenant_id: string;
  company_id: string;
  company_name?: string | null;
  contact_id?: string | null;
  contact_name?: string | null;
  stage_id: string;
  stage_name?: string | null;
  stage_order?: number | null;
  stage_probability?: number | null;
  title: string;
  value: number;
  expected_close_date?: string | null;
  status: DealStatus;
  created_at?: string | null;
}

export interface DealFormData {
  title: string;
  company_id: string;
  stage_id: string;
  contact_id?: string | null;
  value: number;
  expected_close_date?: string | null;
  status: DealStatus;
}

export interface StageDealsGroup {
  id: string;
  tenant_id: string;
  name: string;
  order: number;
  probability: number;
  created_at?: string;
  deals: Deal[];
  total_deals: number;
  total_value: number;
}

export interface DealForecastStageItem {
  stage_id: string;
  stage_name: string;
  order: number;
  probability: number;
  deals_count: number;
  total_value: number;
  weighted_value: number;
}

export interface DealForecast {
  total_open_value: number;
  total_won_month: number;
  weighted_pipeline_value: number;
  counts: {
    open: number;
    won: number;
    lost: number;
    total: number;
  };
  period: {
    year: number;
    month: number;
    start_date: string;
    end_date: string;
  };
  stage_breakdown: DealForecastStageItem[];
}
