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
  let badgeStyles = 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
  let dotStyles = 'bg-[#F59E0B]';
  let isPulsing = false;

  if (normalizedTier === 'P1_CRITICAL' || normalizedTier === 'CRITICAL') {
    label = normalizedTier === 'CRITICAL' ? 'CRITICAL' : 'P1 CRITICAL';
    badgeStyles = 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]';
    dotStyles = 'bg-[#DC2626]';
    isPulsing = true;
  } else if (normalizedTier === 'P3_ROUTINE' || normalizedTier === 'LOW') {
    label = normalizedTier === 'LOW' ? 'LOW' : 'P3 ROUTINE';
    badgeStyles = 'bg-[#DCFCE7] text-[#166534] border-[#86EFAC]';
    dotStyles = 'bg-[#10B981]';
    isPulsing = false;
  } else if (normalizedTier === 'MODERATE') {
    label = 'MODERATE';
    badgeStyles = 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]';
    dotStyles = 'bg-[#F59E0B]';
    isPulsing = false;
  }

  const scoreText =
    showScore && typeof score === 'number' && !isNaN(score)
      ? ` (${(score * 100).toFixed(0)}%)`
      : '';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-bold font-mono border rounded-[4px] shadow-xs select-none ${badgeStyles} ${className}`}
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
