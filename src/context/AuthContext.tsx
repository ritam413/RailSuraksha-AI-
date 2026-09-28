'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { AppRole, UserProfile } from '@/types/apiContracts';
import { OFFICER_PERSONAS, isValidAppRole } from '@/lib/rbac';

interface AuthContextType {
  user: UserProfile | null;
  role: AppRole;
  isAuthenticated: boolean;
  isLoaded: boolean;
  switchRole: (role: AppRole) => void;
  loginByEmployeeId: (employeeId: string) => boolean;
  logout: () => void;
}

const DEFAULT_AUTH_CONTEXT: AuthContextType = {
  user: OFFICER_PERSONAS[5],
  role: 'ADMIN',
  isAuthenticated: true,
  isLoaded: true,
  switchRole: () => {},
  loginByEmployeeId: () => false,
  logout: () => {}
};

const AuthContext = createContext<AuthContextType>(DEFAULT_AUTH_CONTEXT);

const STORAGE_KEY = 'railsuraksha_auth_role';

function subscribeToRole(callback: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }
  window.addEventListener('storage', callback);
  window.addEventListener('railsuraksha_auth_change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('railsuraksha_auth_change', callback);
  };
}

function getRoleSnapshot(): AppRole {
  if (typeof window === 'undefined') return 'ADMIN';
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    if (isValidAppRole(item)) return item;
  } catch {}
  return 'ADMIN';
}

function getServerRoleSnapshot(): AppRole {
  return 'ADMIN';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const storedRole = useSyncExternalStore(subscribeToRole, getRoleSnapshot, getServerRoleSnapshot);
  const [isLoaded, setIsLoaded] = useState<boolean>(true);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const persona = OFFICER_PERSONAS.find(p => p.role === storedRole) || OFFICER_PERSONAS[5];

  const switchRole = useCallback((newRole: AppRole) => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, newRole);
        window.dispatchEvent(new Event('railsuraksha_auth_change'));
      } catch {}
    }
  }, []);

  const loginByEmployeeId = useCallback((employeeId: string): boolean => {
    const target = OFFICER_PERSONAS.find(p => p.employeeId.toLowerCase() === employeeId.toLowerCase().trim());
    if (target) {
      switchRole(target.role);
      return true;
    }
    return false;
  }, [switchRole]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('railsuraksha_auth_change'));
      } catch {}
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: persona,
        role: storedRole,
        isAuthenticated: !!persona,
        isLoaded,
        switchRole,
        loginByEmployeeId,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
