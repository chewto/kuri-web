import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, LogOut, ChevronDown, UserCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, tenant, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SuperAdmin':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            Super Admin
          </span>
        );
      case 'TenantAdmin':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Tenant Admin
          </span>
        );
      case 'Auditor':
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
            Auditor
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            User
          </span>
        );
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Active workspace */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
          <Building2 className="h-4 w-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 leading-tight">
              {tenant?.name || 'Active workspace'}
            </h2>
            {tenant?.plan && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Plan {tenant.plan}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 font-mono">
            Workspace ID: {tenant?.id?.substring(0, 8) || 'N/A'}...
          </p>
        </div>
      </div>

      {/* User Profile and Options */}
      <div className="flex items-center gap-4">
        {getRoleBadge(user?.role)}

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          >
            <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.email}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-emerald-600" /> Active session
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
