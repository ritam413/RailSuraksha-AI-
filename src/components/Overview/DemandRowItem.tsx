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
          classes: 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]'
        };
      case 'TDMS_ELECTRICAL':
        return {
          label: 'TDMS OHE',
          classes: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
        };
      case 'SMMS_SIGNAL':
        return {
          label: 'SMMS Signal',
          classes: 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]'
        };
      default:
        return {
          label: department,
          classes: 'bg-[#F1F5F9] text-[#0F172A] border-[#CBD5E1]'
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

  return (
    <div
      onClick={() => onSelect && onSelect(demand)}
      className={`p-4 border-b border-[#D0DFEE] transition-all duration-150 cursor-pointer grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] gap-4 items-center ${
        isSelected
          ? 'bg-[#EFF6FF] border-l-4 border-l-[#2B7FFF] shadow-xs'
          : effectiveSanctioned
          ? 'bg-[#F0FDF4] hover:bg-[#DCFCE7]/40'
          : 'bg-white hover:bg-[#F8FAFC]'
      } ${className}`}
      id={`demand-row-${demand.demandId}`}
    >
      {/* 1. Left Metadata Anchor */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wide border rounded-[4px] font-mono select-none ${deptConfig.classes}`}
            style={{ borderRadius: '4px' }}
          >
            {deptConfig.label}
          </span>
          <UrgencyBadge
            tier={demand.urgencyTier}
            score={demand.urgencyScore}
            showScore={true}
          />
        </div>

        {demand.requiresPowerBlock && (
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] text-[10.5px] font-bold font-mono rounded-[4px] w-fit select-none"
            style={{ borderRadius: '4px' }}
          >
            <span>⚡</span>
            <span>25kV OHE ISOLATION</span>
          </div>
        )}

        <div className="text-[11px] font-mono text-slate-500">
          Ticket: <strong className="text-slate-700 font-semibold">{demand.rawTicketId}</strong>
        </div>
      </div>

      {/* 2. Center Description Column */}
      <div className="flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span
            className="px-1.5 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] font-mono font-bold text-[11px] rounded-[4px]"
            style={{ borderRadius: '4px' }}
          >
            {demand.trackCircuitId}
          </span>
          <span
            className="px-1.5 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] text-slate-600 font-semibold text-[11px] rounded-[4px]"
            style={{ borderRadius: '4px' }}
          >
            {demand.trackLine}
          </span>
          <span className="font-mono text-[#2563EB] font-bold text-[12px]">
            KM {demand.chainageKm?.toFixed ? demand.chainageKm.toFixed(1) : demand.chainageKm}
          </span>
          <span className="text-slate-500 font-medium text-[11.5px] truncate">
            • {demand.stationSection}
          </span>
        </div>

        <p className="text-[13px] text-slate-700 font-medium leading-snug line-clamp-2">
          {demand.defectDescription}
        </p>

        <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
          {demand.assignedMachine ? (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F8FAFC] border border-[#D0DFEE] text-[#1E293B] font-semibold rounded-[4px]"
              style={{ borderRadius: '4px' }}
            >
              <span>🚜</span>
              <span>{demand.assignedMachine}</span>
            </span>
          ) : (
            <span className="italic text-slate-400">No heavy machine required</span>
          )}
          <span className="font-mono text-slate-500">
            +{demand.deadheadTransitMinutes}m deadhead transit
          </span>
        </div>
      </div>

      {/* 3. Right Action & Timing Capsule */}
      <div className="flex flex-col items-start lg:items-end justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2 py-0.5 bg-[#F1F5F9] border border-[#CBD5E1] text-[#0F172A] font-mono text-xs font-bold rounded-[4px] flex items-center gap-1"
            style={{ borderRadius: '4px' }}
          >
            <span>⏱️</span>
            <span>{demand.durationMinutes}m</span>
          </span>

          {demand.status === 'SLOTTED' && (
            <span
              className="px-2 py-0.5 bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] font-mono text-[10.5px] font-bold rounded-[4px]"
              style={{ borderRadius: '4px' }}
            >
              SLOTTED JB-01
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onViewDossier && (
            <button
              type="button"
              onClick={handleDossierClick}
              className="px-2.5 py-1.5 bg-white border border-[#D0DFEE] hover:bg-slate-50 hover:border-slate-400 text-slate-700 text-xs font-semibold rounded-[4px] transition-all cursor-pointer"
              style={{ borderRadius: '4px' }}
            >
              Dossier
            </button>
          )}

          <button
            type="button"
            onClick={handleSanctionClick}
            disabled={effectiveSanctioned || isSanctioning}
            className={`px-3 py-1.5 text-xs font-bold rounded-[4px] transition-all flex items-center gap-1.5 ${
              effectiveSanctioned
                ? 'bg-[#166534] border border-[#14532D] text-white cursor-default'
                : isSanctioning
                ? 'bg-amber-600 border border-amber-700 text-white cursor-wait'
                : 'bg-[#2B7FFF] hover:bg-[#1A6AE8] active:bg-[#1557B0] text-white border border-[#1A6AE8] shadow-xs cursor-pointer'
            }`}
            style={{ borderRadius: '4px' }}
          >
            {isSanctioning ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>SANCTIONING...</span>
              </>
            ) : effectiveSanctioned ? (
              <>
                <span>✓</span>
                <span>SANCTIONED</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>APPROVE & SANCTION</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
