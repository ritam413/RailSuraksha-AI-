// src/components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { DeploymentMode } from '@/types/apiContracts';
import { isAudioMuted, toggleAudioMute, subscribeAudioMute } from '@/lib/audioAlerts';
import { checkBackendHealth } from '@/lib/apiClient';

interface NavbarProps {
  activeTab: 'OVERVIEW' | 'LOCO_CAB' | 'PLATFORM_GATEWAY';
  onTabChange: (tab: 'OVERVIEW' | 'LOCO_CAB' | 'PLATFORM_GATEWAY') => void;
  deploymentMode: DeploymentMode;
  onModeToggle: (mode: DeploymentMode) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  deploymentMode,
  onModeToggle,
  isDarkMode,
  onThemeToggle
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
          <div className="hidden lg:flex items-center space-x-2 text-right border-r border-slate-200 px-2 pr-4">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-bold text-slate-700">{currentTime || '08:45:12 IST'}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-[10px] font-mono text-slate-500">OP-402</span>
            <span className="text-slate-300">|</span>
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border ${
                backendOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              style={{ borderRadius: '4px' }}
              title={backendOnline ? 'FastAPI Backend running on port 8000' : 'Backend offline, using local simulation'}
            >
              {backendOnline ? 'API: ONLINE' : 'API: LOCAL SIM'}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onThemeToggle}
              aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              aria-pressed={isDarkMode}
              className="theme-toggle relative inline-flex h-8 w-16 items-center rounded-full border border-[#D0DFEE] bg-[#F0F6FC] p-1 transition-colors duration-500"
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <span className={`theme-toggle-knob flex h-6 w-6 items-center justify-center rounded-full bg-[#2B7FFF] text-[12px] text-white shadow-sm transition-transform duration-500 ${isDarkMode ? 'translate-x-[25px]' : 'translate-x-0'}`}>
                {isDarkMode ? '☾' : '☀'}
              </span>
            </button>
            {/* Audio Alerts Synthesizer Toggle */}
            <button
              onClick={() => toggleAudioMute()}
              title={muted ? 'Audio Alerts: Muted (Click to Unmute)' : 'Audio Alerts: Active (Click to Mute)'}
              className={`px-2.5 py-1.5 text-xs font-mono font-semibold border flex items-center space-x-1.5 transition-all ${
                !muted
                  ? 'bg-[#E6F0FA] text-[#2B7FFF] border-[#2B7FFF]/40 hover:bg-[#D0DFEE]'
                  : 'bg-slate-100 text-slate-400 border-slate-300 hover:bg-slate-200'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <span>{muted ? '🔇' : '🔊'}</span>
              <span className="hidden sm:inline">{muted ? 'AUDIO OFF' : 'AUDIO ON'}</span>
            </button>

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

