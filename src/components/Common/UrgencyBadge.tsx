// src/components/Common/UrgencyBadge.tsx
import React from 'react';
import { UrgencyTier } from '@/types/apiContracts';

export interface UrgencyBadgeProps {
  tier: UrgencyTier | 'CRITICAL' | 'MODERATE' | 'LOW' | string;
  score?: number;
  showScore?: boolean;
  className?: string;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  tier,
  score,
  showScore = false,
  className = ''
}) => {
  const normalizedTier = tier?.toUpperCase?.() || 'P2_SCHEDULED';

  let label = 'P2 SCHEDULED';
  let badgeStyles =
    'bg-[#FEF3C7] dark:bg-amber-950/60 border-[#FCD34D] dark:border-amber-800 text-[#92400E] dark:text-amber-200';
  let dotStyles = 'bg-[#F59E0B] dark:bg-amber-400';
  let isPulsing = false;

  if (normalizedTier === 'P1_CRITICAL' || normalizedTier === 'CRITICAL') {
    label = normalizedTier === 'CRITICAL' ? 'CRITICAL' : 'P1 CRITICAL';
    badgeStyles =
      'bg-[#FEE2E2] dark:bg-red-950/70 border-[#FCA5A5] dark:border-red-800 text-[#991B1B] dark:text-red-200';
    dotStyles = 'bg-[#DC2626] dark:bg-red-400';
    isPulsing = true;
  } else if (normalizedTier === 'P3_ROUTINE' || normalizedTier === 'LOW') {
    label = normalizedTier === 'LOW' ? 'LOW' : 'P3 ROUTINE';
    badgeStyles =
      'bg-[#DCFCE7] dark:bg-emerald-950/60 border-[#86EFAC] dark:border-emerald-800 text-[#166534] dark:text-emerald-200';
    dotStyles = 'bg-[#10B981] dark:bg-emerald-400';
    isPulsing = false;
  } else if (normalizedTier === 'MODERATE') {
    label = 'MODERATE';
    badgeStyles =
      'bg-[#FEF3C7] dark:bg-amber-950/60 border-[#FCD34D] dark:border-amber-800 text-[#92400E] dark:text-amber-200';
    dotStyles = 'bg-[#F59E0B] dark:bg-amber-400';
    isPulsing = false;
  }

  const scoreText =
    showScore && typeof score === 'number' && !isNaN(score)
      ? ` (${(score * 100).toFixed(0)}%)`
      : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold font-mono border rounded-[4px] shadow-2xs select-none ${badgeStyles} ${className}`}
      style={{ borderRadius: '4px' }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full inline-block shrink-0 ${dotStyles} ${
          isPulsing ? 'animate-pulse' : ''
        }`}
      />
      <span>
        {label}
        {scoreText}
      </span>
    </span>
  );
};
