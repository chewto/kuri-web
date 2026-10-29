export type BillingCycle = 'monthly' | 'yearly' | 'quarterly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  tenant_id: string;
  company_id: string | null;
  company_name: string | null;
  category_id: string | null;
  category_name: string | null;
  category_color: string | null;
  name: string;
  cost: number;
  billing_cycle: BillingCycle;
  next_billing_date: string; // YYYY-MM-DD
  status: SubscriptionStatus;
  created_at: string;
}

export interface SubscriptionFormData {
  name: string;
  cost: number;
  billing_cycle: BillingCycle;
  next_billing_date: string;
  status: SubscriptionStatus;
  company_id?: string | null;
  category_id?: string | null;
}

export interface SubscriptionFilterParams {
  status?: SubscriptionStatus | '';
  category_id?: string;
  company_id?: string;
}
