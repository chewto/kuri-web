import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterTenantPage } from './pages/RegisterTenantPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { ContactsPage } from './pages/ContactsPage';
import { ContactDetailPage } from './pages/ContactDetailPage';
import { FinanceSummaryPage } from './pages/FinanceSummaryPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { DealsPage } from './pages/DealsPage';
import { TeamPage } from './pages/TeamPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TenantSettingsPage } from './pages/TenantSettingsPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public sign-in and registration routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterTenantPage />} />

      {/* JWT-protected routes rendered inside the application shell */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* CRM modules */}
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/deals" element={<DealsPage />} />

          {/* Analytics and profitability */}
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* Finance and OPEX modules */}
          <Route path="/finance/summary" element={<FinanceSummaryPage />} />
          <Route path="/finance/overview" element={<Navigate to="/finance/summary" replace />} />

          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/finance/subscriptions" element={<Navigate to="/subscriptions" replace />} />

          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/finance/transactions" element={<Navigate to="/transactions" replace />} />

          {/* Administration modules */}
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<TenantSettingsPage />} />

          {/* Compatibility redirects for legacy paths */}
          <Route path="/settings/team" element={<Navigate to="/team" replace />} />
          <Route path="/settings/tenant" element={<Navigate to="/settings" replace />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
export default App;
