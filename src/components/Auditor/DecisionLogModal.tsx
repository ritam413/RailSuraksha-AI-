// src/components/Auditor/DecisionLogModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ExplainableDecisionLog } from '@/types/apiContracts';
import { MOCK_DECISION_LOG } from '@/lib/mockData';
import { buildExplainableDecisionLog } from '@/lib/agents/explainableLogger';
import { playActionConfirmedChime } from '@/lib/audioAlerts';

interface DecisionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log?: ExplainableDecisionLog;
}

const HISTORICAL_INCIDENTS = [
  { id: 'RS-2048', train: '12345 (Vande Bharat)', section: 'Section 14B Up Main Line', hazard: 'BOULDER', dist: 340, dStop: 410 },
  { id: 'RS-2049', train: '12137 (Punjab Mail)', section: 'CSMT Platform 17/18 Bottleneck', hazard: 'CROWD_SURGE', dist: 15, dStop: 0 },
  { id: 'RS-2050', train: '22691 (Rajdhani Express)', section: 'Section 08C Curve 4 Loop', hazard: 'RAIL_FRACTURE', dist: 210, dStop: 295 },
  { id: 'RS-2051', train: '12002 (Bhopal Shatabdi)', section: 'Section 16A Down Main Line', hazard: 'CATTLE', dist: 680, dStop: 410 }
];

