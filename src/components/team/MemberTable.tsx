import React from 'react';
import { Lock, ShieldCheck, Users, UserX } from 'lucide-react';
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  Role,
  UserMember,
} from '../../types/team';
import { formatDate } from '../../utils/formatters';
import { Button } from '../common/Button';
import { RoleBadge } from './RoleBadge';

interface MemberTableProps {
  members: UserMember[];
  isLoading: boolean;
  currentUserId: string | null;
  canManage: boolean;
  busyMemberId: string | null;
  onRoleChange: (member: UserMember, role: Role) => void;
  onDeactivate: (member: UserMember) => void;
}

const getDisplayName = (email: string): string => {
  const localPart = email.split('@')[0] || email;
  const words = localPart.split(/[._-]+/).filter(Boolean);

  if (words.length === 0) return email;

  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getInitials = (name: string): string => {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

  return initials || 'U';
};

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  isLoading,
  currentUserId,
  canManage,
  busyMemberId,
  onRoleChange,
  onDeactivate,
}) => {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-5 w-1/3 rounded bg-slate-100" />
          {[1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center gap-4">
              <div className="h-9 w-9 rounded-lg bg-slate-100" />
              <div className="h-4 flex-1 rounded bg-slate-100" />
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">
          No hay miembros registrados
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
          Invita al primer miembro del equipo para asignarle un rol dentro de la organización.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3.5">Usuario</th>
              <th className="px-4 py-3.5">Rol actual</th>
              <th className="px-4 py-3.5">Estado</th>
              <th className="px-4 py-3.5">Fecha de registro</th>
              {canManage && <th className="px-4 py-3.5 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => {
              const isSelf = member.id === currentUserId;
              const isSuperAdmin = member.role === 'SuperAdmin';
              const isBusy = busyMemberId === member.id;
              const canEditRole =
                canManage && !isSelf && !isSuperAdmin && member.is_active;
              const displayName = getDisplayName(member.email);

              return (
                <tr
                  key={member.id}
                  className={`transition-colors hover:bg-slate-50/60 ${
                    isSelf ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-100 bg-emerald-50 text-xs font-bold text-emerald-700">
                        {getInitials(displayName)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-slate-800">
                            {displayName}
                          </p>
                          {isSelf && (
                            <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Tú
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    <div className="flex flex-col items-start gap-1.5">
                      <RoleBadge role={member.role} />
                      {canEditRole && (
                        <select
                          value={member.role}
                          onChange={(event) =>
                            onRoleChange(member, event.target.value as Role)
                          }
                          disabled={isBusy}
                          aria-label={`Cambiar rol de ${member.email}`}
                          title="Cambiar rol del miembro"
                          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition-colors focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                        >
                          {ASSIGNABLE_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      )}
                      {canManage && (isSelf || isSuperAdmin) && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                          {isSelf ? (
                            <>
                              <Lock className="h-3 w-3" /> Rol protegido
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3 w-3" /> Solo lectura
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {member.is_active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        Inactivo
                      </span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">
                    {formatDate(member.created_at) || '—'}
                  </td>

                  {canManage && (
                    <td className="px-4 py-3.5 text-right">
                      {isSelf ? (
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center text-slate-300"
                          title="No puedes desactivar tu propia cuenta"
                        >
                          <Lock className="h-4 w-4" />
                        </span>
                      ) : isSuperAdmin ? (
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center text-slate-300"
                          title="No está permitido desactivar a un SuperAdmin"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeactivate(member)}
                          disabled={!member.is_active || isBusy}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600"
                          title={
                            member.is_active
                              ? 'Desactivar miembro'
                              : 'El miembro ya está inactivo'
                          }
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MemberTable;
