// src/components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
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
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' IST'
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D0DFEE] px-6 py-2.5 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Title & System Badge */}
        <div className="flex items-center space-x-3">
          <div
            className="w-8 h-8 bg-[#2B7FFF] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm"
            style={{ borderRadius: '4px' }}
          >
            RS
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-[#0F172A] tracking-tight">RailSuraksha AI</h1>
              <span
                className="text-[10px] font-mono font-semibold bg-[#E6F0FA] text-[#426188] px-1.5 py-0.5 border border-[#D0DFEE]"
                style={{ borderRadius: '4px' }}
              >
                PROD-v2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">National Railway Safety Intelligence</p>
          </div>
        </div>

        {/* Tactical View Switcher */}
        <nav className="flex items-center space-x-1 bg-[#F0F6FC] p-1 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
          <button
            onClick={() => onTabChange('OVERVIEW')}
            className={`px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
            }`}
            style={{ borderRadius: '4px' }}
          >
            Overview Map
          </button>
          <button
            onClick={() => onTabChange('LOCO_CAB')}
            className={`px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'LOCO_CAB'
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
            }`}
            style={{ borderRadius: '4px' }}
          >
            Loco-Cab Forward Vision
          </button>
          <button
            onClick={() => onTabChange('PLATFORM_GATEWAY')}
            className={`px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'PLATFORM_GATEWAY'
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
            }`}
            style={{ borderRadius: '4px' }}
          >
            Platform Gateway CCTV
          </button>
        </nav>

        {/* Telemetry Clock, Operator Status & Deployment Mode Toggle */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2 text-right border-r border-slate-200 pr-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-slate-700">{currentTime || '08:45:12 IST'}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] font-mono text-slate-500">OP-402</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onModeToggle(deploymentMode === 'ADVISORY' ? 'AUTONOMOUS' : 'ADVISORY')}
              className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                deploymentMode === 'ADVISORY'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-xs'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {deploymentMode === 'ADVISORY' ? '⚠️ ADVISORY (PHASE 1)' : '⚡ AUTONOMOUS'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

