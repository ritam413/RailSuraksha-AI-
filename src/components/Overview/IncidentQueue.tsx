'use client';

// src/components/Overview/IncidentQueue.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Card } from '../Common/Card';
import { DemandRowItem } from './DemandRowItem';
import { MOCK_MAINTENANCE_DEMANDS, MOCK_DEMANDS } from '@/lib/mockData';
import { MaintenanceDemand, IncidentRecord, DepartmentCode, UrgencyTier } from '@/types/apiContracts';

export interface IncidentQueueProps {
  demands?: MaintenanceDemand[];
  selectedDemandId?: string;
  onSelectDemand?: (demand: MaintenanceDemand) => void;
  onSanctionDemand?: (demandId: string) => void;
  onFilterChange?: (filter: string) => void;
  onViewDossier?: (demandId: string) => void;
  // Legacy backward-compatibility props for page.tsx compatibility
  incidents?: IncidentRecord[];
  selectedIncidentId?: string;
  onSelectIncident?: (incident: IncidentRecord) => void;
  onApproveAction?: (incidentId: string) => void;
  className?: string;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  demands: propDemands,
  selectedDemandId: propSelectedDemandId,
  onSelectDemand,
  onSanctionDemand,
  onFilterChange,
  onViewDossier,
  // Legacy props
  incidents,
  selectedIncidentId,
  onSelectIncident,
  onApproveAction,
  className = ''
}) => {
  // Use provided demands or fallback to MOCK_MAINTENANCE_DEMANDS
  const initialDemands = useMemo(() => {
    if (propDemands && propDemands.length > 0) {
      return propDemands;
    }
    return MOCK_MAINTENANCE_DEMANDS || MOCK_DEMANDS;
  }, [propDemands]);

  const [activeDepartment, setActiveDepartment] = useState<'ALL' | DepartmentCode>('ALL');
  const [activePriority, setActivePriority] = useState<'ALL' | 'P1_CRITICAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'URGENCY_DESC' | 'CHAINAGE_ASC' | 'DURATION_DESC'>('URGENCY_DESC');
  const [selectedId, setSelectedId] = useState<string>(
    propSelectedDemandId || selectedIncidentId || (initialDemands[0]?.demandId ?? 'DEM-TMS-01')
  );

  const [sanctionedIds, setSanctionedIds] = useState<Set<string>>(new Set());
  const [sanctioningIds, setSanctioningIds] = useState<Set<string>>(new Set());
  const [isJointModalOpen, setIsJointModalOpen] = useState(false);
  const [isFdeModalOpen, setIsFdeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ message: string; type: 'info' | 'success' } | null>(null);

  const showToast = useCallback((message: string, type: 'info' | 'success' = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Department counts calculated from dataset
  const counts = useMemo(() => {
    return {
      all: initialDemands.length,
      tms: initialDemands.filter((d) => d.department === 'TMS_CIVIL').length,
      tdms: initialDemands.filter((d) => d.department === 'TDMS_ELECTRICAL').length,
      smms: initialDemands.filter((d) => d.department === 'SMMS_SIGNAL').length,
      p1: initialDemands.filter((d) => d.urgencyTier === 'P1_CRITICAL').length
    };
  }, [initialDemands]);

  // Filtered and Sorted Demands
  const filteredDemands = useMemo(() => {
    let result = initialDemands.filter((d) => {
      if (activeDepartment !== 'ALL' && d.department !== activeDepartment) {
        return false;
      }
      if (activePriority === 'P1_CRITICAL' && d.urgencyTier !== 'P1_CRITICAL') {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const match =
          d.defectDescription.toLowerCase().includes(query) ||
          d.rawTicketId.toLowerCase().includes(query) ||
          d.trackCircuitId.toLowerCase().includes(query) ||
          d.trackLine.toLowerCase().includes(query) ||
          d.stationSection.toLowerCase().includes(query) ||
          (d.assignedMachine && d.assignedMachine.toLowerCase().includes(query)) ||
          d.demandId.toLowerCase().includes(query);
        if (!match) return false;
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      if (sortOrder === 'URGENCY_DESC') return (b.urgencyScore ?? 0) - (a.urgencyScore ?? 0);
      if (sortOrder === 'CHAINAGE_ASC') return (a.chainageKm ?? 0) - (b.chainageKm ?? 0);
      if (sortOrder === 'DURATION_DESC') return (b.durationMinutes ?? 0) - (a.durationMinutes ?? 0);
      return 0;
    });

    return result;
  }, [initialDemands, activeDepartment, activePriority, searchQuery, sortOrder]);

  // Check co-location opportunity on TC-03 (UP_SLOW)
  const coLocatedDemands = useMemo(() => {
    return initialDemands.filter((d) => d.trackCircuitId === 'TC-03');
  }, [initialDemands]);

  const hasUnsanctionedCoLocation = useMemo(() => {
    return coLocatedDemands.some((d) => !sanctionedIds.has(d.demandId) && d.status !== 'SANCTIONED');
  }, [coLocatedDemands, sanctionedIds]);

  // Selection Handler (with dual-mode support)
  const handleRowSelect = (demand: MaintenanceDemand) => {
    setSelectedId(demand.demandId);
    if (onSelectDemand) {
      onSelectDemand(demand);
    }
    if (onSelectIncident) {
      // Map MaintenanceDemand to backward-compatible IncidentRecord
      const mappedIncident: IncidentRecord = {
        incidentId: demand.demandId,
        timestamp: new Date().toISOString().substring(11, 19) + ' IST',
        sourceCameraId: `CAM-${demand.trackCircuitId}`,
        cameraType: demand.requiresPowerBlock ? 'OHE' : 'LOCO_CAB',
        severityCategory:
          demand.urgencyTier === 'P1_CRITICAL'
            ? 'CRITICAL'
            : demand.urgencyTier === 'P2_SCHEDULED'
            ? 'MODERATE'
            : 'LOW',
        severityScore: demand.urgencyScore,
        assignedAgent: 'SectionDispatchAgent',
        status: sanctionedIds.has(demand.demandId) ? 'RESOLVED' : 'PENDING_APPROVAL',
        boundingBoxes: [
          {
            class: demand.department === 'TMS_CIVIL' ? 'RAIL_FRACTURE' : 'BOULDER',
            confidence: demand.urgencyScore,
            x: 100,
            y: 100,
            width: 80,
            height: 80,
            estimatedDistanceMeters: Math.round(demand.chainageKm * 10)
          }
        ]
      };
      onSelectIncident(mappedIncident);
    }
  };

  // Sanction Demand Handler (with optimistic updates and parent callback)
  const handleSanctionDemand = (demandId: string) => {
    const demand = initialDemands.find((d) => d.demandId === demandId);
    setSanctioningIds((prev) => new Set(prev).add(demandId));

    if (demand?.trackCircuitId === 'TC-03' && coLocatedDemands.length > 1) {
      showToast(`⚡ Multi-Department Co-Location on TC-03: Checking Joint Bundling...`, 'info');
    }

    setTimeout(() => {
      setSanctioningIds((prev) => {
        const next = new Set(prev);
        next.delete(demandId);
        return next;
      });
      setSanctionedIds((prev) => new Set(prev).add(demandId));
      showToast(`✓ Block Sanctioned for ${demand?.rawTicketId || demandId} (${demand?.department || 'TMS'})`, 'success');
    }, 600);

    if (onSanctionDemand) {
      onSanctionDemand(demandId);
    }
    if (onApproveAction) {
      onApproveAction(demandId);
    }
  };

  // Joint Block Sanction Handler
  const handleExecuteJointSanction = () => {
    coLocatedDemands.forEach((d) => {
      setSanctionedIds((prev) => new Set(prev).add(d.demandId));
      if (onSanctionDemand) onSanctionDemand(d.demandId);
      if (onApproveAction) onApproveAction(d.demandId);
    });
    setIsJointModalOpen(false);
    showToast(`✓ Statutory Form T/409 Disseminated: Joint Block JB-01 Activated (195m Saved)!`, 'success');
  };

  return (
    <Card
      title="Multi-Department Maintenance Demand Queue"
      className={className}
      action={
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2.5 py-0.5 bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] text-[11px] font-bold font-mono rounded-[4px]"
            style={{ borderRadius: '4px' }}
          >
            {filteredDemands.length} Demands
          </span>
          <button
            type="button"
            onClick={() => setIsFdeModalOpen(true)}
            className="px-2 py-1 bg-white border border-[#D0DFEE] hover:bg-[#F0F6FC] text-[#2563EB] text-xs font-semibold rounded-[4px] transition-all flex items-center gap-1 cursor-pointer"
            style={{ borderRadius: '4px' }}
          >
            <span>🛡️ FDE Audit</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div
            className={`p-2.5 px-3.5 rounded-[4px] border text-xs font-mono flex items-center justify-between transition-all duration-200 ${
              toastMessage.type === 'success'
                ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#166534]'
                : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
            }`}
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current animate-pulse shrink-0" />
              <span>{toastMessage.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-500 hover:text-slate-800 font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Strip & Search Header */}
        <div className="flex flex-col gap-3 border-b border-[#D0DFEE] pb-3">
          {/* Top Search & Sort Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket, line, defect, or machine..."
                className="w-full h-8 pl-8 pr-3 text-xs bg-[#F8FAFC] border border-[#D0DFEE] rounded-[4px] text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#2B7FFF] focus:outline-none transition-all"
                style={{ borderRadius: '4px' }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-8 px-2.5 bg-[#F8FAFC] border border-[#D0DFEE] rounded-[4px] text-xs text-slate-700 font-medium focus:border-[#2B7FFF] focus:outline-none cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                <option value="URGENCY_DESC">Sort: Urgency Score (High to Low)</option>
                <option value="CHAINAGE_ASC">Sort: Chainage KM (Ascending)</option>
                <option value="DURATION_DESC">Sort: Duration (Longest First)</option>
              </select>
            </div>
          </div>

          {/* Department Filter Tabs & Priority Compound Toggle */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 pt-1">
            {/* Department Tabs */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setActiveDepartment('ALL');
                  if (onFilterChange) onFilterChange('ALL');
                }}
                className={`px-3 py-1 text-xs font-bold font-mono transition-all rounded-[4px] flex items-center gap-1.5 cursor-pointer ${
                  activeDepartment === 'ALL'
                    ? 'bg-[#0F172A] text-white shadow-xs'
                    : 'bg-[#F8FAFC] text-slate-700 hover:bg-slate-200 border border-[#D0DFEE]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <span>All Demands</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-[4px] font-mono ${
                    activeDepartment === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  {counts.all}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDepartment('TMS_CIVIL');
                  if (onFilterChange) onFilterChange('TMS_CIVIL');
                }}
                className={`px-3 py-1 text-xs font-bold font-mono transition-all rounded-[4px] flex items-center gap-1.5 cursor-pointer ${
                  activeDepartment === 'TMS_CIVIL'
                    ? 'bg-[#991B1B] text-white shadow-xs'
                    : 'bg-[#FEE2E2]/60 text-[#991B1B] hover:bg-[#FEE2E2] border border-[#FCA5A5]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <span>TMS Civil</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-[4px] font-mono ${
                    activeDepartment === 'TMS_CIVIL' ? 'bg-white/20 text-white' : 'bg-[#FCA5A5] text-[#991B1B]'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  {counts.tms}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDepartment('TDMS_ELECTRICAL');
                  if (onFilterChange) onFilterChange('TDMS_ELECTRICAL');
                }}
                className={`px-3 py-1 text-xs font-bold font-mono transition-all rounded-[4px] flex items-center gap-1.5 cursor-pointer ${
                  activeDepartment === 'TDMS_ELECTRICAL'
                    ? 'bg-[#92400E] text-white shadow-xs'
                    : 'bg-[#FEF3C7]/60 text-[#92400E] hover:bg-[#FEF3C7] border border-[#FCD34D]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <span>TDMS OHE</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-[4px] font-mono ${
                    activeDepartment === 'TDMS_ELECTRICAL' ? 'bg-white/20 text-white' : 'bg-[#FCD34D] text-[#92400E]'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  {counts.tdms}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveDepartment('SMMS_SIGNAL');
                  if (onFilterChange) onFilterChange('SMMS_SIGNAL');
                }}
                className={`px-3 py-1 text-xs font-bold font-mono transition-all rounded-[4px] flex items-center gap-1.5 cursor-pointer ${
                  activeDepartment === 'SMMS_SIGNAL'
                    ? 'bg-[#1E40AF] text-white shadow-xs'
                    : 'bg-[#DBEAFE]/60 text-[#1E40AF] hover:bg-[#DBEAFE] border border-[#93C5FD]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <span>SMMS Signal</span>
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-[4px] font-mono ${
                    activeDepartment === 'SMMS_SIGNAL' ? 'bg-white/20 text-white' : 'bg-[#93C5FD] text-[#1E40AF]'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  {counts.smms}
                </span>
              </button>
            </div>

            {/* Priority Compound Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mr-1 select-none">
                Priority:
              </span>
              <button
                type="button"
                onClick={() => setActivePriority('ALL')}
                className={`px-2.5 py-1 text-xs font-bold rounded-[4px] transition-all cursor-pointer ${
                  activePriority === 'ALL'
                    ? 'bg-[#0F172A] text-white'
                    : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200 border border-[#D0DFEE]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                All Tiers
              </button>

              <button
                type="button"
                onClick={() => setActivePriority(activePriority === 'P1_CRITICAL' ? 'ALL' : 'P1_CRITICAL')}
                className={`px-2.5 py-1 text-xs font-bold rounded-[4px] transition-all flex items-center gap-1.5 cursor-pointer ${
                  activePriority === 'P1_CRITICAL'
                    ? 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                    : 'bg-[#F8FAFC] text-slate-600 hover:bg-slate-200 border border-[#D0DFEE]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
                <span>P1 Critical Only</span>
                <span
                  className="px-1 text-[10px] font-mono bg-[#FEE2E2] text-[#991B1B] rounded-[4px]"
                  style={{ borderRadius: '4px' }}
                >
                  {counts.p1}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Co-Location Joint Block Opportunity Callout Banner */}
        {hasUnsanctionedCoLocation && (
          <div
            className="p-3 bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] rounded-[4px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
            style={{ borderRadius: '4px' }}
          >
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-base shrink-0">⚡</span>
              <div>
                <strong>Joint Bundling Opportunity:</strong> 3 Requisitions share Track Circuit{' '}
                <strong className="font-mono bg-[#FEF3C7] px-1 py-0.5 rounded-[4px] border border-[#FCD34D]">
                  TC-03 (UP_SLOW)
                </strong>
                . CP-SAT bundling prevents separate possessions and saves 195 min downtime.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsJointModalOpen(true)}
              className="px-3 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold rounded-[4px] transition-all shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              style={{ borderRadius: '4px' }}
            >
              <span>⚡</span>
              <span>Sanction Joint Block (JB-01)</span>
            </button>
          </div>
        )}

        {/* Demand Rows Container */}
        <div className="border border-[#D0DFEE] rounded-[4px] overflow-hidden bg-white divide-y divide-[#D0DFEE]" style={{ borderRadius: '4px' }}>
          {filteredDemands.length === 0 ? (
            <div className="py-12 px-4 text-center bg-[#F0F6FC]">
              <div className="text-3xl mb-2">📭</div>
              <h4 className="text-xs font-bold text-[#0F172A]">No matching maintenance demands found</h4>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing your search query or switching department / priority filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveDepartment('ALL');
                  setActivePriority('ALL');
                  setSearchQuery('');
                }}
                className="mt-3 px-3 py-1 bg-white border border-[#D0DFEE] hover:bg-slate-100 text-xs font-semibold text-[#2563EB] rounded-[4px] cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredDemands.map((demand) => {
              const isSelected = selectedId === demand.demandId;
              const isSanctioned = sanctionedIds.has(demand.demandId) || demand.status === 'SANCTIONED';
              const isSanctioning = sanctioningIds.has(demand.demandId);

              return (
                <DemandRowItem
                  key={demand.demandId}
                  demand={demand}
                  isSelected={isSelected}
                  isSanctioned={isSanctioned}
                  isSanctioning={isSanctioning}
                  onSelect={handleRowSelect}
                  onSanction={handleSanctionDemand}
                  onViewDossier={onViewDossier || ((id) => showToast(`📋 Opening Decision Dossier for ${demand.rawTicketId}...`))}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Joint Block Modal */}
      {isJointModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            className="bg-white border border-[#D0DFEE] rounded-[6px] max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{ borderRadius: '6px' }}
          >
            {/* Modal Header */}
            <div className="p-4 bg-[#F8FAFC] border-b border-[#D0DFEE] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <span className="text-amber-600 text-base">⚡</span>
                <span>Joint Shadow Block Sanction: JB-2026-0926-01 (TC-03)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsJointModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-slate-600 leading-relaxed">
                The IRIS AI Solver bundled 3 maintenance requisitions onto{' '}
                <strong className="text-slate-900">Track Circuit TC-03 (UP_SLOW)</strong> during the nocturnal white window (
                <strong className="text-slate-900">01:30 – 04:45 IST</strong>).
              </p>

              {/* Stat Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[4px] text-center" style={{ borderRadius: '4px' }}>
                  <div className="text-lg font-bold font-mono text-[#1E40AF]">195 min</div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Downtime Saved</div>
                </div>
                <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[4px] text-center" style={{ borderRadius: '4px' }}>
                  <div className="text-lg font-bold font-mono text-[#1E40AF]">3 Demands</div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Bundled in Single Slot</div>
                </div>
                <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-[4px] text-center" style={{ borderRadius: '4px' }}>
                  <div className="text-lg font-bold font-mono text-[#1E40AF]">0 min</div>
                  <div className="text-[11px] text-slate-600 font-semibold mt-0.5">Passenger Delay</div>
                </div>
              </div>

              {/* Bundled Demands List */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                  Bundled Department Requisitions:
                </h4>

                {coLocatedDemands.map((item) => (
                  <div
                    key={item.demandId}
                    className="p-3 bg-[#F8FAFC] border border-[#D0DFEE] rounded-[4px] space-y-1.5"
                    style={{ borderRadius: '4px' }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-[4px] border ${
                            item.department === 'TMS_CIVIL'
                              ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]'
                              : item.department === 'TDMS_ELECTRICAL'
                              ? 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
                              : 'bg-[#DBEAFE] text-[#1E40AF] border-[#93C5FD]'
                          }`}
                          style={{ borderRadius: '4px' }}
                        >
                          {item.department.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold font-mono rounded-[4px] border ${
                            item.urgencyTier === 'P1_CRITICAL'
                              ? 'bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]'
                              : 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]'
                          }`}
                          style={{ borderRadius: '4px' }}
                        >
                          {item.urgencyTier} ({(item.urgencyScore * 100).toFixed(0)}%)
                        </span>
                        {item.requiresPowerBlock && (
                          <span
                            className="px-2 py-0.5 text-[10px] font-bold font-mono bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D] rounded-[4px]"
                            style={{ borderRadius: '4px' }}
                          >
                            ⚡ 25kV OHE Isolation
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-700">⏱️ {item.durationMinutes}m</span>
                    </div>

                    <p className="text-xs text-slate-800 font-medium">{item.defectDescription}</p>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                      <span>Machine: {item.assignedMachine || 'Gang Unit'}</span>
                      <span>•</span>
                      <span>Ticket: {item.rawTicketId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#F8FAFC] border-t border-[#D0DFEE] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsJointModalOpen(false)}
                className="px-3 py-1.5 bg-white border border-[#D0DFEE] hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-[4px] cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteJointSanction}
                className="px-4 py-1.5 bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold rounded-[4px] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                <span>✓</span>
                <span>Transmit Joint Sanction Form T/409</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FDE Audit Modal */}
      {isFdeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            className="bg-white border border-[#D0DFEE] rounded-[6px] max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            style={{ borderRadius: '6px' }}
          >
            <div className="p-4 bg-[#F8FAFC] border-b border-[#D0DFEE] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <span>🛡️ FDE Production Bottleneck & Architecture Audit</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFdeModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-slate-600">
                Forward Deployed Engineer verification for Mission-Critical Railway Operations Control Center reliability.
              </p>

              <div className="border border-[#D0DFEE] rounded-[4px] overflow-hidden text-xs" style={{ borderRadius: '4px' }}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#D0DFEE]">
                      <th className="p-2.5 font-bold text-slate-700">#</th>
                      <th className="p-2.5 font-bold text-slate-700">Production Risk</th>
                      <th className="p-2.5 font-bold text-slate-700">Root Cause</th>
                      <th className="p-2.5 font-bold text-slate-700">FDE Hardened Remedy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D0DFEE]">
                    <tr>
                      <td className="p-2.5 font-mono font-bold">1</td>
                      <td className="p-2.5 font-semibold text-[#991B1B]">Isolated Single-Demand Sanction</td>
                      <td className="p-2.5 text-slate-600">Sanctioning single demands wastes nocturnal lull slots.</td>
                      <td className="p-2.5 font-semibold text-[#166534]">Co-location detector + CP-SAT Joint Bundling.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">2</td>
                      <td className="p-2.5 font-semibold text-[#92400E]">25kV OHE Power Hazard</td>
                      <td className="p-2.5 text-slate-600">Unchecked electrical blocks risk electrocution.</td>
                      <td className="p-2.5 font-semibold text-[#166534]">Enforce ⚡ 25kV OHE badge + TPC lockout.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">3</td>
                      <td className="p-2.5 font-semibold text-[#1E40AF]">1D Filter Collision</td>
                      <td className="p-2.5 text-slate-600">P1 tab clearing department selection context.</td>
                      <td className="p-2.5 font-semibold text-[#166534]">Independent 2D Dept + Priority filters.</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-mono font-bold">4</td>
                      <td className="p-2.5 font-semibold text-slate-700">Legacy Prop Breakage</td>
                      <td className="p-2.5 text-slate-600">page.tsx passes legacy IncidentRecord props.</td>
                      <td className="p-2.5 font-semibold text-[#166534]">Dual-mode adapter layer with fallback.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 bg-[#F8FAFC] border-t border-[#D0DFEE] flex justify-end">
              <button
                type="button"
                onClick={() => setIsFdeModalOpen(false)}
                className="px-3.5 py-1.5 bg-[#2B7FFF] hover:bg-[#1A6AE8] text-white text-xs font-bold rounded-[4px] cursor-pointer"
                style={{ borderRadius: '4px' }}
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
