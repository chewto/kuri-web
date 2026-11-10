import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import {
  AuthState,
  User,
  Tenant,
  LoginResponse,
  RegisterTenantPayload,
  RegisterTenantResponse,
  AuthMeResponse,
} from '../types/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  registerTenant: (payload: RegisterTenantPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setUser(null);
      setTenant(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get<AuthMeResponse>('/api/auth/me');
      setUser(response.data.user);
      setTenant(response.data.tenant);
      setToken(storedToken);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setTenant(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', {
        email,
        password,
      });

      const { access_token, refresh_token, user: loggedUser } = response.data;
      localStorage.setItem('token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      setToken(access_token);
      setUser(loggedUser);

      // Sync full workspace data by querying /me
      try {
        const meResponse = await api.get<AuthMeResponse>('/api/auth/me');
        setUser(meResponse.data.user);
        setTenant(meResponse.data.tenant);
      } catch {
        // If /me fails, keep the previous user
      }
    } finally {
      setIsLoading(false);
    }
  };

  const registerTenant = async (payload: RegisterTenantPayload): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await api.post<RegisterTenantResponse>('/api/auth/register-tenant', payload);
      const { access_token, refresh_token, tenant: newTenant, user: adminUser } = response.data;

      localStorage.setItem('token', access_token);
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token);
      }
      setToken(access_token);
      setUser(adminUser);
      setTenant(newTenant);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setTenant(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        tenant_id: user?.tenant_id || tenant?.id || null,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        registerTenant,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
