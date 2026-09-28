'use client';

import React from 'react';
import Link from 'next/link';
import { AppRole } from '@/types/apiContracts';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DEFAULT_ROUTE } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  screenName?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  screenName = 'Operational Workspace'
}) => {
  const { role, user, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white border border-[#D0DFEE] shadow-sm rounded-[16px] text-center space-y-4 animate-pulse">
        <div className="w-12 h-12 mx-auto bg-slate-100 rounded-[8px]" />
        <div className="h-4 bg-slate-100 rounded-[4px] max-w-xs mx-auto" />
        <div className="h-3 bg-slate-50 rounded-[4px] max-w-sm mx-auto" />
      </div>
    );
  }

  const isAllowed = allowedRoles.includes(role);

  if (!isAllowed) {
    const defaultRoute = ROLE_DEFAULT_ROUTE[role] || '/login';
    return (
      <div className="max-w-4xl mx-auto my-12 p-8 bg-white border border-[#D0DFEE] shadow-sm rounded-[16px] text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-amber-50 border border-amber-300 rounded-[12px] flex items-center justify-center text-3xl">
          🛡️
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-[4px] uppercase tracking-wider">
            Statutory Access Control (IRPWM Ch 5 / RDSO Cyber Protocol)
          </span>
          <h2 className="text-xl font-bold font-display text-[#0F172A]">
            Access Restricted: {screenName}
          </h2>
          <p className="text-sm text-slate-600 max-w-lg mx-auto">
            Your current authenticated role <strong className="text-slate-900 font-mono">[{user?.designation || role}]</strong> is not authorized to access this operational screen.
          </p>
        </div>

        <div className="p-4 bg-[#F0F6FC] border border-[#D0DFEE] rounded-[8px] max-w-md mx-auto text-left text-xs font-mono space-y-1">
          <div className="text-slate-500">Authorized Roles:</div>
          <div className="text-[#2B7FFF] font-semibold">{allowedRoles.join(' • ')}</div>
        </div>

        <div className="flex justify-center items-center gap-3 pt-2">
          <Link
            href={defaultRoute}
            className="px-4 py-2 bg-[#2B7FFF] text-white font-bold text-xs rounded-[4px] hover:bg-blue-600 transition-all shadow-xs"
          >
            Go to Your Authorized Workspace ({role})
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-white text-slate-700 border border-[#D0DFEE] font-bold text-xs rounded-[4px] hover:bg-slate-50 transition-all"
          >
            Switch Role / Re-Authenticate
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
