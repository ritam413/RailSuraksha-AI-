'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { OFFICER_PERSONAS, ROLE_DEFAULT_ROUTE } from '@/lib/rbac';
import { AppRole } from '@/types/apiContracts';

export default function LoginClient() {
  let router: any = null;
  try {
    router = useRouter();
  } catch {}

  let redirectParam: string | null = null;
  try {
    const searchParams = useSearchParams();
    redirectParam = searchParams ? searchParams.get('redirect') : null;
  } catch {}

  const { switchRole, loginByEmployeeId, role: currentRole } = useAuth();

  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectPersona = (targetRole: AppRole) => {
    switchRole(targetRole);
    const targetRoute = redirectParam || ROLE_DEFAULT_ROUTE[targetRole];
    if (router && typeof router.push === 'function') {
      router.push(targetRoute);
    } else if (typeof window !== 'undefined') {
      window.location.href = targetRoute;
    }
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!employeeIdInput.trim()) {
      setErrorMessage('Please enter a valid Railway Employee ID or Badge Code.');
      return;
    }

    const success = loginByEmployeeId(employeeIdInput);
    if (success) {
      const targetRole = OFFICER_PERSONAS.find(
        (p) => p.employeeId.toLowerCase() === employeeIdInput.toLowerCase().trim()
      )?.role || 'ADMIN';
      const targetRoute = redirectParam || ROLE_DEFAULT_ROUTE[targetRole];
      if (router && typeof router.push === 'function') {
        router.push(targetRoute);
      } else if (typeof window !== 'undefined') {
        window.location.href = targetRoute;
      }
    } else {
      setErrorMessage(`Employee ID "${employeeIdInput}" not found in Indian Railways directory.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F6FC] py-10 px-4 flex flex-col justify-center items-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Header Branding */}
        <div className="bg-white border border-[#D0DFEE] p-6 text-center space-y-2 shadow-xs" style={{ borderRadius: '16px' }}>
          <div className="w-12 h-12 bg-[#2B7FFF] text-white flex items-center justify-center font-black text-lg mx-auto shadow-sm" style={{ borderRadius: '8px' }}>
            RS
          </div>
          <h1 className="text-2xl font-bold font-display text-[#0F172A] tracking-tight">
            RailSuraksha AI • Officer Authentication Portal
          </h1>
          <p className="text-xs text-slate-600 max-w-lg mx-auto">
            Role-Based Access Control (RBAC) Gatekeeper for Statutory Railway Operations (RDSO Cyber Protocol / IRPWM 2020 Ch 5).
          </p>
          {redirectParam && (
            <div className="inline-block mt-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono" style={{ borderRadius: '4px' }}>
              Authentication required to access: <strong className="text-amber-950">{redirectParam}</strong>
            </div>
          )}
        </div>

        {/* 1-Click Fast Persona Switcher */}
        <div className="bg-white border border-[#D0DFEE] p-6 shadow-xs space-y-4" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A]">Pre-Seeded Operational Personas</h2>
              <p className="text-xs text-slate-500">1-click statutory authentication with assigned permissions</p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#E6F0FA] text-[#2B7FFF] px-2 py-0.5 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
              6 ACTIVE ROLES
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {OFFICER_PERSONAS.map((persona) => {
              const isCurrent = persona.role === currentRole;
              return (
                <button
                  key={persona.id}
                  onClick={() => handleSelectPersona(persona.role)}
                  className={`p-3 text-left border transition-all flex items-start space-x-3 hover:border-[#2B7FFF] hover:shadow-xs ${
                    isCurrent
                      ? 'bg-[#F0F6FC] border-[#2B7FFF]'
                      : 'bg-white border-[#D0DFEE]'
                  }`}
                  style={{ borderRadius: '8px' }}
                >
                  <div
                    className={`w-9 h-9 flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                      isCurrent ? 'bg-[#2B7FFF] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    {persona.badgeCode}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {persona.fullName}
                      </span>
                      {isCurrent && (
                        <span className="text-[9px] font-mono font-bold text-[#2B7FFF] bg-blue-50 px-1 py-0.2" style={{ borderRadius: '2px' }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 truncate mt-0.5">
                      {persona.designation}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>ID: {persona.employeeId}</span>
                      <span>•</span>
                      <span className="text-[#2B7FFF]">{ROLE_DEFAULT_ROUTE[persona.role]}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Employee ID Login Form */}
        <div className="bg-white border border-[#D0DFEE] p-6 shadow-xs space-y-4" style={{ borderRadius: '16px' }}>
          <h2 className="text-sm font-bold text-[#0F172A]">Employee ID Direct Login</h2>
          <form onSubmit={handleFormLogin} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. CPTM-CR-8801, CTRL-CSMT-402, LP-KYN-9912..."
              value={employeeIdInput}
              onChange={(e) => setEmployeeIdInput(e.target.value)}
              className="flex-1 bg-[#F0F6FC] border border-[#D0DFEE] p-2.5 text-xs text-slate-900 placeholder:text-slate-400 font-mono focus:outline-hidden focus:border-[#2B7FFF]"
              style={{ borderRadius: '4px' }}
            />
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2B7FFF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-all"
              style={{ borderRadius: '4px' }}
            >
              Sign In →
            </button>
          </form>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium" style={{ borderRadius: '4px' }}>
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
