'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ROLE_DEFAULT_ROUTE } from '@/lib/rbac';

export default function UnauthorizedPage() {
  const { role, user } = useAuth();
  const defaultRoute = ROLE_DEFAULT_ROUTE[role] || '/login';

  return (
    <div className="min-h-screen bg-[#F0F6FC] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white border border-[#D0DFEE] p-8 text-center space-y-6 shadow-sm" style={{ borderRadius: '16px' }}>
        <div className="w-16 h-16 mx-auto bg-amber-50 border border-amber-300 flex items-center justify-center text-3xl" style={{ borderRadius: '12px' }}>
          🛡️
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 uppercase tracking-wider" style={{ borderRadius: '4px' }}>
            Statutory Access Control (IRPWM Ch 5 / RDSO Cyber Protocol)
          </span>
          <h1 className="text-xl font-bold font-display text-[#0F172A]">
            Access Denied / Insufficient Privileges
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            You do not have the designated operational clearance to access the requested screen under role <strong className="text-slate-900 font-mono">[{user?.designation || role}]</strong>.
          </p>
        </div>

        <div className="p-4 bg-[#F0F6FC] border border-[#D0DFEE] text-left text-xs font-mono space-y-1" style={{ borderRadius: '8px' }}>
          <div className="text-slate-500">Authenticated Persona:</div>
          <div className="text-slate-900 font-bold">{user?.fullName} ({user?.employeeId})</div>
          <div className="text-slate-600">{user?.department} • {user?.division}</div>
        </div>

        <div className="flex justify-center items-center gap-3 pt-2">
          <Link
            href={defaultRoute}
            className="px-4 py-2 bg-[#2B7FFF] text-white font-bold text-xs hover:bg-blue-600 transition-all shadow-xs"
            style={{ borderRadius: '4px' }}
          >
            Go to Your Authorized Workspace ({role})
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-white text-slate-700 border border-[#D0DFEE] font-bold text-xs hover:bg-slate-50 transition-all"
            style={{ borderRadius: '4px' }}
          >
            Switch Role / Re-Authenticate
          </Link>
        </div>
      </div>
    </div>
  );
}
