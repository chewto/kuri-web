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
      {/* Rutas Públicas de Acceso y Registro */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterTenantPage />} />

      {/* Rutas Protegidas por JWT y Layout de la Suite */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          
          {/* Módulos de Core CRM (Sprints 1 y 3) */}
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/deals" element={<DealsPage />} />

          {/* Analítica & Rentabilidad (Sprint 4) */}
          <Route path="/analytics" element={<AnalyticsPage />} />

          {/* Módulos de Finanzas & OPEX (Sprint 2) */}
          <Route path="/finance/summary" element={<FinanceSummaryPage />} />
          <Route path="/finance/overview" element={<Navigate to="/finance/summary" replace />} />
          
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/finance/subscriptions" element={<Navigate to="/subscriptions" replace />} />
          
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/finance/transactions" element={<Navigate to="/transactions" replace />} />

          {/* Módulos de Sistema y Administración (Sprint 4) */}
          <Route path="/team" element={<TeamPage />} />
          <Route path="/settings" element={<TenantSettingsPage />} />

          {/* Compatibilidad con rutas anteriores */}
          <Route path="/settings/team" element={<Navigate to="/team" replace />} />
          <Route path="/settings/tenant" element={<Navigate to="/settings" replace />} />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
export default App;
