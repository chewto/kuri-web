import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Building2,
  TrendingUp,
  LayoutDashboard,
  DollarSign,
  Repeat,
  CreditCard,
  ShieldCheck,
  Settings,
  Layers,
  BarChart3,
} from 'lucide-react';

interface NavSectionItem {
  name: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavSectionItem[];
}

export const AppSidebar: React.FC = () => {
  const sections: NavSection[] = [
    {
      title: 'CORE CRM',
      items: [
        { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Contactos', to: '/contacts', icon: Users },
        { name: 'Empresas', to: '/companies', icon: Building2 },
        { name: 'Oportunidades (Deals)', to: '/deals', icon: TrendingUp },
      ],
    },
    {
      title: 'ANALÍTICA',
      items: [
        { name: 'Rentabilidad & Analítica', to: '/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'FINANZAS & OPEX',
      items: [
        { name: 'Visión General', to: '/finance/summary', icon: DollarSign },
        { name: 'Suscripciones / SaaS', to: '/subscriptions', icon: Repeat },
        { name: 'Transacciones', to: '/transactions', icon: CreditCard },
      ],
    },
    {
      title: 'SISTEMA',
      items: [
        { name: 'Equipo & Roles', to: '/team', icon: ShieldCheck },
        { name: 'Configuración del Tenant', to: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 text-slate-300 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">CRM CORE B2B</h1>
          <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">Suite Multi-Tenant</p>
        </div>
      </div>

      {/* Navegación por Módulos */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950 font-semibold'
                            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / Status */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
        <span>Sprint 4 • Core Web</span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
          v0.1
        </span>
      </div>
    </aside>
  );
};
