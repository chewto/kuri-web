import { Subscription } from './subscription';

export interface UpcomingRenewalsGroup {
  count: number;
  items: Subscription[];
}

export interface CurrentMonthBalance {
  start_date: string;
  end_date: string;
  total_income: number;
  total_expenses: number;
  net_balance: number;
  transactions_count: number;
}

export interface FinanceSummary {
  monthly_expense_mrr: number;
  active_subscriptions_count: number;
  upcoming_renewals: {
    next_7_days: UpcomingRenewalsGroup;
    next_30_days: UpcomingRenewalsGroup;
  };
  current_month_balance: CurrentMonthBalance;
}
