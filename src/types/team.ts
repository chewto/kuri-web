export type Role = 'TenantAdmin' | 'User' | 'Auditor';

export type MemberRole = Role | 'SuperAdmin';

export interface UserMember {
  id: string;
  tenant_id: string;
  email: string;
  role: MemberRole;
  is_active: boolean;
  created_at?: string | null;
}

export interface InviteMemberFormData {
  email: string;
  password: string;
  role: Role;
}

export const ASSIGNABLE_ROLES: Role[] = ['TenantAdmin', 'User', 'Auditor'];

export const ROLE_LABELS: Record<MemberRole, string> = {
  TenantAdmin: 'Tenant Admin',
  User: 'User',
  Auditor: 'Auditor',
  SuperAdmin: 'Super Admin',
};
