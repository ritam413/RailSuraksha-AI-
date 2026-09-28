'use client';
// src/components/Overview/DemandRowItem.tsx
import React from 'react';
import { MaintenanceDemand } from '@/types/apiContracts';
import { UrgencyBadge } from '../Common/UrgencyBadge';

export interface DemandRowItemProps {
  demand: MaintenanceDemand;
  isSelected?: boolean;
  onSelect?: (demand: MaintenanceDemand) => void;
  onSanction?: (demandId: string) => void;
  onViewDossier?: (demandId: string) => void;
  isSanctioning?: boolean;
  isSanctioned?: boolean;
  className?: string;
}

export const DemandRowItem: React.FC<DemandRowItemProps> = ({
  demand,
  isSelected = false,
  onSelect,
  onSanction,
  onViewDossier,
  isSanctioning = false,
  isSanctioned = false,
  className = ''
}) => {
  const getDeptTagConfig = (department: string) => {
    switch (department) {
      case 'TMS_CIVIL':
        return {
          label: 'TMS Civil',
          classes:
            'bg-[#FEE2E2] dark:bg-rose-950/60 text-[#991B1B] dark:text-rose-200 border-[#FCA5A5] dark:border-rose-800'
        };
      case 'TDMS_ELECTRICAL':
        return {
          label: 'TDMS OHE',
          classes:
            'bg-[#FEF3C7] dark:bg-amber-950/60 text-[#92400E] dark:text-amber-200 border-[#FCD34D] dark:border-amber-800'
        };
      case 'SMMS_SIGNAL':
        return {
          label: 'SMMS Signal',
          classes:
            'bg-[#DBEAFE] dark:bg-sky-950/60 text-[#1E40AF] dark:text-sky-200 border-[#93C5FD] dark:border-sky-800'
        };
      default:
        return {
          label: department,
          classes:
            'bg-[#F1F5F9] dark:bg-slate-800 text-[#0F172A] dark:text-slate-200 border-[#CBD5E1] dark:border-slate-700'
        };
    }
  };

  const deptConfig = getDeptTagConfig(demand.department);
  const effectiveSanctioned = isSanctioned || demand.status === 'SANCTIONED';

  const handleSanctionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (effectiveSanctioned || isSanctioning) return;
    if (onSanction) {
      onSanction(demand.demandId);
    }
  };

  const handleDossierClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDossier) {
      onViewDossier(demand.demandId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect && onSelect(demand);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-selected={isSelected}
      aria-label={`Demand ${demand.rawTicketId}, ${deptConfig.label}, Urgency: ${demand.urgencyTier}`}
      onKeyDown={handleKeyDown}
      onClick={() => onSelect && onSelect(demand)}
      className={`p-4 border-b border-[#D0DFEE] dark:border-slate-800/80 transition-all duration-150 cursor-pointer flex flex-col gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B7FFF] focus-visible:ring-inset ${
        isSelected
          ? 'bg-[#EFF6FF] dark:bg-[#1E293B] border-l-4 border-l-[#2B7FFF] shadow-xs'
          : effectiveSanctioned
          ? 'bg-[#F0FDF4] dark:bg-emerald-950/20 hover:bg-[#DCFCE7]/50 dark:hover:bg-emerald-950/30 border-l-4 border-l-emerald-500'
          : 'bg-white dark:bg-[#0B132B]/60 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50'
      } ${className}`}
      id={`demand-row-${demand.demandId}`}
    >
      {/* ─────────────────────────────────────────────────────────────
          ROW 1: Department, Urgency, OHE Tag & Track Telemetry
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-2.5 flex-wrap w-full">
        {/* Left: Department + Urgency + Power Isolation */}
        <div className="flex flex-row items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide border rounded-[4px] font-mono select-none whitespace-nowrap shrink-0 shadow-2xs ${deptConfig.classes}`}
            style={{ borderRadius: '4px' }}
          >
            {deptConfig.label}
          </span>

          <UrgencyBadge
            tier={demand.urgencyTier}
            score={demand.urgencyScore}
            showScore={true}
          />

          {demand.requiresPowerBlock && (
            <span
              className="inline-flex flex-row items-center gap-1 px-2 py-0.5 bg-[#FEF3C7] dark:bg-amber-950/50 border border-[#FCD34D] dark:border-amber-700/80 text-[#92400E] dark:text-amber-300 text-[10.5px] font-bold font-mono rounded-[4px] select-none whitespace-nowrap shrink-0 shadow-2xs"
              style={{ borderRadius: '4px' }}
            >
              <span className="text-amber-700 dark:text-amber-400">⚡</span>
              <span>25kV OHE ISOLATION</span>
            </span>
          )}
        </div>

        {/* Right: Track Circuit, Track Line, KM Chainage, Duration */}
        <div className="flex flex-row items-center gap-1.5 flex-wrap text-xs">
          <span
            className="px-2 py-0.5 bg-[#F1F5F9] dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-slate-100 font-mono font-bold text-[11px] rounded-[4px] whitespace-nowrap shrink-0 shadow-2xs"
            style={{ borderRadius: '4px' }}
          >
            {demand.trackCircuitId}
          </span>
          <span
            className="px-2 py-0.5 bg-[#F8FAFC] dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono font-semibold text-[11px] rounded-[4px] whitespace-nowrap shrink-0"
            style={{ borderRadius: '4px' }}
          >
            {demand.trackLine}
          </span>
          <span className="font-mono text-[#2563EB] dark:text-[#60A5FA] font-bold text-[11.5px] whitespace-nowrap shrink-0 px-1">
            KM {typeof demand.chainageKm === 'number' ? demand.chainageKm.toFixed(1) : demand.chainageKm}
          </span>
          <span
            className="px-2 py-0.5 bg-[#F1F5F9] dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 font-mono text-[11px] font-bold rounded-[4px] flex flex-row items-center gap-1 whitespace-nowrap shrink-0 shadow-2xs"
            style={{ borderRadius: '4px' }}
          >
            <span className="text-xs">⏱️</span>
            <span>{demand.durationMinutes}m</span>
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 2: Defect Description & Station Section
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 w-full">
        <p className="text-[13.5px] font-semibold text-[#0F172A] dark:text-slate-100 leading-relaxed break-words">
          {demand.defectDescription}
        </p>
        <div className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium truncate">
          Section: <span className="font-semibold text-slate-800 dark:text-slate-200">{demand.stationSection}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ROW 3: Equipment Metadata (Left) & Action Buttons (Right)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-row items-center justify-between gap-3 pt-2 border-t border-[#F0F6FC] dark:border-slate-800 flex-wrap">
        {/* Left Metadata Row */}
        <div className="flex flex-row items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono whitespace-nowrap">
            Ticket: <strong className="text-[#0F172A] dark:text-slate-100 font-bold">{demand.rawTicketId}</strong>
          </span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          {demand.assignedMachine ? (
            <span
              className="inline-flex flex-row items-center gap-1 px-2 py-0.5 bg-[#F8FAFC] dark:bg-slate-800 border border-[#D0DFEE] dark:border-slate-700 text-[#0F172A] dark:text-slate-200 font-semibold text-[11px] rounded-[4px] whitespace-nowrap shrink-0 shadow-2xs"
              style={{ borderRadius: '4px' }}
            >
              <span>🚜</span>
              <span>{demand.assignedMachine}</span>
            </span>
          ) : (
            <span className="italic text-slate-400 dark:text-slate-500 text-[11px] whitespace-nowrap">
              No heavy machine required
            </span>
          )}
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-mono whitespace-nowrap text-slate-500 dark:text-slate-400 text-[11px]">
            +{demand.deadheadTransitMinutes}m deadhead transit
          </span>
        </div>

        {/* Right Action Buttons Row */}
        <div className="flex flex-row items-center gap-2 shrink-0">
          {onViewDossier && (
            <button
              type="button"
              onClick={handleDossierClick}
              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#D0DFEE] dark:border-slate-600 hover:bg-[#F0F6FC] dark:hover:bg-slate-700 text-[#0F172A] dark:text-slate-200 text-xs font-semibold rounded-[4px] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B7FFF]"
              style={{ borderRadius: '4px' }}
            >
              Dossier
            </button>
          )}

          <button
            type="button"
            onClick={handleSanctionClick}
            disabled={effectiveSanctioned || isSanctioning}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-[4px] transition-all flex flex-row items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B7FFF] focus-visible:ring-offset-1 ${
              effectiveSanctioned
                ? 'bg-[#166534] dark:bg-emerald-700 border border-[#14532D] dark:border-emerald-600 text-white cursor-default shadow-xs'
                : isSanctioning
                ? 'bg-amber-600 border border-amber-700 text-white cursor-wait shadow-xs'
                : 'bg-[#2B7FFF] hover:bg-[#1A6AE8] active:bg-[#1557B0] text-white border border-[#1A6AE8] shadow-sm cursor-pointer'
            }`}
            style={{ borderRadius: '4px' }}
          >
            {effectiveSanctioned ? (
              <>
                <span className="font-bold">✓</span>
                <span>SANCTIONED</span>
              </>
            ) : isSanctioning ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-[2px] animate-spin" />
                <span>SANCTIONING...</span>
              </>
            ) : (
              <>
                <span className="text-white">⚡</span>
                <span>APPROVE & SANCTION</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
