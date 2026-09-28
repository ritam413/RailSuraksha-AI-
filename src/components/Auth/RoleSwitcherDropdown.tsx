'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { OFFICER_PERSONAS, ROLE_DEFAULT_ROUTE } from '@/lib/rbac';
import { AppRole } from '@/types/apiContracts';

export const RoleSwitcherDropdown: React.FC = () => {
  const { role, user, switchRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (newRole: AppRole) => {
    switchRole(newRole);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Active Officer Persona"
        className="flex items-center space-x-2 px-2.5 py-1 bg-[#F0F6FC] hover:bg-slate-100 border border-[#D0DFEE] text-slate-800 transition-all text-xs font-semibold"
        style={{ borderRadius: '4px' }}
      >
        <span className="w-2 h-2 rounded-full bg-[#2B7FFF]" />
        <span className="font-mono text-[11px] font-bold text-[#2B7FFF]">[{user?.badgeCode || role}]</span>
        <span className="hidden md:inline text-[11px] text-slate-700 truncate max-w-[120px]">
          {user?.fullName.split(',')[0] || user?.designation || role}
        </span>
        <span className="text-[9px] text-slate-400">▼</span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-80 bg-white border border-[#D0DFEE] shadow-xl z-[9999] p-2 space-y-1.5"
          style={{ borderRadius: '8px' }}
        >
          <div className="px-2 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
              Active Persona Switcher
            </span>
            <span className="text-[10px] font-mono text-[#2B7FFF] font-semibold">
              {user?.division}
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-1 py-1">
            {OFFICER_PERSONAS.map((persona) => {
              const isSelected = persona.role === role;
              return (
                <button
                  key={persona.id}
                  onClick={() => handleSelectRole(persona.role)}
                  className={`w-full text-left p-2 transition-all flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-[#F0F6FC] border border-[#2B7FFF]/40 text-[#0F172A]'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 mt-0.5 ${
                      isSelected
                        ? 'bg-[#2B7FFF] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                    style={{ borderRadius: '2px' }}
                  >
                    {persona.badgeCode}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {persona.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      {persona.designation}
                    </div>
                    <div className="text-[9px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{persona.employeeId}</span>
                      <span>•</span>
                      <span>{persona.department}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-[#2B7FFF] text-xs font-bold">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1 text-[11px]">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-[#2B7FFF] hover:underline font-semibold"
            >
              Auth Portal / ID Login →
            </Link>
            <span className="text-slate-400 font-mono text-[10px]">RDSO Protocol</span>
          </div>
        </div>
      )}
    </div>
  );
};