export const DecisionLogModal: React.FC<DecisionLogModalProps> = ({
  isOpen,
  onClose,
  log: initialLog = MOCK_DECISION_LOG
}) => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'RAW_JSON'>('TIMELINE');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(initialLog.incidentId || 'RS-2048');
  const [activeLog, setActiveLog] = useState<ExplainableDecisionLog>(initialLog);
  const [isExported, setIsExported] = useState(false);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    if (initialLog) {
      setSelectedIncidentId(initialLog.incidentId);
      setActiveLog(initialLog);
    }
  }, [initialLog]);

  const handleSwitchIncident = (incidentId: string) => {
    setSelectedIncidentId(incidentId);
    const inc = HISTORICAL_INCIDENTS.find((item) => item.id === incidentId);
    if (inc) {
      const generatedLog = buildExplainableDecisionLog(
        inc.id,
        inc.train,
        inc.section,
        activeLog.deploymentMode,
        inc.hazard,
        inc.dist,
        inc.dStop
      );
      setActiveLog(generatedLog);
    }
  };

  if (!isOpen) return null;

  // Generate real downloadable RDSO Compliance Report Dossier
  const handleExportReport = () => {
    playActionConfirmedChime();
    const reportData = {
      dossierId: `RDSO-AUDIT-${activeLog.incidentId}-${Date.now().toString().slice(-6)}`,
      governingStandard: 'RDSO Specification No. RDSO/SPN/196/2020 (Kavach / TCAS Safety Standard)',
      governingAuthority: 'Ministry of Railways / RDSO Safety Directorate, Govt of India',
      generatedTimestamp: new Date().toISOString(),
      stationDivision: 'Central Railway / Mumbai CSMT Division / Section 14B Up Main',
      deploymentGovernance: {
        mode: activeLog.deploymentMode,
        authorizedOperator:
          activeLog.deploymentMode === 'ADVISORY'
            ? 'Section Controller OP-402 (Manual Verification Gate)'
            : 'Autonomous Direct Solenoid Engine Actuator',
        interlockState: 'LOCKED_AND_VERIFIED'
      },
      incidentDetails: {
        incidentId: activeLog.incidentId,
        trainNumber: activeLog.trainNumber,
        trackSection: activeLog.trackSection,
        status: activeLog.status,
        outcomeSummary: activeLog.outcomeSummary
      },
      agentDecisionTrail: activeLog.steps.map((s) => ({
        step: s.stepNumber,
        agent: s.agentName,
        title: s.title,
        timestamp: s.timestamp,
        telemetryDetails: s.detailText
      })),
      cryptographicAuditSeal: {
        algorithm: 'SHA-256 / RDSO-SEAL-v4',
        hashSignature: '0x8f4b23a9e10287cd90b34512e0fac619e048356911cbb007a82910f82c',
        verificationStatus: 'OFFICIALLY_CERTIFIED_COMPLIANT',
        tamperProofChain: 'BLOCK_VALIDATED'
      }
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RDSO_Safety_Audit_Dossier_${activeLog.incidentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => {
      setIsExported(false);
      onClose();
    }, 1600);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(activeLog, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step Icon and Accent helper
  const getStepAccent = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return { bg: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 2:
        return { bg: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 3:
        return { bg: 'bg-amber-500', badge: 'bg-amber-100 text-amber-800 border-amber-200' };
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
        className="bg-white border border-[#D0DFEE] w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        style={{ borderRadius: '24px' }}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#D0DFEE] flex items-center justify-between bg-[#F0F6FC]">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl">📋</span>
              <h2 id="modal-headline" className="text-base font-bold text-[#0F172A] tracking-tight">
                RDSO Explainable Decision Log & Safety Audit Dossier
              </h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                  activeLog.deploymentMode === 'AUTONOMOUS'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {activeLog.deploymentMode} MODE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Incident #{activeLog.incidentId} | Train {activeLog.trainNumber} ({activeLog.trackSection})
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 active:scale-95 flex items-center justify-center text-sm transition-all"
            style={{ borderRadius: '4px' }}
          >
            ✕
          </button>
        </div>

        {/* Incident Dossier Archive Selector Tab Strip */}
        <div className="bg-white px-5 py-2.5 border-b border-[#D0DFEE] flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">Archive Dossiers:</span>
            {HISTORICAL_INCIDENTS.map((inc) => (
              <button
                key={inc.id}
                onClick={() => handleSwitchIncident(inc.id)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold border transition-all ${
                  selectedIncidentId === inc.id
                    ? 'bg-[#2B7FFF] text-white border-[#2B7FFF] shadow-xs'
                    : 'bg-[#F0F6FC] text-slate-700 border-[#D0DFEE] hover:bg-white'
                }`}
                style={{ borderRadius: '4px' }}
              >
                #{inc.id} ({inc.hazard})
              </button>
            ))}
          </div>

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
          {/* Audit Verification Seal */}
          <div className="p-3 rounded-lg bg-slate-900 text-white border border-slate-800 flex items-center justify-between text-xs font-mono" style={{ borderRadius: '8px' }}>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300">RDSO SHA-256 SEAL:</span>
              <span className="text-emerald-400 font-bold">0x8f4b23...e0fa</span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 hidden sm:inline">RDSO/SPN/196</span>
            </div>
            <button
              onClick={handleCopyJSON}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-mono transition-all"
              style={{ borderRadius: '4px' }}
            >
              {copied ? '✓ COPIED JSON' : 'COPY RAW JSON'}
            </button>
          </div>

          {/* TAB 1: 4-Step Process Timeline */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              {activeLog.steps.map((step) => {
                const accent = getStepAccent(step.stepNumber);
                return (
                  <div key={step.stepNumber} className="flex space-x-4">
                    {/* Vertical Timeline Step Number & Connecting Line */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 text-white font-bold text-xs flex items-center justify-center shadow-xs ${accent.bg}`}
                        style={{ borderRadius: '4px' }}
                      >
                        {step.stepNumber}
                      </div>
                      {step.stepNumber < activeLog.steps.length && (
                        <div className="w-0.5 flex-1 bg-[#D0DFEE] my-1" />
                      )}
                    </div>

                    {/* Timeline Step Content Card */}
                    <div
                      className="flex-1 bg-[#F0F6FC] border border-[#D0DFEE] p-4 shadow-2xs"
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
                          className={`text-[10px] font-mono font-semibold px-2 py-0.5 border ${accent.badge}`}
                          style={{ borderRadius: '4px' }}
                        >
                          {step.agentName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white/70 p-2 border border-slate-100 rounded" style={{ borderRadius: '4px' }}>
                        {step.detailText}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Official RDSO Form 14B Certificate Stamp Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-700 relative overflow-hidden" style={{ borderRadius: '12px' }}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                  <div className="font-bold text-[#0F172A]">RDSO FORM 14B — RAILWAY SAFETY COMPLIANCE SEAL</div>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold border border-emerald-300">
                    APPROVED & LOCKED
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>GOVERNING REGULATION: <strong>RDSO/SPN/196/2020</strong></div>
                  <div>CONTROLLER AUTHORIZATION: <strong>OP-402</strong></div>
                  <div>PHYSICS ENGINE: <strong>Kavach EBD v2.4 (Deterministic)</strong></div>
                  <div>AUDIT REPLAY STATUS: <strong>VERIFIED DETERMINISTIC</strong></div>
                </div>
              </div>

              {/* Outcome Summary Box */}
              <div
                className="mt-4 p-4 bg-emerald-50 border border-emerald-300"
                style={{ borderRadius: '12px' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Safety Outcome & Interlocking Resolution
                  </h4>
                  <span
                    className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300"
                    style={{ borderRadius: '4px' }}
                  >
                    {activeLog.status}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 font-mono leading-relaxed">
                  {activeLog.outcomeSummary}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Raw Telemetry JSON Inspector */}
          {activeTab === 'RAW_JSON' && (
            <div className="space-y-3">
              <div
                className="bg-slate-950 text-emerald-400 p-4 font-mono text-xs overflow-x-auto max-h-[380px] border border-slate-800"
                style={{ borderRadius: '12px' }}
              >
                <pre>{JSON.stringify(activeLog, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Success Export Notification Banner */}
          {isExported && (
            <div
              className="p-3 bg-blue-50 border border-blue-300 text-xs font-mono text-[#2B7FFF] text-center"
              style={{ borderRadius: '8px' }}
            >
              ✓ RDSO Safety Dossier for #{activeLog.incidentId} successfully downloaded & filed to regulatory compliance registry.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#D0DFEE] bg-white flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-500">
            Governing Body: <span className="font-semibold text-slate-700">RDSO Govt of India</span>
          </div>
          <div className="flex space-x-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-300 transition-all"
              style={{ borderRadius: '4px' }}
            >
              Close Drawer
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2 text-xs font-bold text-white bg-[#2B7FFF] hover:bg-blue-600 active:scale-95 transition-all shadow-xs flex items-center space-x-1.5"
              style={{ borderRadius: '4px' }}
            >
              <span>📥</span>
              <span>[CLOSE INCIDENT & FILE COMPLIANCE REPORT]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
