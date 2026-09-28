import React from 'react';

export interface RailLogoProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'badge' | 'full';
  showText?: boolean;
  className?: string;
  glow?: boolean;
  isDark?: boolean;
}

const SIZE_MAP: Record<string, number> = {
  sm: 24,
  md: 32,
  lg: 44,
  xl: 56,
};

/**
 * RailSuraksha AI Bespoke Vector Emblem
 * Integrates:
 * 1. Precision Converging High-Speed Rails (Vanishing Horizon & Block Corridors)
 * 2. Cross-Ties & Switch Crossover (Dynamic Interlocking & Joint Shadow Bundling)
 * 3. Connected IoT Network Nodes & Signal Vertices (Civil TMS, Electrical TDMS, Signaling SMMS)
 * 4. Orbital Rolling Horizon Schedule Arc (24h / 7D / 30D Time-Synchronization)
 * 5. Subtle Hexagonal Safety Shield (Suraksha & Kavach SIL-4)
 */
export const RailMarkSvg: React.FC<{ size?: number; className?: string; glow?: boolean }> = ({
  size = 32,
  className = '',
  glow = false,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="RailSuraksha AI Logo Mark"
    >
      <defs>
        {/* Primary High-Tech Rail Gradient */}
        <linearGradient id="railGrad" x1="12" y1="54" x2="52" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#2B7FFF" />
          <stop offset="100%" stopColor="#00F0FF" />
        </linearGradient>

        {/* Crossover Interlocking Track Gradient */}
        <linearGradient id="crossGrad" x1="14" y1="44" x2="50" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#00F0FF" />
        </linearGradient>

        {/* Schedule Horizon Arc Gradient */}
        <linearGradient id="horizonGrad" x1="8" y1="28" x2="56" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#00F0FF" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Suraksha Shield Contour Gradient */}
        <linearGradient id="shieldGrad" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2B7FFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1E293B" stopOpacity="0.05" />
        </linearGradient>

        {/* Subtle Ambient Glow Filter */}
        <filter id="rsGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Hexagonal Suraksha Safety Shield Geometry (Subtle Architectural Frame) */}
      <path
        d="M32 6 L52 16 V38 L32 58 L12 38 V16 Z"
        fill="url(#shieldGrad)"
        stroke="#2B7FFF"
        strokeWidth="1.25"
        strokeOpacity="0.3"
        strokeLinejoin="round"
      />

      {/* Schedule / Rolling Horizon Arc (Time Synchronization Sweep) */}
      <path
        d="M10 26 C10 14 20 6 32 6 C44 6 54 14 54 26"
        stroke="url(#horizonGrad)"
        strokeWidth="1.75"
        strokeDasharray="2 3"
        strokeLinecap="round"
      />
      {/* Schedule Tick Markers (Tactical 24h, Operational 7D, Strategic 30D) */}
      <circle cx="20" cy="11.5" r="1.5" fill="#38BDF8" />
      <circle cx="32" cy="6" r="2" fill="#00F0FF" filter={glow ? 'url(#rsGlow)' : undefined} />
      <circle cx="44" cy="11.5" r="1.5" fill="#F59E0B" />

      {/* Track Cross-Ties (Sleepers) with Perspective Scaling */}
      <line x1="20" y1="48" x2="44" y2="48" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.75" />
      <line x1="23" y1="39" x2="41" y2="39" stroke="#60A5FA" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.85" />
      <line x1="26" y1="30" x2="38" y2="30" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.95" />
      <line x1="29" y1="21" x2="35" y2="21" stroke="#BAE6FD" strokeWidth="1.75" strokeLinecap="round" />

      {/* Crossover Interlocking Switch Rail (Track Network Convergence) */}
      <path
        d="M16 46 Q 32 36 48 20"
        stroke="url(#crossGrad)"
        strokeWidth="2.25"
        strokeLinecap="round"
      />

      {/* Main Left High-Speed Rail */}
      <path
        d="M18 52 C 18 42, 24 28, 30 14"
        stroke="url(#railGrad)"
        strokeWidth="3.25"
        strokeLinecap="round"
      />

      {/* Main Right High-Speed Rail */}
      <path
        d="M46 52 C 46 42, 40 28, 34 14"
        stroke="url(#railGrad)"
        strokeWidth="3.25"
        strokeLinecap="round"
      />

      {/* Network Nodes (IoT Telemetry / Signal Status Vertices) */}
      {/* Bottom Left Sensor Node */}
      <circle cx="18" cy="52" r="2.25" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
      {/* Bottom Right Sensor Node */}
      <circle cx="46" cy="52" r="2.25" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
      {/* Left Interlocking Crossover Node */}
      <circle cx="23" cy="39" r="2.2" fill="#10B981" stroke="#FFFFFF" strokeWidth="1" />
      {/* Right Crossover Exit Node */}
      <circle cx="48" cy="20" r="2.2" fill="#00F0FF" stroke="#0F172A" strokeWidth="1" />

      {/* Central Kavach Safety Core / AI Interlocking Node */}
      <circle cx="32" cy="34" r="4" fill="#00F0FF" filter="url(#rsGlow)" />
      <circle cx="32" cy="34" r="2" fill="#0F172A" />

      {/* Vanishing Apex Horizon Beacon */}
      <polygon points="32,9 34,13 30,13" fill="#FFFFFF" />
    </svg>
  );
};

export const RailLogo: React.FC<RailLogoProps> = ({
  size = 'md',
  variant = 'badge',
  showText = false,
  className = '',
  glow = true,
}) => {
  const numericSize = typeof size === 'number' ? size : SIZE_MAP[size] || 32;

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <RailMarkSvg size={numericSize} glow={glow} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 group select-none ${className}`}>
      {/* Emblem Badge Container with 4px geometric radius */}
      <div
        className="relative flex items-center justify-center transition-all duration-200 ease-out group-hover:shadow-[0_0_16px_rgba(43,127,255,0.35)] group-active:scale-[0.97] bg-gradient-to-b from-[#0F172A] to-[#020617] border border-[#2B7FFF]/40 shadow-xs overflow-hidden"
        style={{
          width: numericSize,
          height: numericSize,
          borderRadius: '4px',
        }}
      >
        {/* Subtle interior gradient flare */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#2B7FFF]/15 via-transparent to-[#00F0FF]/20 pointer-events-none" />
        <RailMarkSvg size={Math.round(numericSize * 0.85)} glow={glow} />
      </div>

      {showText && (
        <div className="flex flex-col leading-none text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-[#0F172A] dark:text-[#E2E3E9] group-hover:text-[#2B7FFF] transition-colors">
              RailSuraksha AI
            </span>
            <span
              className="text-[9px] font-mono font-semibold bg-[#E6F0FA] dark:bg-blue-950/40 text-[#2B7FFF] dark:text-blue-300 px-1 py-0.2 border border-[#D0DFEE] dark:border-blue-800/40"
              style={{ borderRadius: '4px' }}
            >
              SIH-26027
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
            National Block & Safety Engine
          </span>
        </div>
      )}
    </div>
  );
};

export default RailLogo;
