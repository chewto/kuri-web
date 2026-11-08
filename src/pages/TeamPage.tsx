import React, { useCallback, useEffect, useState } from 'react';
import { Info, Plus, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  InviteMemberFormData,
  ROLE_LABELS,
  Role,
  UserMember,
} from '../types/team';
import {
  deleteMember,
  getTeamMembers,
  inviteMember,
  updateMemberRole,
} from '../services/teamService';
import { Button } from '../components/common/Button';
import { MemberTable } from '../components/team/MemberTable';
import { InviteMemberModal } from '../components/team/InviteMemberModal';

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as { response?: { data?: { message?: string } } };
  return apiError.response?.data?.message || fallback;
};

export const TeamPage: React.FC = () => {
  const { user } = useAuth();
  const [members, setMembers] = useState<UserMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [busyMemberId, setBusyMemberId] = useState<string | null>(null);

  const canManage = user?.role === 'TenantAdmin';
  const activeMembers = members.filter((member) => member.is_active).length;

  const fetchMembers = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);

    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (error: unknown) {
      setErrorNotification(
        getApiErrorMessage(
          error,
          'No se pudo cargar el equipo. Verifica la conexión con el servidor.'
        )
      );
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setErrorNotification(null);
    void fetchMembers(true);
  }, [fetchMembers]);

  const handleRefresh = () => {
    setErrorNotification(null);
    void fetchMembers(true);
  };

  const handleInvite = async (data: InviteMemberFormData) => {
    setErrorNotification(null);
    await inviteMember(data);
    await fetchMembers();
  };

  const handleRoleChange = async (member: UserMember, role: Role) => {
    if (member.role === role) return;

    setBusyMemberId(member.id);
    setErrorNotification(null);

    try {
      await updateMemberRole(member.id, role);
      await fetchMembers();
    } catch (error: unknown) {
      setErrorNotification(
        getApiErrorMessage(error, 'No se pudo actualizar el rol del miembro.')
      );
    } finally {
      setBusyMemberId(null);
    }
  };

  const handleDeactivate = async (member: UserMember) => {
    const confirmed = window.confirm(
      `¿Desactivar la cuenta de "${member.email}"? El miembro perderá el acceso a la organización, pero su historial se conservará.`
    );
    if (!confirmed) return;

    setBusyMemberId(member.id);
    setErrorNotification(null);

    try {
      await deleteMember(member.id);
      await fetchMembers();
    } catch (error: unknown) {
      setErrorNotification(
        getApiErrorMessage(error, 'No se pudo desactivar al miembro del equipo.')
      );
    } finally {
      setBusyMemberId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900">Equipo & Roles</h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Administra los miembros de la organización, sus permisos y el estado de sus
            cuentas.
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <Users className="h-3.5 w-3.5" />
            <span>
              <strong className="text-slate-700">{members.length}</strong> miembros ·{' '}
              <strong className="text-emerald-700">{activeMembers}</strong> activos
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            title="Recargar equipo"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {canManage && (
            <Button variant="primary" size="md" onClick={() => setInviteModalOpen(true)}>
              <Plus className="h-4 w-4" />
              <span>Invitar Miembro</span>
            </Button>
          )}
        </div>
      </div>

      {errorNotification && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <span>{errorNotification}</span>
          <button
            type="button"
            onClick={() => setErrorNotification(null)}
            className="ml-4 font-bold text-rose-500 hover:text-rose-700"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      {!canManage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-800">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">
              Tu rol es {user ? ROLE_LABELS[user.role] : 'Usuario'}.
            </p>
            <p className="mt-0.5 text-sky-700">
              Solo un Tenant Admin puede invitar miembros, cambiar roles o desactivar
              cuentas. Puedes consultar el equipo en modo lectura.
            </p>
          </div>
        </div>
      )}

      <MemberTable
        members={members}
        isLoading={isLoading}
        currentUserId={user?.id ?? null}
        canManage={canManage}
        busyMemberId={busyMemberId}
        onRoleChange={handleRoleChange}
        onDeactivate={handleDeactivate}
      />

      {canManage && (
        <InviteMemberModal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          onSubmit={handleInvite}
        />
      )}
    </div>
  );
};

export default TeamPage;
