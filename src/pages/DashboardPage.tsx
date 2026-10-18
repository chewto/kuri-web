import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, TrendingUp, DollarSign, Building2, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { DashboardStats } from '../types/dashboard';
import { getDashboardStats } from '../services/dashboardService';

export const DashboardPage: React.FC = () => {
  const { user, tenant } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadStats = async () => {
      try {
        const data = await getDashboardStats();
        if (!cancelled) setStats(data);
      } catch {
        if (!cancelled) setStats(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatCount = (value: number | undefined): string => {
    if (loading) return '—';
    return (value ?? 0).toLocaleString('es');
  };

  const formatCurrency = (value: number | undefined): string => {
    if (loading) return '—';
    return `$${(value ?? 0).toFixed(2)}`;
  };

  const metrics = [
    {
      label: 'Contactos Totales',
      value: formatCount(stats?.contacts_total),
      change: 'Conteo en tiempo real',
      icon: Users,
      trend: 'neutral',
    },
    {
      label: 'Empresas Registradas',
      value: formatCount(stats?.companies_total),
      change: 'Conteo en tiempo real',
      icon: Building2,
      trend: 'neutral',
    },
    {
      label: 'Deals en Pipeline',
      value: formatCurrency(stats?.deals_pipeline_value),
      change: 'Sin oportunidades activas',
      icon: TrendingUp,
      trend: 'neutral',
    },
    {
      label: 'MRR Estimado',
      value: formatCurrency(stats?.mrr_estimated),
      change: 'Calculado en tiempo real',
      icon: DollarSign,
      trend: 'neutral',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Banner de Bienvenida */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Workspace Activo
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Tenant: {tenant?.name || 'Cargando...'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Bienvenido al CRM, {user?.email?.split('@')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Comienza gestionando tus contactos corporativos, pipelines de ventas y control de finanzas.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="outline" size="md">
            Importar Datos
          </Button>
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" /> Nuevo Contacto
          </Button>
        </div>
      </div>

      {/* Grid de Métricas Principales */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Resumen General del Negocio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {metrics.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-white p-5 rounded-xl border border-slate-200/70 shadow-sm hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{item.label}</span>
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">
                    {item.value}
                  </div>
                  <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" /> {item.change}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Accesos Rápidos y Estado de Configuración */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Módulos Disponibles (Sprint 0)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" /> Core CRM
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Contactos comerciales, cuentas de empresas y seguimiento de embudo de ventas.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-600" /> Finanzas & OPEX
              </h4>
              <p className="mt-1 text-xs text-slate-500">
                Auditoría de suscripciones recurrentes, costes operativos e ingresos por cliente.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Detalles del Tenant</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Organización:</span>
              <span className="font-semibold text-slate-800">{tenant?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Plan:</span>
              <span className="font-semibold text-emerald-600 uppercase">{tenant?.plan || 'Free'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Rol:</span>
              <span className="font-semibold text-slate-800">{user?.role}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Estado:</span>
              <span className="inline-flex items-center text-emerald-700 font-semibold gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Operativo
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
