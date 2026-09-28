'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { RailLogo } from '@/components/Brand/RailLogo';

export function LandingNavbar() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08080a]/90 backdrop-blur-md border-b border-[#1c1d22]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & National Emblem */}
        <Link href="/" className="flex items-center gap-3 group">
          <RailLogo size={34} variant="badge" glow={true} />
          <div>
            <span className="font-display font-bold text-base text-[#e2e3e9] tracking-tight group-hover:text-white transition-colors">
              RailSuraksha AI
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
              SIH-26027
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-[#9194a1]">
          <a href="#digital-twin" className="hover:text-[#e2e3e9] transition-colors">
            3D Digital Twin
          </a>
          <a href="#shadow-block" className="hover:text-[#e2e3e9] transition-colors">
            Shadow Block Logic
          </a>
          <a href="#synergy-matrix" className="hover:text-[#e2e3e9] transition-colors">
            Multi-Dept Synergy
          </a>
          <Link href="/planner" className="hover:text-[#e2e3e9] transition-colors">
            Corridor Planner
          </Link>
          <Link href="/vision-telemetry" className="hover:text-[#e2e3e9] transition-colors">
            Defect Vision
          </Link>
        </nav>

        {/* Right CTA & Cockpit Launcher */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#121317] border border-[#1c1d22] text-[11px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Kavach SIL-4 Active</span>
          </div>

          <Link
            href="/admin"
            className="px-4 py-2 rounded-[6px] bg-[#2B7FFF] hover:bg-[#2563EB] text-white text-xs font-mono font-medium transition-all shadow-[0_0_15px_rgba(43,127,255,0.3)] active:scale-[0.98] whitespace-nowrap"
          >
            Launch Command Cockpit (/admin) →
          </Link>
        </div>
      </div>
    </header>
  );
}
export default LandingNavbar;
