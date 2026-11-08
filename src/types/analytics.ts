export interface ProfitabilityPeriod {
  year: number;
  month: number;
  start_date: string;
  end_date: string;
}

export interface RevenueMetrics {
  deals_won_total: number;
  deals_won_count: number;
}

export interface OpexMetrics {
  total: number;
  subscriptions_monthly: number;
  transactions_expenses: number;
  active_subscriptions_count: number;
}

export interface ProfitabilityMetrics {
  net_margin: number;
  margin_percentage: number;
}

export interface BurnRateMetrics {
  monthly: number;
  annual: number;
}

export interface ExpensesByCategory {
  category_id: string | null;
  category_name: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface PipelineStatusItem {
  count: number;
  total_value: number;
  percentage: number;
}

export interface PipelineDistribution {
  open: PipelineStatusItem;
  won: PipelineStatusItem;
  lost: PipelineStatusItem;
  total: PipelineStatusItem;
}

export interface ProfitabilitySummary {
  period: ProfitabilityPeriod;
  revenue: RevenueMetrics;
  opex: OpexMetrics;
  profitability: ProfitabilityMetrics;
  burn_rate: BurnRateMetrics;
  expense_categories: ExpensesByCategory[];
  pipeline_status: PipelineDistribution;
}
