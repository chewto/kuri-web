export type UserRole = 'SuperAdmin' | 'TenantAdmin' | 'User' | 'Auditor';

export interface Tenant {
  id: string;
  name: string;
  plan: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  tenant_id: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginResponse {
  message: string;
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface RegisterTenantPayload {
  tenant_name: string;
  email: string;
  password: string;
  plan?: string;
}

export interface RegisterTenantResponse {
  message: string;
  access_token: string;
  refresh_token?: string;
  tenant: Tenant;
  user: User;
}

export interface AuthMeResponse {
  user: User;
  tenant: Tenant;
}
