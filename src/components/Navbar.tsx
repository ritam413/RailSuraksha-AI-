// src/components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DeploymentMode, HorizonTier } from '@/types/apiContracts';
import { isAudioMuted, toggleAudioMute, subscribeAudioMute } from '@/lib/audioAlerts';
import { checkBackendHealth } from '@/lib/apiClient';

export type NavbarTab =
  | 'CORRIDOR_PLANNER'
  | 'INTERLOCKING'
  | 'LOCO_CAB'
  | 'VISION_TELEMETRY'
  | 'AUDITOR_WORKSPACE'
  | 'PLATFORM_GATEWAY'
  | 'OVERVIEW';

interface NavbarProps {
  activeTab: NavbarTab;
  onTabChange: (tab: NavbarTab) => void;
  horizon?: HorizonTier;
  onHorizonChange?: (horizon: HorizonTier) => void;
  deploymentMode: DeploymentMode;
  onModeToggle: (mode: DeploymentMode) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
  onRequestBlock?: () => void;
}

const HORIZONS: { tier: HorizonTier; label: string }[] = [
  { tier: 'TACTICAL_24H', label: '24h' },
  { tier: 'OPERATIONAL_7D', label: '7D' },
  { tier: 'STRATEGIC_30D', label: '30D' }
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  horizon = 'TACTICAL_24H',
  onHorizonChange,
  deploymentMode,
  onModeToggle,
  isDarkMode,
  onThemeToggle,
  onRequestBlock
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    setMuted(isAudioMuted());
    const unsubscribe = subscribeAudioMute((val) => setMuted(val));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await checkBackendHealth();
        setBackendOnline(status.online);
      } catch {
        setBackendOnline(false);
      }
    };
    checkStatus();
    const statusInterval = setInterval(checkStatus, 8000);
    return () => clearInterval(statusInterval);
  }, []);

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

  const isCorridorPlannerActive = activeTab === 'CORRIDOR_PLANNER' || activeTab === 'OVERVIEW';
  const isVisionActive = activeTab === 'LOCO_CAB' || activeTab === 'VISION_TELEMETRY';
  const isAuditorActive = activeTab === 'AUDITOR_WORKSPACE';
  const isInterlockingActive = activeTab === 'INTERLOCKING';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D0DFEE] px-3 sm:px-6 py-2 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand Title & Horizon Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div
              className="w-7 h-7 bg-[#2B7FFF] flex items-center justify-center text-white font-black text-xs tracking-tighter shadow-sm"
              style={{ borderRadius: '4px' }}
            >
              RS
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm font-bold text-[#0F172A] tracking-tight">RailSuraksha AI</h1>
                <span
                  className="text-[9px] font-mono font-semibold bg-[#E6F0FA] text-[#426188] px-1 py-0.2 border border-[#D0DFEE]"
                  style={{ borderRadius: '4px' }}
                >
                  SIH-26027
                </span>
              </div>
            </div>
          </div>

          {/* Rolling Horizon Switcher (24h / 7D / 30D) */}
          <div className="flex items-center space-x-0.5 bg-[#F0F6FC] p-0.5 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
            {HORIZONS.map((h) => (
              <button
                key={h.tier}
                onClick={() => onHorizonChange && onHorizonChange(h.tier)}
                className={`px-2 py-0.5 text-[11px] font-mono font-bold transition-all ${
                  horizon === h.tier
                    ? 'bg-[#2B7FFF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
                }`}
                style={{ borderRadius: '4px' }}
                title={`Planning Horizon: ${h.label}`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tactical 4-Screen Switcher (Matching Screen 1 - 4 Mockups) */}
        <nav className="flex items-center space-x-1 bg-[#F0F6FC] p-1 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
          <button
            onClick={() => onTabChange('CORRIDOR_PLANNER')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
              isCorridorPlannerActive
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
            }`}
            style={{ borderRadius: '4px' }}
          >
            1. Corridor Planner
          </button>
          <button
            onClick={() => onTabChange('INTERLOCKING')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
              isInterlockingActive
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
            }`}
            style={{ borderRadius: '4px' }}
          >
            2. Interlocking Map
          </button>
          <button
            onClick={() => onTabChange('VISION_TELEMETRY')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
              isVisionActive
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
            }`}
            style={{ borderRadius: '4px' }}
          >
            3. Defect Vision &amp; Telemetry
          </button>
          <button
            onClick={() => onTabChange('AUDITOR_WORKSPACE')}
            className={`px-2.5 sm:px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
              isAuditorActive
                ? 'bg-[#2B7FFF] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
            }`}
            style={{ borderRadius: '4px' }}
          >
            4. Auditor Workspace
          </button>
        </nav>

        {/* Telemetry Clock & Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="hidden lg:flex items-center space-x-1.5 text-right border-r border-slate-200 px-1.5 pr-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-slate-700">{currentTime || '08:45:12 IST'}</span>
            <span className="text-slate-300">|</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                backendOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {backendOnline ? 'ONLINE' : 'LOCAL SIM'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={onThemeToggle}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              aria-pressed={isDarkMode}
              className="theme-toggle relative inline-flex h-6 w-12 items-center rounded-full border border-[#D0DFEE] bg-[#F0F6FC] p-0.5 transition-colors duration-500"
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <span className={`theme-toggle-knob flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2B7FFF] text-[9px] text-white shadow-sm transition-transform duration-500 ${isDarkMode ? 'translate-x-[22px]' : 'translate-x-0'}`}>
                {isDarkMode ? '☾' : '☀'}
              </span>
            </button>

            {/* Audio Alerts Synthesizer Toggle */}
            <button
              onClick={() => toggleAudioMute()}
              title={muted ? 'Audio Alerts: Muted' : 'Audio Alerts: Active'}
              className={`px-2 py-1 text-xs font-mono font-semibold border flex items-center space-x-1 transition-all ${
                !muted
                  ? 'bg-[#E6F0FA] text-[#2B7FFF] border-[#2B7FFF]/40 hover:bg-[#D0DFEE]'
                  : 'bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <span>{muted ? '🔇' : '🔊'}</span>
            </button>

            {/* Direct Departmental Block Requisition Button */}
            {onRequestBlock && (
              <button
                onClick={onRequestBlock}
                className="px-2.5 py-1 text-xs font-bold text-white bg-[#2B7FFF] hover:bg-blue-600 transition-all flex items-center space-x-1 shadow-xs"
                style={{ borderRadius: '4px' }}
                title="Direct Block Requisition Form (TDMS, SMMS, TMS)"
              >
                <span>+</span>
                <span>Request Block</span>
              </button>
            )}

            <button
              onClick={() => onModeToggle(deploymentMode === 'ADVISORY' ? 'AUTONOMOUS' : 'ADVISORY')}
              className={`px-2.5 py-1 text-xs font-bold border transition-all ${
                deploymentMode === 'ADVISORY'
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-xs'
              }`}
              style={{ borderRadius: '4px' }}
            >
              {deploymentMode === 'ADVISORY' ? '⚠️ ADVISORY' : '⚡ AUTO'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
