'use client';

import React from 'react';
import Link from 'next/link';
import { RailLogo } from '@/components/Brand/RailLogo';

export function LandingFooter() {
  return (
    <footer className="border-t border-[#1c1d22] bg-[#040406] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <RailLogo size={28} variant="badge" glow={false} />
          <span className="font-display font-medium text-sm text-[#e2e3e9]">
            RailSuraksha AI
          </span>
          <span className="text-xs text-[#5e616e] font-mono">
            • National Railway Incident Intelligence Platform
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-[#9194a1]">
          <Link href="/admin" className="hover:text-white transition-colors">
            Command Center (/admin)
          </Link>
          <Link href="/planner" className="hover:text-white transition-colors">
            Corridor Planner
          </Link>
          <Link href="/interlocking" className="hover:text-white transition-colors">
            Interlocking
          </Link>
          <Link href="/vision-telemetry" className="hover:text-white transition-colors">
            Vision Telemetry
          </Link>
          <Link href="/auditor" className="hover:text-white transition-colors">
            Auditor Ledger
          </Link>
          <Link href="/field-checkin" className="hover:text-white transition-colors">
            Field Portal
          </Link>
        </div>

        <div className="text-xs font-mono text-[#5e616e]">
          RDSO / CENELEC EN 50128 SIL-4 Architecture
        </div>
      </div>
    </footer>
  );
}
export default LandingFooter;
