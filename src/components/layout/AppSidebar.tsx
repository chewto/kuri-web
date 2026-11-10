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
  BarChart3,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';

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
      title: 'CRM & SALES',
      items: [
        { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { name: 'Contacts', to: '/contacts', icon: Users },
        { name: 'Companies', to: '/companies', icon: Building2 },
        { name: 'Deals', to: '/deals', icon: TrendingUp },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Analytics & Profitability', to: '/analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'FINANCE & OPEX',
      items: [
        { name: 'Financial Overview', to: '/finance/summary', icon: DollarSign },
        { name: 'Subscriptions / SaaS', to: '/subscriptions', icon: Repeat },
        { name: 'Transactions', to: '/transactions', icon: CreditCard },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Team & Roles', to: '/team', icon: ShieldCheck },
        { name: 'Workspace Settings', to: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 text-slate-300 select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
        <BrandLogo size="sm" />
        <div>
          <h1 className="text-sm font-bold text-white tracking-wide">Kuri</h1>
          <p className="text-[10px] text-emerald-400 font-medium uppercase tracking-wider">B2B CRM Suite</p>
        </div>
      </div>

      {/* Module Navigation */}
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
        <span>Kuri • B2B Suite</span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/40">
          v0.1
        </span>
      </div>
    </aside>
  );
};
