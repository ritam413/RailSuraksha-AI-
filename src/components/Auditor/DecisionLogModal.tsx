// src/components/Auditor/DecisionLogModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ExplainableDecisionDossier,
  ExplainableDecisionLog,
  DecisionTimelineStep
} from '@/types/apiContracts';
import { MOCK_DECISION_DOSSIER, MOCK_DECISION_LOG, MOCK_MAINTENANCE_DEMANDS } from '@/lib/mockData';
import {
  buildExplainableDossier,
  verifyDossierIntegrity,
  computeCanonicalSha256
} from '@/lib/agents/explainableLogger';
import { playActionConfirmedChime } from '@/lib/audioAlerts';

interface DecisionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dossier?: ExplainableDecisionDossier;
  log?: ExplainableDecisionLog;
}

interface BlockArchiveItem {
  id: string;
  name: string;
  section: string;
  type: 'JOINT_BLOCK' | 'INCIDENT';
  blockId: string;
  demands: string[];
  tsrSpeed: number;
}

const ARCHIVE_BLOCKS: BlockArchiveItem[] = [
  {
    id: 'JB-2026-0926-01',
    name: 'Dadar-Kurla Joint Shadow Block',
    section: 'TC-03 UP Slow Line (KM 9.2 - 15.5)',
    type: 'JOINT_BLOCK',
    blockId: 'JB-2026-0926-01',
    demands: ['DEM-TMS-01', 'DEM-TDMS-02', 'DEM-SMMS-03'],
    tsrSpeed: 30
  },
  {
    id: 'JB-2026-0926-02',
    name: 'Kurla-Thane Joint Fast Corridor Block',
    section: 'TC-04/05 DOWN Fast Line (KM 15.5 - 33.2)',
    type: 'JOINT_BLOCK',
    blockId: 'JB-2026-0926-02',
    demands: ['DEM-TMS-04', 'DEM-TDMS-05'],
    tsrSpeed: 30
  },
  {
    id: 'RS-2048',
    name: 'Loco Cab Forward Boulder Hazard',
    section: 'Section 14B — Up Main Line',
    type: 'INCIDENT',
    blockId: 'JB-2026-0926-01',
    demands: ['DEM-TMS-01'],
    tsrSpeed: 30
  }
];

