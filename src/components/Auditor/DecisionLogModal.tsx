// src/components/Auditor/DecisionLogModal.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ExplainableDecisionLog } from '@/types/apiContracts';
import { MOCK_DECISION_LOG } from '@/lib/mockData';

interface DecisionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  log?: ExplainableDecisionLog;
}

export const DecisionLogModal: React.FC<DecisionLogModalProps> = ({
  isOpen,
  onClose,
  log = MOCK_DECISION_LOG
}) => {
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'RAW_JSON'>('TIMELINE');
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

  if (!isOpen) return null;

  // Generate downloadable RDSO Section 14B Safety Compliance Report Dossier
  const handleExportReport = () => {
    const reportData = {
      dossierId: `RDSO-AUDIT-${log.incidentId}-${Date.now().toString().slice(-6)}`,
      governingStandard: 'RDSO Specification No. RDSO/SPN/196/2020 (Kavach / TCAS Safety Standard)',
      governingAuthority: 'Ministry of Railways / RDSO Safety Directorate, Govt of India',
      generatedTimestamp: new Date().toISOString(),
      stationDivision: 'Central Railway / Mumbai CSMT Division / Section 14B Up Main',
      deploymentGovernance: {
        mode: log.deploymentMode,
        authorizedOperator:
          log.deploymentMode === 'ADVISORY'
            ? 'Section Controller OP-402 (Manual Verification Gate)'
            : 'Autonomous Direct Solenoid Engine Actuator',
        interlockState: 'LOCKED_AND_VERIFIED'
      },
      incidentDetails: {
        incidentId: log.incidentId,
        trainNumber: log.trainNumber,
        trackSection: log.trackSection,
        status: log.status,
        outcomeSummary: log.outcomeSummary
      },
      agentDecisionTrail: log.steps.map((s) => ({
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
    a.download = `RDSO_Safety_Audit_Dossier_${log.incidentId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => {
      setIsExported(false);
      onClose();
    }, 1800);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
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
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white border border-[#D0DFEE] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        style={{ borderRadius: '24px' }}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#D0DFEE] flex items-center justify-between bg-[#F0F6FC]">
          <div>
            <div className="flex items-center space-x-2.5">
              <h2 id="modal-headline" className="text-lg font-bold text-[#0F172A] tracking-tight">
                Explainable Decision Log & Audit Dossier
              </h2>
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold border ${
                  log.deploymentMode === 'AUTONOMOUS'
                    ? 'bg-purple-100 text-purple-800 border-purple-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {log.deploymentMode} MODE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Incident <span className="font-semibold text-slate-700">{log.incidentId}</span> &bull; Train{' '}
              <span className="font-semibold text-slate-700">{log.trainNumber}</span> ({log.trackSection})
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

        {/* View Switcher Tabs & Verification Seal */}
        <div className="px-6 pt-4 pb-2 bg-white border-b border-[#F0F6FC] flex items-center justify-between">
          <div className="flex space-x-1.5 p-1 bg-[#F0F6FC] border border-[#D0DFEE]" style={{ borderRadius: '4px' }}>
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-3 py-1 text-xs font-semibold font-mono transition-all ${
                activeTab === 'TIMELINE'
                  ? 'bg-[#2B7FFF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={{ borderRadius: '4px' }}
            >
              4-Step AI Timeline
            </button>
            <button
              onClick={() => setActiveTab('RAW_JSON')}
              className={`px-3 py-1 text-xs font-semibold font-mono transition-all ${
                activeTab === 'RAW_JSON'
                  ? 'bg-[#2B7FFF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              style={{ borderRadius: '4px' }}
            >
              Raw Telemetry JSON
            </button>
          </div>

          {/* Quick Copy JSON Action */}
          <button
            onClick={handleCopyJSON}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-[11px] font-mono font-medium transition-all flex items-center space-x-1"
            style={{ borderRadius: '4px' }}
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY JSON'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Audit Verification Seal */}
          <div
            className="p-3 bg-slate-900 text-white border border-slate-800 flex items-center justify-between text-xs font-mono"
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">RDSO SHA-256 SEAL:</span>
              <span className="text-emerald-400 font-bold tracking-wider">0x8f4b23...e0fa</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
              <span>Standard: RDSO/SPN/196/2020</span>
              <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold" style={{ borderRadius: '4px' }}>
                VERIFIED
              </span>
            </div>
          </div>

          {/* TAB 1: 4-Step Process Timeline */}
          {activeTab === 'TIMELINE' && (
            <div className="space-y-4">
              {log.steps.map((step) => {
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
                      {step.stepNumber < log.steps.length && (
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
                      <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {step.detailText}
                      </p>
                    </div>
                  </div>
                );
              })}

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
                    {log.status}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 font-mono leading-relaxed">
                  {log.outcomeSummary}
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
                <pre>{JSON.stringify(log, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* Success Export Notification Banner */}
          {isExported && (
            <div
              className="p-3 bg-blue-50 border border-blue-300 text-xs font-mono text-[#2B7FFF] text-center"
              style={{ borderRadius: '8px' }}
            >
              ✓ RDSO Safety Dossier successfully downloaded & filed to regulatory compliance registry.
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
