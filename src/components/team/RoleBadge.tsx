import React from 'react';
import { Crown, Eye, ShieldCheck, UserRound } from 'lucide-react';
import { MemberRole, ROLE_LABELS } from '../../types/team';

interface RoleBadgeProps {
  role: MemberRole;
  className?: string;
}

const roleStyles: Record<
  MemberRole,
  { badge: string; icon: React.ComponentType<{ className?: string }> }
> = {
  TenantAdmin: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck,
  },
  User: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: UserRound,
  },
  Auditor: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Eye,
  },
  SuperAdmin: {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Crown,
  },
};

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const config = roleStyles[role] || roleStyles.User;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${config.badge} ${className}`}
    >
      <Icon className="h-3 w-3" />
      {ROLE_LABELS[role] || role}
    </span>
  );
};

export default RoleBadge;
