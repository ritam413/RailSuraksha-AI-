// src/components/Overview/KpiStrip.tsx
import React from 'react';
import { CorridorKpiMetrics, TrackInterlockingState, IncidentRecord, PlatformHoldState } from '@/types/apiContracts';
import { MOCK_CORRIDOR_KPIS } from '@/lib/mockData';
import { KpiCard, KpiBadgeVariant, KpiTrendDirection } from './KpiCard';

export interface KpiStripProps {
  metrics?: CorridorKpiMetrics;
  selectedMetricId?: string;
  onSelectMetric?: (id: string) => void;
  className?: string;
  // Backward compatibility legacy props
  interlockingState?: TrackInterlockingState;
  incidents?: IncidentRecord[];
  platformHold?: PlatformHoldState;
}

// Pure, safe headway formatter (e.g. 195 -> "3h 15m")
export function formatHeadwaySafe(minutes?: number): string {
  if (minutes === undefined || isNaN(minutes) || minutes <= 0) {
    return '0h 00m';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}m`;
}
export const formatHeadway = formatHeadwaySafe;

// Pure, zero-padded count formatter (e.g. 3 -> "03" or "03 Active")
export function formatCountSafe(count?: number, suffix?: string): string {
  const safeCount = Math.max(0, count || 0);
  const padded = safeCount < 10 ? `0${safeCount}` : `${safeCount}`;
  return suffix ? `${padded} ${suffix}` : padded;
}
export const formatCount = formatCountSafe;

// Format percentages with 1 decimal precision (e.g. 38.4 -> "38.4%")
export function formatPercentageSafe(val?: number): string {
  if (val === undefined || isNaN(val)) return '0.0%';
  return `${val.toFixed(1)}%`;
}

export const KpiStrip: React.FC<KpiStripProps> = ({
  metrics = MOCK_CORRIDOR_KPIS,
  selectedMetricId,
  onSelectMetric,
  className = ''
}) => {
  const data = metrics || MOCK_CORRIDOR_KPIS;

  // Dynamic Threshold Logic for Badges & Trends
  const isAvailabilityHealthy = data.assetAvailabilityIndexPct >= 95.0;
  const isDowntimeHigh = data.corridorDowntimeSavedPct >= 30.0;

  const cards = [
    {
      id: 'corridor-downtime',
      title: 'Corridor Downtime Saved',
      value: formatPercentageSafe(data.corridorDowntimeSavedPct),
      badgeText: isDowntimeHigh ? '⚡ ROI ACTIVE' : 'MODERATE ROI',
      badgeVariant: (isDowntimeHigh ? 'success' : 'primary') as KpiBadgeVariant,
      pulse: data.corridorDowntimeSavedPct > 0,
      trend: 'UP' as KpiTrendDirection,
      trendValue: '↑ +4.2h',
      subtext: 'Shadow Bundling',
      subtextTooltip: 'Shadow Blocking Multi-Dept Bundling'
    },
    {
      id: 'track-availability',
      title: 'Track Availability Index',
      value: formatPercentageSafe(data.assetAvailabilityIndexPct),
      badgeText: isAvailabilityHealthy ? 'TARGET > 95%' : 'CRITICAL DEFICIT',
      badgeVariant: (isAvailabilityHealthy ? 'primary' : 'danger') as KpiBadgeVariant,
      pulse: !isAvailabilityHealthy,
      trend: 'UP' as KpiTrendDirection,
      trendValue: '↑ +1.2%',
      subtext: 'IRPWM Standard',
      subtextTooltip: 'Section Availability (IRPWM 2020)'
    },
    {
      id: 'active-blocks',
      title: 'Active Corridor Blocks',
      value: formatCountSafe(data.activeBlocksCount),
      unit: 'Active',
      badgeText: 'NOCTURNAL',
      badgeVariant: 'indigo' as KpiBadgeVariant,
      pulse: data.activeBlocksCount > 0,
      trend: 'NEUTRAL' as KpiTrendDirection,
      trendValue: '01:30–04:45',
      subtext: 'Possessory Windows',
      subtextTooltip: 'Possessory Windows (01:30–04:45)'
    },
    {
      id: 'pending-demands',
      title: 'Pending Demands',
      value: formatCountSafe(data.pendingDemandsCount),
      unit: 'In Queue',
      badgeText:
        data.pendingDemandsCount > 0
          ? `${formatCountSafe(Math.min(2, data.pendingDemandsCount))} P1 CRITICAL`
          : 'ALL CLEAR',
      badgeVariant: (data.pendingDemandsCount > 0 ? 'warning' : 'neutral') as KpiBadgeVariant,
      pulse: data.pendingDemandsCount > 0,
      trend: 'DOWN' as KpiTrendDirection,
      trendValue: '↑ +2 New',
      subtext: 'Civil/OHE/S&T',
      subtextTooltip: 'Civil + Electrical + S&T Demands'
    },
    {
      id: 'white-corridor',
      title: 'White Corridor Gap',
      value: formatHeadwaySafe(data.whiteCorridorHeadwayMinutes),
      badgeText: 'OPTIMAL LULL',
      badgeVariant: 'primary' as KpiBadgeVariant,
      pulse: false,
      trend: 'NEUTRAL' as KpiTrendDirection,
      trendValue: '01:30–04:45',
      subtext: `${data.whiteCorridorHeadwayMinutes || 195}m Window`,
      subtextTooltip: 'Next possessory window: 01:30–04:45'
    },
    {
      id: 'kavach-tsrs',
      title: 'Active Kavach TSRs',
      value: formatCountSafe(data.activeKavachTsrsCount),
      unit: 'Enforced',
      badgeText: '30 KM/H SPEED',
      badgeVariant: 'danger' as KpiBadgeVariant,
      pulse: data.activeKavachTsrsCount > 0,
      trend: 'DOWN' as KpiTrendDirection,
      trendValue: '↓ -1 Cleared',
      subtext: 'Speed Supervision',
      subtextTooltip: 'RDSO Kavach Speed Supervision'
    }
  ];

  return (
    <div
      data-testid="kpi-strip"
      className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 ${className}`}
    >
      {cards.map((card) => (
        <KpiCard
          key={card.id}
          id={card.id}
          title={card.title}
          value={card.value}
          unit={card.unit}
          badgeText={card.badgeText}
          badgeVariant={card.badgeVariant}
          pulse={card.pulse}
          trend={card.trend}
          trendValue={card.trendValue}
          subtext={card.subtext}
          subtextTooltip={card.subtextTooltip}
          isSelected={selectedMetricId === card.id}
          onClick={() => onSelectMetric?.(card.id)}
        />
      ))}
    </div>
  );
};
