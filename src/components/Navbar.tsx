// src/components/Navbar.tsx
'use client';

import React from 'react';
import { DeploymentMode } from '@/types/apiContracts';

interface NavbarProps {
  activeTab: 'OVERVIEW' | 'LOCO_CAB' | 'PLATFORM_GATEWAY';
  onTabChange: (tab: 'OVERVIEW' | 'LOCO_CAB' | 'PLATFORM_GATEWAY') => void;
  deploymentMode: DeploymentMode;
  onModeToggle: (mode: DeploymentMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  deploymentMode,
  onModeToggle
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#D0DFEE] px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#2B7FFF] flex items-center justify-center text-white font-bold text-lg shadow-sm" style={{ borderRadius: '4px' }}>
            Rail
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">RailSuraksha AI</h1>
            <p className="text-xs text-slate-500 font-mono">PROD-v2.4 | Command Center</p>
          </div>
        </div>

        {/* Tactical View Switcher */}
        <nav className="flex items-center space-x-1 bg-[#F0F6FC] p-1 rounded-xl border border-[#D0DFEE]">
          <button
            onClick={() => onTabChange('OVERVIEW')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-[#0F172A] hover:bg-white/60'
            }`}
            style={{ borderRadius: '4px' }}
          >
            Overview Map
          </button>
          <button
            onClick={() => onTabChange('LOCO_CAB')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'LOCO_CAB'
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-[#0F172A] hover:bg-white/60'
            }`}
            style={{ borderRadius: '4px' }}
          >
            Loco-Cab Forward Vision
          </button>
          <button
            onClick={() => onTabChange('PLATFORM_GATEWAY')}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'PLATFORM_GATEWAY'
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-[#0F172A] hover:bg-white/60'
            }`}
            style={{ borderRadius: '4px' }}
          >
            Platform Gateway CCTV
          </button>
        </nav>

        {/* Global Advisory vs Autonomous Mode Toggle */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-[#0F172A]">Deployment Mode</div>
            <div className="text-[10px] text-slate-500 font-mono">
              {deploymentMode === 'ADVISORY' ? 'Manual Gate' : 'Direct Solenoid'}
            </div>
          </div>
          <button
            onClick={() => onModeToggle(deploymentMode === 'ADVISORY' ? 'AUTONOMOUS' : 'ADVISORY')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              deploymentMode === 'ADVISORY'
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
            }`}
            style={{ borderRadius: '4px' }}
          >
            {deploymentMode === 'ADVISORY' ? '⚠️ ADVISORY MODE (PHASE 1)' : '⚡ AUTONOMOUS MODE'}
          </button>
        </div>
      </div>
    </header>
  );
};
