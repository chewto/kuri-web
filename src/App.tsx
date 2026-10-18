import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterTenantPage } from './pages/RegisterTenantPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { ContactsPage } from './pages/ContactsPage';
import { ContactDetailPage } from './pages/ContactDetailPage';
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
          
          {/* Módulos de Core CRM (Sprint 1) */}
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/contacts/:id" element={<ContactDetailPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route
            path="/deals"
            element={
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Pipeline de Oportunidades (Deals)</h2>
                <p className="text-xs text-slate-500 mt-1">
                  En construcción para Sprint 2. Embudo visual y estimación de ventas.
                </p>
              </div>
            }
          />

          {/* Módulos de Finanzas & OPEX */}
          <Route
            path="/finance/overview"
            element={
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Finanzas - Visión General</h2>
                <p className="text-xs text-slate-500 mt-1">
                  En construcción. Gráficas de ingresos, costes fijos y margen neto.
                </p>
              </div>
            }
          />
          <Route
            path="/finance/subscriptions"
            element={
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Suscripciones & SaaS (OPEX)</h2>
                <p className="text-xs text-slate-500 mt-1">
                  En construcción. Auditoría y seguimiento de recurrencias de software contratado.
                </p>
              </div>
            }
          />
          <Route
            path="/finance/transactions"
            element={
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Transacciones</h2>
                <p className="text-xs text-slate-500 mt-1">
                  En construcción. Registro y conciliación de movimientos monetarios.
                </p>
              </div>
            }
          />

          {/* Módulos de Sistema */}
          <Route
            path="/settings/team"
            element={
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Equipo & Roles</h2>
                <p className="text-xs text-slate-500 mt-1">
                  En construcción. Gestión de usuarios y permisos basados en roles.
                </p>
              </div>
            }
          />
          <Route
            path="/settings/tenant"
            element={
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Configuración del Tenant</h2>
                <p className="text-xs text-slate-500 mt-1">
                  En construcción. Parámetros de la organización, marca y facturación.
                </p>
              </div>
            }
          />
        </Route>
      </Route>

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
export default App;
