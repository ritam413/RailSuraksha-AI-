// src/components/Common/SignalHead.tsx
'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { SignalAspect } from '@/types/apiContracts';

export interface SignalHeadProps {
  signalId: string;
  aspect: SignalAspect;
  isClamped?: boolean;
  onClick?: (signalId: string, currentAspect: SignalAspect) => void;
  className?: string;
}

export const SignalHead: React.FC<SignalHeadProps> = ({
  signalId,
  aspect,
  isClamped = false,
  onClick,
  className = ''
}) => {
  const isRedActive = aspect === 'RED' || isClamped;
  const isGreenActive = !isClamped && aspect === 'GREEN';
  const isYellowTopActive = !isClamped && (aspect === 'YELLOW' || aspect === 'DOUBLE_YELLOW');
  const isYellowBottomActive = !isClamped && aspect === 'DOUBLE_YELLOW';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !isClamped) {
      e.preventDefault();
      onClick(signalId, aspect);
    }
  };

  return (
    <div
      onClick={() => !isClamped && onClick && onClick(signalId, aspect)}
      onKeyDown={handleKeyDown}
      className={`inline-flex flex-col items-center select-none group transition-transform ${
        isClamped ? 'cursor-not-allowed opacity-95' : 'cursor-pointer hover:scale-105'
      } ${className}`}
      title={`Signal ${signalId} - Aspect: ${aspect}${isClamped ? ' (STATUTORY LOCKOUT - FORM S&T/T-351)' : ''}`}
      role="button"
      tabIndex={isClamped ? -1 : 0}
      aria-label={`Signal ${signalId}, Aspect ${aspect}${isClamped ? ', Clamped Danger Statutory Lockout' : ''}`}
    >
      {/* Statutory Lockout Floating Badge */}
      {isClamped && (
        <div
          className="mb-1 flex items-center space-x-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold font-mono tracking-wider shadow-xs animate-pulse"
          style={{ borderRadius: '4px' }}
        >
          <Lock className="w-2.5 h-2.5 shrink-0" />
          <span>S&amp;T LOCKOUT</span>
        </div>
      )}

      {/* 4-Aspect Vertical LED Housing Box */}
      <div
        className={`relative p-1.5 bg-[#0B132B] border-2 ${
          isClamped ? 'border-red-500 shadow-red-300' : 'border-slate-700 shadow-md'
        } flex flex-col items-center space-y-1.5`}
        style={{ borderRadius: '6px' }}
      >
        {/* Aspect 1: Yellow Top */}
        <div
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
            isYellowTopActive
              ? 'aspect-yellow-top-active bg-amber-400 border-amber-300 shadow-[0_0_8px_#F59E0B]'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        />

        {/* Aspect 2: Green */}
        <div
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
            isGreenActive
              ? 'aspect-green-active bg-emerald-500 border-emerald-300 shadow-[0_0_8px_#10B981]'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        />

        {/* Aspect 3: Red Danger */}
        <div
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
            isRedActive
              ? 'aspect-red-active bg-red-500 border-red-300 shadow-[0_0_10px_#EF4444] animate-pulse'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        />

        {/* Aspect 4: Yellow Bottom */}
        <div
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
            isYellowBottomActive
              ? 'aspect-yellow-bottom-active bg-amber-400 border-amber-300 shadow-[0_0_8px_#F59E0B]'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        />
      </div>

      {/* Signal Mast Post */}
      <div className="w-1 h-3 bg-slate-600" />

      {/* Signal Identification Plate */}
      <div
        className="px-1.5 py-0.5 bg-[#1E293B] border border-slate-600 text-white text-[10px] font-mono font-bold tracking-tight shadow-xs"
        style={{ borderRadius: '3px' }}
      >
        {signalId}
      </div>
    </div>
  );
};
