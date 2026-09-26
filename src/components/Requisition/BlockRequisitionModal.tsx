// src/components/Requisition/BlockRequisitionModal.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  DepartmentCode,
  UrgencyTier,
  TrackCircuitId,
  TrackLineCode,
  MaintenanceDemand
} from '@/types/apiContracts';
import { playActionConfirmedChime } from '@/lib/audioAlerts';

interface BlockRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitDemand: (demand: MaintenanceDemand) => void;
  initialDepartment?: DepartmentCode;
}

const DEPARTMENT_PRESETS: Record<
  DepartmentCode,
  {
    title: string;
    badgeColor: string;
    icon: string;
    statutoryNotice: string;
    defaultMachine: string;
    defaultDuration: number;
    requiresPowerBlock: boolean;
    sampleDefects: string[];
  }
> = {
  TDMS_ELECTRICAL: {
    title: 'TDMS — Electrical Traction (TRD)',
    badgeColor: '#E17055',
    icon: '⚡',
    statutoryNotice: 'ACTM Vol II (25kV AC Power Block & Double Earthing)',
    defaultMachine: 'OHE Hydraulic Ladder Tower Wagon #60515',
    defaultDuration: 90,
    requiresPowerBlock: true,
    sampleDefects: [
      '25kV AC Contact wire wear exceeding 20% limit at Mast 14/18.',
      'Catenary dropper slack and insulator flashover decontamination.',
      'Neutral section replacement and cantilever insulator overhaul.'
    ]
  },
  SMMS_SIGNAL: {
    title: 'SMMS — Signal & Telecom (S&T)',
    badgeColor: '#00B894',
    icon: '🟢',
    statutoryNotice: 'Form S&T/T-351 (Electronic Interlocking Disconnection)',
    defaultMachine: 'Signal Gang Maintenance Tool Van',
    defaultDuration: 60,
    requiresPowerBlock: false,
    sampleDefects: [
      'Point Machine SW-04 motor stroke calibration (>4.8s delay).',
      'Audio Frequency Track Circuit (AFTC) tuning unit impedance drift.',
      'Dual-detection digital axle counter reset & cable resistance testing.'
    ]
  },
  TMS_CIVIL: {
    title: 'TMS — Civil Engineering (P-Way)',
    badgeColor: '#2B7FFF',
    icon: '🛤️',
    statutoryNotice: 'IRPWM 2020 (Track Tamping & Rail Renewal Mandate)',
    defaultMachine: 'CSM Continuous Tamping Machine #5109',
    defaultDuration: 120,
    requiresPowerBlock: false,
    sampleDefects: [
      'USFD detected 35mm transverse rail fracture at Welded Joint W-42.',
      'Track Geometry Index (TGI) alignment degradation at KM 14.220.',
      'Ballast deficiency and switch diamond crossing renewal.'
    ]
  }
};

const TRACK_CIRCUITS: { id: TrackCircuitId; section: string; kmStart: number; kmEnd: number }[] = [
  { id: 'TC-01', section: 'CSMT - Byculla', kmStart: 0.0, kmEnd: 4.8 },
  { id: 'TC-02', section: 'Byculla - Dadar', kmStart: 4.8, kmEnd: 9.5 },
  { id: 'TC-03', section: 'Dadar - Kurla', kmStart: 9.5, kmEnd: 15.4 },
  { id: 'TC-04', section: 'Kurla - Ghatkopar', kmStart: 15.4, kmEnd: 21.0 },
  { id: 'TC-05', section: 'Ghatkopar - Thane', kmStart: 21.0, kmEnd: 34.0 },
  { id: 'TC-06', section: 'Thane - Kalyan', kmStart: 34.0, kmEnd: 54.0 }
];

