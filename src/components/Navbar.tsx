// src/components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DeploymentMode, HorizonTier } from '@/types/apiContracts';
import { isAudioMuted, toggleAudioMute, subscribeAudioMute } from '@/lib/audioAlerts';
import { checkBackendHealth } from '@/lib/apiClient';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { getPermittedTabsForRole } from '@/lib/rbac';
import { RoleSwitcherDropdown } from '@/components/Auth/RoleSwitcherDropdown';
import { RailLogo } from '@/components/Brand/RailLogo';

export type NavbarTab =
  | 'CORRIDOR_PLANNER'
  | 'INTERLOCKING'
  | 'LOCO_CAB'
  | 'VISION_TELEMETRY'
  | 'AUDITOR_WORKSPACE'
  | 'FIELD_CHECKIN'
  | 'PLATFORM_GATEWAY'
  | 'OVERVIEW';

interface NavbarProps {
  activeTab?: NavbarTab;
  onTabChange?: (tab: NavbarTab) => void;
  horizon?: HorizonTier;
  onHorizonChange?: (horizon: HorizonTier) => void;
  deploymentMode: DeploymentMode;
  onModeToggle: (mode: DeploymentMode) => void;
  isDarkMode?: boolean;
  onThemeToggle?: () => void;
  onRequestBlock?: () => void;
}

const HORIZONS: { tier: HorizonTier; label: string }[] = [
  { tier: 'TACTICAL_24H', label: '24h' },
  { tier: 'OPERATIONAL_7D', label: '7D' },
  { tier: 'STRATEGIC_30D', label: '30D' }
];

const NAV_ITEMS: { tab: NavbarTab; label: string; href: string }[] = [
  { tab: 'CORRIDOR_PLANNER', label: '1. Corridor Planner', href: '/planner' },
  { tab: 'INTERLOCKING', label: '2. Interlocking Map', href: '/interlocking' },
  { tab: 'VISION_TELEMETRY', label: '3. Defect Vision & Telemetry', href: '/vision-telemetry' },
  { tab: 'AUDITOR_WORKSPACE', label: '4. Auditor Workspace', href: '/auditor' },
  { tab: 'FIELD_CHECKIN', label: '5. Field Check-In', href: '/field-checkin' }
];

/**
 * Render controlled view, horizon, theme, and deployment controls with an IST
 * clock and backend health indicator. Poll health every eight seconds and share
 * the global audio mute state; show block requisition access when a callback exists.
 */
export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'CORRIDOR_PLANNER',
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
  const pathname = usePathname();
  const { role } = useAuth();
  const { isDarkMode: globalDarkMode, toggleTheme: globalToggleTheme } = useTheme();

  const effectiveDarkMode = isDarkMode !== undefined ? isDarkMode : globalDarkMode;
  const handleThemeToggle = () => {
    if (onThemeToggle) {
      onThemeToggle();
    } else {
      globalToggleTheme();
    }
  };

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

  const permittedTabs = getPermittedTabsForRole(role);
  const visibleNavItems = NAV_ITEMS.filter((item) => permittedTabs.includes(item.tab));

  const isTabActive = (itemTab: NavbarTab, itemHref: string) => {
    const currentPath = pathname || '';
    if (currentPath === itemHref || (currentPath && currentPath.startsWith(`${itemHref}/`))) {
      return true;
    }
    if (itemTab === 'CORRIDOR_PLANNER' && (activeTab === 'CORRIDOR_PLANNER' || activeTab === 'OVERVIEW')) {
      return currentPath === '' || currentPath === '/' || currentPath === '/planner' || !currentPath.startsWith('/');
    }
    if (itemTab === 'INTERLOCKING' && activeTab === 'INTERLOCKING') return true;
    if (itemTab === 'VISION_TELEMETRY' && (activeTab === 'LOCO_CAB' || activeTab === 'VISION_TELEMETRY')) return true;
    if (itemTab === 'AUDITOR_WORKSPACE' && activeTab === 'AUDITOR_WORKSPACE') return true;
    if (itemTab === 'FIELD_CHECKIN' && activeTab === 'FIELD_CHECKIN') return true;
    return activeTab === itemTab;
  };

  // Automatically sync activeTab with newly permitted tabs when role changes
  const prevRoleRef = React.useRef(role);
  useEffect(() => {
    const permitted = getPermittedTabsForRole(role);
    if (permitted.length > 0 && onTabChange) {
      if (prevRoleRef.current !== role || !permitted.includes(activeTab)) {
        prevRoleRef.current = role;
        onTabChange(permitted[0]);
      }
    }
  }, [role, activeTab, onTabChange]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#D0DFEE] px-3 sm:px-6 py-2 shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Brand Title & Horizon Switcher */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <RailLogo size={32} variant="badge" glow={true} />
            <div>
              <div className="flex items-center space-x-1.5">
                <h1 className="text-sm font-bold text-[#0F172A] tracking-tight group-hover:text-[#2B7FFF] transition-colors">RailSuraksha AI</h1>
                <span
                  className="text-[9px] font-mono font-semibold bg-[#E6F0FA] text-[#426188] px-1 py-0.2 border border-[#D0DFEE]"
                  style={{ borderRadius: '4px' }}
                >
                  SIH-26027
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="text-[9px] font-mono font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 px-1.5 py-0.5 border border-amber-500/30 transition-colors"
            style={{ borderRadius: '4px' }}
            title="View 3D Shadow Block Showcase"
          >
            ★ 3D Showcase
          </Link>

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

        {/* Dynamic RBAC Tactical Screen Switcher */}
        <nav className="flex items-center space-x-1 bg-[#F0F6FC] p-1 border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
          {visibleNavItems.map((item) => {
            const active = isTabActive(item.tab, item.href);
            return (
              <Link
                key={item.tab}
                href={item.href}
                onClick={() => onTabChange && onTabChange(item.tab)}
                className={`px-2.5 sm:px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-[#2B7FFF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0F172A] hover:bg-white/70'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Telemetry Clock, Role Dropdown & Mode Toggle */}
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
            {/* 1-Click Role Switcher */}
            <RoleSwitcherDropdown />

            {/* Theme Toggle */}
            <button
              onClick={handleThemeToggle}
              aria-label={`Switch to ${effectiveDarkMode ? 'light' : 'dark'} mode`}
              aria-pressed={effectiveDarkMode}
              className="theme-toggle relative inline-flex h-6 w-12 items-center rounded-full border border-[#D0DFEE] bg-[#F0F6FC] p-0.5 transition-colors duration-500 cursor-pointer"
              title={`Switch to ${effectiveDarkMode ? 'light' : 'dark'} mode`}
            >
              <span className={`theme-toggle-knob flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#2B7FFF] text-[9px] text-white shadow-sm transition-transform duration-500 ${effectiveDarkMode ? 'translate-x-[22px]' : 'translate-x-0'}`}>
                {effectiveDarkMode ? '☾' : '☀'}
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