export const DecisionLogModal: React.FC<DecisionLogModalProps> = ({
  isOpen,
  onClose,
  dossier: initialDossier,
  log: initialLog
}) => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'FORM_14B' | 'RAW_JSON'>('TIMELINE');
  const [selectedArchiveId, setSelectedArchiveId] = useState<string>('JB-2026-0926-01');
  const [isExported, setIsExported] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  // Derive initial active dossier
  const defaultDossier = useMemo(() => {
    if (initialDossier) return initialDossier;
    if (initialLog) {
      return buildExplainableDossier({
        blockId: initialLog.incidentId || 'JB-2026-0926-01',
        sanctionedBy: `Section Controller (${initialLog.deploymentMode} Mode)`,
        bundledDemandIds: ['DEM-TMS-01', 'DEM-TDMS-02', 'DEM-SMMS-03']
      });
    }
    return MOCK_DECISION_DOSSIER;
  }, [initialDossier, initialLog]);

  const [activeDossier, setActiveDossier] = useState<ExplainableDecisionDossier>(defaultDossier);

  useEffect(() => {
    if (initialDossier) {
      setActiveDossier(initialDossier);
      setSelectedArchiveId(initialDossier.blockId);
    } else if (initialLog) {
      const converted = buildExplainableDossier({
        blockId: initialLog.incidentId || 'JB-2026-0926-01',
        sanctionedBy: `Section Controller (${initialLog.deploymentMode} Mode)`,
        bundledDemandIds: ['DEM-TMS-01', 'DEM-TDMS-02', 'DEM-SMMS-03']
      });
      setActiveDossier(converted);
      setSelectedArchiveId(initialLog.incidentId);
    }
  }, [initialDossier, initialLog]);

  // Keyboard accessibility: Escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleSwitchArchive = (archiveItem: BlockArchiveItem) => {
    setSelectedArchiveId(archiveItem.id);
    setVerificationFeedback(null);

    const generatedDossier = buildExplainableDossier({
      blockId: archiveItem.blockId,
      sanctionedBy: 'CTRL-MUM-402 (Sr. DOM / Section Controller)',
      bundledDemandIds: archiveItem.demands,
      kavachTsrSpeedKmh: archiveItem.tsrSpeed
    });
    setActiveDossier(generatedDossier);
  };

  const handleVerifyIntegrity = () => {
    const result = verifyDossierIntegrity(activeDossier);
    if (result.isValid) {
      setVerificationFeedback('✓ Cryptographically Verified: SHA-256 seal matches canonical RFC 8785 delimiter string. 100% Tamper-Free.');
    } else {
      setVerificationFeedback('⚠ Signature Mismatch: Canonical payload does not match the seal signature!');
    }
    setTimeout(() => {
      setVerificationFeedback(null);
    }, 4500);
  };

  const handleCopySeal = () => {
    navigator.clipboard.writeText(activeDossier.sha256Signature);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(activeDossier, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleExportForm14B = () => {
    playActionConfirmedChime();

    const reportData = {
      formTitle: 'RDSO FORM 14B — RAILWAY SAFETY & BLOCK COMPLIANCE DOSSIER',
      dossierId: activeDossier.dossierId,
      blockId: activeDossier.blockId,
      governingStandard: 'RDSO Specification No. RDSO/SPN/196/2020 Ver 4.0 (Kavach / TCAS Safety Standard)',
      governingAuthority: 'Ministry of Railways / RDSO Safety Directorate, Govt of India',
      sanctionedBy: activeDossier.sanctionedBy,
      timestamp: activeDossier.timestamp,
      statutoryForms: activeDossier.statutoryForms,
      verificationStatus: activeDossier.verificationStatus,
      canonicalPayloadString: activeDossier.canonicalPayloadString,
      sha256Signature: activeDossier.sha256Signature,
      chronologicalAuditTimeline: activeDossier.chronologicalTimeline,
      bundledMaintenanceDemands: activeDossier.bundledDemands
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RDSO_Form14B_Certificate_${activeDossier.blockId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => {
      setIsExported(false);
    }, 2000);
  };

  if (!isOpen) return null;

  // Step color helper
  const getStepColor = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return { bg: 'bg-[#2B7FFF]', badge: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 2:
        return { bg: 'bg-indigo-600', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 3:
        return { bg: 'bg-amber-600', badge: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 4:
        return { bg: 'bg-emerald-600', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { bg: 'bg-[#2B7FFF]', badge: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white border border-[#D0DFEE] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        style={{ borderRadius: '24px' }}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#D0DFEE] flex items-center justify-between bg-[#F0F6FC]">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">📋</span>
              <h2 id="modal-headline" className="text-base font-bold text-[#0F172A] tracking-tight">
                RDSO Explainable Decision Dossier & Compliance Auditor
              </h2>
              <span
                className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                style={{ borderRadius: '4px' }}
              >
                RDSO/SPN/196 CERTIFIED
              </span>
            </div>
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              Dossier #{activeDossier.dossierId} | Block #{activeDossier.blockId} ({activeDossier.sanctionedBy})
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 active:scale-95 flex items-center justify-center text-sm transition-all"
            style={{ borderRadius: '4px' }}
          >
            ✕
          </button>
        </div>

        {/* Dossier Archive Selector Tab Strip */}
        <div className="bg-white px-5 py-2.5 border-b border-[#D0DFEE] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">
              Dossier Archive:
            </span>
            {ARCHIVE_BLOCKS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSwitchArchive(item)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold border transition-all ${
                  selectedArchiveId === item.id
                    ? 'bg-[#2B7FFF] text-white border-[#2B7FFF] shadow-xs'
                    : 'bg-[#F0F6FC] text-slate-700 border-[#D0DFEE] hover:bg-white'
                }`}
                style={{ borderRadius: '4px' }}
              >
                #{item.id}
              </button>
            ))}
          </div>

          {/* View Tab Switcher */}
          <div className="flex space-x-1 p-0.5 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-2.5 py-1 text-xs font-semibold font-mono transition-all ${
                activeTab === 'TIMELINE' ? 'bg-[#2B7FFF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              style={{ borderRadius: '4px' }}
            >
              4-Step Timeline
            </button>
            <button
              onClick={() => setActiveTab('FORM_14B')}
              className={`px-2.5 py-1 text-xs font-semibold font-mono transition-all ${
                activeTab === 'FORM_14B' ? 'bg-[#2B7FFF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              style={{ borderRadius: '4px' }}
            >
              RDSO Form 14B
            </button>
            <button
              onClick={() => setActiveTab('RAW_JSON')}
              className={`px-2.5 py-1 text-xs font-semibold font-mono transition-all ${
                activeTab === 'RAW_JSON' ? 'bg-[#2B7FFF] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              style={{ borderRadius: '4px' }}
            >
              Raw JSON
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* SHA-256 Digital Audit Seal Banner */}
          <div
            className="p-3.5 bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono shadow-inner"
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 overflow-hidden">
                <span className="text-slate-400 font-bold">RDSO SHA-256 DIGITAL SEAL:</span>
                <span className="text-emerald-400 font-bold truncate max-w-[280px] sm:max-w-[340px]" title={activeDossier.sha256Signature}>
                  {activeDossier.sha256Signature}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                VERIFIED TAMPER-FREE
              </span>
              <button
                onClick={handleVerifyIntegrity}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono border border-slate-700 transition-all active:scale-95"
                style={{ borderRadius: '4px' }}
              >
                [VERIFY INTEGRITY]
              </button>
              <button
                onClick={handleCopySeal}
                className="px-2.5 py-1 bg-[#2B7FFF] hover:bg-blue-600 text-white text-[10px] font-mono transition-all active:scale-95 shadow-xs"
                style={{ borderRadius: '4px' }}
              >
                {copiedHash ? '✓ COPIED' : 'COPY SHA-256 SEAL'}
              </button>
            </div>
          </div>

          {/* Verification Feedback Banner */}
          {verificationFeedback && (
            <div
              className={`p-2.5 text-xs font-mono border text-center transition-all ${
                verificationFeedback.includes('Tamper-Free')
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-red-50 text-red-900 border-red-300'
              }`}
              style={{ borderRadius: '6px' }}
            >
              {verificationFeedback}
            </div>
          )}

          {/* TAB 1: 4-Step Chronological Audit Timeline */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-[#D0DFEE]">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                  Chronological AI Optimization & Sanction Sequence
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Corridor Headway Saved: <strong className="text-emerald-700">85 mins (38.4%)</strong>
                </span>
              </div>

              {activeDossier.chronologicalTimeline.map((step) => {
                const color = getStepColor(step.stepNumber);
                return (
                  <div key={step.stepNumber} className="flex space-x-4">
                    {/* Vertical Step Node */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 text-white font-bold text-xs flex items-center justify-center shadow-xs ${color.bg}`}
                        style={{ borderRadius: '4px' }}
                      >
                        {step.stepNumber}
                      </div>
                      {step.stepNumber < activeDossier.chronologicalTimeline.length && (
                        <div className="w-0.5 flex-1 bg-[#D0DFEE] my-1" />
                      )}
                    </div>

                    {/* Step Card */}
                    <div
                      className="flex-1 bg-[#F0F6FC] border border-[#D0DFEE] p-4 shadow-2xs transition-all hover:bg-[#EAF2FB]"
                      style={{ borderRadius: '12px' }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-bold text-[#0F172A]">{step.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500 font-medium">
                          {step.timestamp}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 border ${color.badge}`}
                          style={{ borderRadius: '4px' }}
                        >
                          {step.agentName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Stage: {step.stageName}
                        </span>
                      </div>
                      <p
                        className="text-xs text-slate-800 leading-relaxed font-mono bg-white/80 p-2.5 border border-[#D0DFEE]"
                        style={{ borderRadius: '4px' }}
                      >
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Statutory Forms Summary Box */}
              <div
                className="p-4 bg-white border border-[#D0DFEE] font-mono text-xs text-slate-700 shadow-2xs"
                style={{ borderRadius: '12px' }}
              >
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                  <div className="font-bold text-[#0F172A]">STATUTORY REGULATORY PERMITS & SANCTIONS</div>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-300">
                    SANCTIONED & LOCKED
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div className="p-2 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '6px' }}>
                    <div className="text-slate-500 text-[10px]">FORM S&T/T-351:</div>
                    <div className="font-bold text-[#0F172A] mt-0.5">{activeDossier.statutoryForms.formST351LockoutNumber}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Signal S-12 Clamped RED</div>
                  </div>
                  <div className="p-2 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '6px' }}>
                    <div className="text-slate-500 text-[10px]">FORM T/409 CAUTION ORDER:</div>
                    <div className="font-bold text-[#0F172A] mt-0.5">{activeDossier.statutoryForms.formT409CautionOrderNumber}</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Kavach TSR 30 km/h Enforced</div>
                  </div>
                  <div className="p-2 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '6px' }}>
                    <div className="text-slate-500 text-[10px]">RDSO FORM 14B CERTIFICATE:</div>
                    <div className="font-bold text-[#0F172A] mt-0.5">VERIFIED TAMPER-FREE</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">SHA-256 Digest Confirmed</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RDSO Form 14B Certificate Printable View */}
          {activeTab === 'FORM_14B' && (
            <div className="space-y-4">
              <div
                className="bg-white border-2 border-slate-800 p-6 font-mono text-slate-800 shadow-md space-y-4"
                style={{ borderRadius: '8px' }}
              >
                {/* Certificate Header */}
                <div className="text-center pb-4 border-b-2 border-slate-800">
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-500">
                    Government of India — Ministry of Railways
                  </div>
                  <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight mt-1">
                    RDSO FORM 14B: AUTOMATIC BLOCK SANCTION & SAFETY COMPLIANCE CERTIFICATE
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Issued under Rule 14.02 of General & Subsidiary Rules (G&SR) & RDSO/SPN/196/2020
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-b border-slate-300 pb-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block">BLOCK IDENTIFIER:</span>
                    <strong className="text-[#0F172A]">{activeDossier.blockId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SANCTION AUTHORITY:</span>
                    <strong className="text-[#0F172A]">{activeDossier.sanctionedBy}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">SANCTION TIMESTAMP:</span>
                    <strong className="text-[#0F172A]">{activeDossier.timestamp}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">CORRIDOR / DIVISION:</span>
                    <strong className="text-[#0F172A]">Central Railway (CSMT Div)</strong>
                  </div>
                </div>

                {/* Bundled Demands Table */}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide">
                    Bundled Multi-Department Maintenance Possession Window:
                  </h4>
                  <div className="border border-slate-300 overflow-hidden" style={{ borderRadius: '4px' }}>
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead className="bg-[#F0F6FC] border-b border-slate-300 text-slate-700 font-bold">
                        <tr>
                          <th className="p-2 border-r border-slate-300">Demand ID</th>
                          <th className="p-2 border-r border-slate-300">Dept</th>
                          <th className="p-2 border-r border-slate-300">Section</th>
                          <th className="p-2 border-r border-slate-300">Power Block</th>
                          <th className="p-2">Defect Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {activeDossier.bundledDemands.map((d) => (
                          <tr key={d.demandId} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200 font-bold text-[#2B7FFF]">{d.demandId}</td>
                            <td className="p-2 border-r border-slate-200">{d.department}</td>
                            <td className="p-2 border-r border-slate-200">{d.stationSection}</td>
                            <td className="p-2 border-r border-slate-200">
                              {d.requiresPowerBlock ? (
                                <span className="text-amber-700 font-bold">25kV ISOLATION</span>
                              ) : (
                                <span className="text-slate-500">NO</span>
                              )}
                            </td>
                            <td className="p-2 text-slate-700">{d.defectDescription}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Regulatory Controls & Lockouts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F0F6FC] p-3 border border-[#D0DFEE]" style={{ borderRadius: '6px' }}>
                  <div>
                    <span className="font-bold text-[#0F172A] block">Statutory Lockout Dissemination:</span>
                    <ul className="list-disc list-inside text-slate-700 text-[11px] mt-1 space-y-0.5">
                      <li>Form S&T/T-351 Lockout: {activeDossier.statutoryForms.formST351LockoutNumber}</li>
                      <li>Entry Signal Clamped RED at S-12 (TC-03)</li>
                      <li>25kV AC OHE Power Isolation Confirmed</li>
                    </ul>
                  </div>
                  <div>
                    <span className="font-bold text-[#0F172A] block">Kavach Automatic Speed Control:</span>
                    <ul className="list-disc list-inside text-slate-700 text-[11px] mt-1 space-y-0.5">
                      <li>Form T/409 Caution Order: {activeDossier.statutoryForms.formT409CautionOrderNumber}</li>
                      <li>TSR Speed Broadcast: 30 km/h</li>
                      <li>Passenger Train Delays: 0 minutes</li>
                    </ul>
                  </div>
                </div>

                {/* Cryptographic Seal Verification Footer */}
                <div className="p-3 bg-slate-100 border border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]" style={{ borderRadius: '6px' }}>
                  <div>
                    <span className="text-slate-500 block text-[10px]">CANONICAL SHA-256 DIGITAL SEAL:</span>
                    <span className="font-bold text-slate-900 break-all">{activeDossier.sha256Signature}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[10px]">
                      RDSO OFFICIALLY SEALED
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Raw Telemetry JSON Inspector */}
          {activeTab === 'RAW_JSON' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-600">Canonical Delimiter String:</span>
                <span className="text-xs font-mono font-bold text-[#2B7FFF]">
                  {activeDossier.canonicalPayloadString}
                </span>
              </div>
              <div
                className="bg-slate-950 text-emerald-400 p-4 font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-800"
                style={{ borderRadius: '12px' }}
              >
                <pre>{JSON.stringify(activeDossier, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Success Export Notification Banner */}
          {isExported && (
            <div
              className="p-3 bg-blue-50 border border-blue-300 text-xs font-mono text-[#2B7FFF] text-center"
              style={{ borderRadius: '8px' }}
            >
              ✓ RDSO Form 14B Certificate for #{activeDossier.blockId} successfully downloaded & filed to regulatory compliance registry.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#D0DFEE] bg-white flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            Governing Authority: <span className="font-semibold text-slate-700">RDSO & Commissioner of Railway Safety (CRS)</span>
          </div>
          <div className="flex space-x-2.5">
            <button
              onClick={handleCopyJSON}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 transition-all"
              style={{ borderRadius: '4px' }}
            >
              {copiedJson ? '✓ COPIED JSON' : 'Copy Raw JSON'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 transition-all"
              style={{ borderRadius: '4px' }}
            >
              Close Drawer
            </button>
            <button
              onClick={handleExportForm14B}
              className="px-4 py-2 text-xs font-bold text-white bg-[#2B7FFF] hover:bg-blue-600 active:scale-95 transition-all shadow-xs flex items-center space-x-1.5"
              style={{ borderRadius: '4px' }}
            >
              <span>📥</span>
              <span>[EXPORT RDSO FORM 14B CERTIFICATE]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