export const BlockRequisitionModal: React.FC<BlockRequisitionModalProps> = ({
  isOpen,
  onClose,
  onSubmitDemand,
  initialDepartment = 'TDMS_ELECTRICAL'
}) => {
  const [department, setDepartment] = useState<DepartmentCode>(initialDepartment);
  const [trackCircuitId, setTrackCircuitId] = useState<TrackCircuitId>('TC-03');
  const [trackLine, setTrackLine] = useState<TrackLineCode>('UP_SLOW');
  const [chainageKm, setChainageKm] = useState<string>('14.8');
  const [urgencyTier, setUrgencyTier] = useState<UrgencyTier>('P2_SCHEDULED');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [requiresPowerBlock, setRequiresPowerBlock] = useState<boolean>(true);
  const [assignedMachine, setAssignedMachine] = useState<string>('OHE Hydraulic Ladder Tower Wagon #60515');
  const [defectDescription, setDefectDescription] = useState<string>(
    '25kV AC Catenary dropper slack and contact wire wear exceeding 20% limit at Mast 14/18.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync defaults when department changes
  const handleDepartmentChange = (dept: DepartmentCode) => {
    setDepartment(dept);
    setValidationError(null);
    const preset = DEPARTMENT_PRESETS[dept];
    setAssignedMachine(preset.defaultMachine);
    setDurationMinutes(preset.defaultDuration);
    setRequiresPowerBlock(preset.requiresPowerBlock);
    setDefectDescription(preset.sampleDefects[0]);
    if (dept === 'TMS_CIVIL') {
      setUrgencyTier('P1_CRITICAL');
      setChainageKm('14.2');
    } else if (dept === 'SMMS_SIGNAL') {
      setUrgencyTier('P2_SCHEDULED');
      setChainageKm('15.1');
    } else {
      setUrgencyTier('P2_SCHEDULED');
      setChainageKm('14.8');
    }
  };

  // Dynamic AI Feasibility & Bundling Analysis
  const aiFeasibility = useMemo(() => {
    const selectedCircuit = TRACK_CIRCUITS.find((c) => c.id === trackCircuitId);
    const sectionName = selectedCircuit?.section || 'Dadar - Kurla';

    let estimatedSavingsPct = 38.4;
    let whiteCorridorSlot = '01:30 - 04:45 AM (195m window)';
    let bundlingWith = 'Co-located with TMS Track Tamping & SMMS Point SW-04';

    if (department === 'TDMS_ELECTRICAL') {
      bundlingWith = 'Nests Civil tamping & S&T overhaul under de-energized 25kV OHE';
    } else if (department === 'SMMS_SIGNAL') {
      bundlingWith = 'Bundles into TDMS Power Block on TC-03 with 0 secondary traffic delay';
    } else {
      bundlingWith = 'Bundles with TDMS Tower Wagon #60515 on Up Slow line';
    }

    return {
      sectionName,
      whiteCorridorSlot,
      bundlingWith,
      estimatedSavingsPct,
      earthingBufferMin: requiresPowerBlock ? 10 : 0,
      safetyClearanceMin: 15
    };
  }, [trackCircuitId, department, requiresPowerBlock]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const selectedCircuit = TRACK_CIRCUITS.find((c) => c.id === trackCircuitId);
    if (!selectedCircuit) {
      setValidationError('Please select a valid track circuit.');
      return;
    }

    const trimmedKm = chainageKm.trim();
    const parsedKm = parseFloat(trimmedKm);
    if (!trimmedKm || Number.isNaN(parsedKm) || !Number.isFinite(parsedKm)) {
      setValidationError('Please enter a valid numeric chainage KM.');
      return;
    }

    if (parsedKm < selectedCircuit.kmStart || parsedKm > selectedCircuit.kmEnd) {
      setValidationError(
        `Chainage KM (${parsedKm.toFixed(2)}) must be within circuit ${selectedCircuit.id} range (${selectedCircuit.kmStart.toFixed(1)} - ${selectedCircuit.kmEnd.toFixed(1)} KM).`
      );
      return;
    }

    setIsSubmitting(true);

    const generatedId = `DEM-${department.split('_')[0]}-${Date.now().toString().slice(-4)}`;
    const ticketId = `CR-${department.split('_')[0]}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newDemand: MaintenanceDemand = {
      demandId: generatedId,
      department,
      trackCircuitId,
      trackLine,
      stationSection: `${aiFeasibility.sectionName} ${trackLine.replace('_', ' ')}`,
      chainageKm: parsedKm,
      urgencyTier,
      urgencyScore: urgencyTier === 'P1_CRITICAL' ? 0.94 : urgencyTier === 'P2_SCHEDULED' ? 0.72 : 0.45,
      durationMinutes: Number(durationMinutes),
      requiresPowerBlock,
      assignedMachine,
      deadheadTransitMinutes: 15,
      status: 'SLOTTED',
      rawTicketId: ticketId,
      defectDescription
    };

    setTimeout(() => {
      playActionConfirmedChime();
      onSubmitDemand(newDemand);
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        onClose();
      }, 1400);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="bg-white w-full max-w-3xl border border-[#D0DFEE] shadow-2xl overflow-hidden transition-all my-8 animate-in fade-in duration-200"
        style={{ borderRadius: '16px' }}
      >
        {/* Header Strip */}
        <div className="bg-[#0F172A] px-6 py-4 flex items-center justify-between text-white border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <span className="text-xl">📋</span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold tracking-tight">Direct Block Requisition Portal</h2>
                <span className="text-[10px] uppercase font-bold bg-[#2B7FFF] text-white px-2 py-0.5" style={{ borderRadius: '4px' }}>
                  Auto-BDMS v3.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Submit departmental block & disconnection demands directly to the CP-SAT Corridor Optimizer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors text-lg font-bold"
            title="Close"
          >
            ✕
          </button>
        </div>

        {submitSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900">Block Demand Registered Successfully!</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your requisition has been ingested, triaged by the AI Engine, and queued for multi-department shadow block bundling on the Corridor String Chart.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 1. Department Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                1. Select Requesting Department
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(['TDMS_ELECTRICAL', 'SMMS_SIGNAL', 'TMS_CIVIL'] as DepartmentCode[]).map((dept) => {
                  const preset = DEPARTMENT_PRESETS[dept];
                  const isSelected = department === dept;
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => handleDepartmentChange(dept)}
                      className={`p-3 text-left border transition-all ${
                        isSelected
                          ? 'border-[#2B7FFF] bg-[#E6F0FA] text-[#0F172A] shadow-xs'
                          : 'border-[#D0DFEE] bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">{preset.icon}</span>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 text-white"
                          style={{ backgroundColor: preset.badgeColor, borderRadius: '4px' }}
                        >
                          {dept.split('_')[0]}
                        </span>
                      </div>
                      <div className="text-xs font-bold truncate">{preset.title.split('—')[1]}</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{preset.statutoryNotice.split('(')[0]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Corridor & Spatial Chainage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Station Section / Circuit</label>
                <select
                  value={trackCircuitId}
                  onChange={(e) => setTrackCircuitId(e.target.value as TrackCircuitId)}
                  className="w-full text-xs bg-white border border-[#D0DFEE] p-2 text-slate-900 focus:border-[#2B7FFF] focus:outline-hidden"
                  style={{ borderRadius: '4px' }}
                >
                  {TRACK_CIRCUITS.map((tc) => (
                    <option key={tc.id} value={tc.id}>
                      {tc.id} ({tc.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Track Line</label>
                <select
                  value={trackLine}
                  onChange={(e) => setTrackLine(e.target.value as TrackLineCode)}
                  className="w-full text-xs bg-white border border-[#D0DFEE] p-2 text-slate-900 focus:border-[#2B7FFF] focus:outline-hidden"
                  style={{ borderRadius: '4px' }}
                >
                  <option value="UP_SLOW">UP SLOW (CSMT Inbound)</option>
                  <option value="DOWN_SLOW">DOWN SLOW (Kalyan Outbound)</option>
                  <option value="UP_FAST">UP FAST (Through Inbound)</option>
                  <option value="DOWN_FAST">DOWN FAST (Through Outbound)</option>
                  <option value="5TH_LINE">5th Line (Freight / Mail)</option>
                  <option value="6TH_LINE">6th Line (Suburban Dedicated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">KM Linear Chainage</label>
                <input
                  type="number"
                  step="0.05"
                  value={chainageKm}
                  onChange={(e) => {
                    setChainageKm(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className={`w-full text-xs bg-white border p-2 text-slate-900 focus:outline-hidden ${
                    validationError ? 'border-rose-500 focus:border-rose-600' : 'border-[#D0DFEE] focus:border-[#2B7FFF]'
                  }`}
                  style={{ borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div
                className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 text-xs flex items-center space-x-2 animate-in fade-in duration-150"
                style={{ borderRadius: '4px' }}
              >
                <span className="font-bold">⚠️ Error:</span>
                <span>{validationError}</span>
              </div>
            )}

            {/* 3. Operational Requirements & Machine Roster */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requested Duration (Mins)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="15"
                    max="360"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 60)}
                    className="w-full text-xs bg-white border border-[#D0DFEE] p-2 text-slate-900 focus:border-[#2B7FFF] focus:outline-hidden"
                    style={{ borderRadius: '4px' }}
                  />
                  <span className="text-xs text-slate-500 whitespace-nowrap">mins</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urgency Priority Tier</label>
                <select
                  value={urgencyTier}
                  onChange={(e) => setUrgencyTier(e.target.value as UrgencyTier)}
                  className="w-full text-xs bg-white border border-[#D0DFEE] p-2 text-slate-900 focus:border-[#2B7FFF] focus:outline-hidden"
                  style={{ borderRadius: '4px' }}
                >
                  <option value="P1_CRITICAL">P1 CRITICAL (Immediate / 24h)</option>
                  <option value="P2_SCHEDULED">P2 SCHEDULED (Within 7 Days)</option>
                  <option value="P3_ROUTINE">P3 ROUTINE (Monthly Cycle)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">25kV AC Power Block?</label>
                <button
                  type="button"
                  onClick={() => setRequiresPowerBlock(!requiresPowerBlock)}
                  className={`w-full text-xs p-2 font-bold border transition-colors flex items-center justify-center space-x-2 ${
                    requiresPowerBlock
                      ? 'bg-amber-500 text-white border-amber-600'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                  style={{ borderRadius: '4px' }}
                >
                  <span>{requiresPowerBlock ? '⚡ REQUIRED (OHE OFF)' : '❌ NO POWER BLOCK'}</span>
                </button>
              </div>
            </div>

            {/* 4. Machinery & Defect Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Machine / Gang Roster</label>
                <input
                  type="text"
                  value={assignedMachine}
                  onChange={(e) => setAssignedMachine(e.target.value)}
                  placeholder="e.g. Tower Wagon #60515, CSM #5109"
                  className="w-full text-xs bg-white border border-[#D0DFEE] p-2 text-slate-900 focus:border-[#2B7FFF] focus:outline-hidden"
                  style={{ borderRadius: '4px' }}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Defect Description / Scope of Work</label>
                <input
                  type="text"
                  value={defectDescription}
                  onChange={(e) => setDefectDescription(e.target.value)}
                  placeholder="Enter exact defect details or flaw ticket reference"
                  className="w-full text-xs bg-white border border-[#D0DFEE] p-2 text-slate-900 focus:border-[#2B7FFF] focus:outline-hidden"
                  style={{ borderRadius: '4px' }}
                />
              </div>
            </div>

            {/* 5. Live AI Feasibility & Shadow Bundling Preview Box */}
            <div className="bg-[#F0F6FC] border border-[#D0DFEE] p-3.5 space-y-2" style={{ borderRadius: '4px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-[#0F172A]">AI Feasibility & Corridor Optimization Preview</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5" style={{ borderRadius: '4px' }}>
                  {aiFeasibility.estimatedSavingsPct}% Track Downtime Saved
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Optimal White Corridor:</span>
                  <strong className="text-slate-900">{aiFeasibility.whiteCorridorSlot}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Statutory Buffers:</span>
                  <strong className="text-slate-900">
                    {aiFeasibility.earthingBufferMin > 0 ? `+${aiFeasibility.earthingBufferMin}m Earthing | ` : ''}15m Train Headway
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Shadow Bundling Strategy:</span>
                  <span className="text-slate-800 text-[10px] leading-tight block">{aiFeasibility.bundlingWith}</span>
                </div>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#D0DFEE]">
              <div className="text-[11px] text-slate-500">
                Statutory Notice: <span className="font-semibold text-slate-700">{DEPARTMENT_PRESETS[department].statutoryNotice}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                  style={{ borderRadius: '4px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#2B7FFF] hover:bg-blue-600 transition-all flex items-center space-x-1.5 shadow-sm"
                  style={{ borderRadius: '4px' }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin text-sm">↻</span>
                      <span>Processing Optimization...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Block Requisition</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
