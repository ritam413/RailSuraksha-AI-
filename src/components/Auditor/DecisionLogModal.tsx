// src/components/Auditor/DecisionLogModal.tsx
import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white border border-[#D0DFEE] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        style={{ borderRadius: '24px' }}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#F0F6FC] flex items-center justify-between bg-[#F0F6FC]">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-[#0F172A]">Explainable Decision Log</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-blue-100 text-blue-800 rounded">
                {log.deploymentMode} MODE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Incident {log.incidentId} | Train {log.trainNumber} ({log.trackSection})
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold hover:bg-slate-300 flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Modal Body — 4-Step Timeline */}
        <div className="p-6 overflow-y-auto space-y-4">
          {log.steps.map((step) => (
            <div key={step.stepNumber} className="flex space-x-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#2B7FFF] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {step.stepNumber}
                </div>
                {step.stepNumber < log.steps.length && <div className="w-0.5 flex-1 bg-slate-200 my-1" />}
              </div>
              <div className="flex-1 bg-[#F0F6FC] border border-[#D0DFEE] rounded-xl p-4" style={{ borderRadius: '12px' }}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-bold text-[#0F172A]">{step.title}</h4>
                  <span className="text-[10px] font-mono text-slate-400">{step.timestamp}</span>
                </div>
                <div className="text-xs font-mono font-semibold text-[#2B7FFF] mb-2">{step.agentName}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{step.detailText}</p>
              </div>
            </div>
          ))}

          {/* Outcome Summary Box */}
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200" style={{ borderRadius: '12px' }}>
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">Outcome Summary</h4>
            <p className="text-xs text-emerald-800 font-mono">{log.outcomeSummary}</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#F0F6FC] bg-white flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200"
            style={{ borderRadius: '4px' }}
          >
            Close Drawer
          </button>
          <button
            onClick={() => {
              alert('Compliance Report filed & downloaded successfully!');
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-[#2B7FFF] rounded hover:bg-blue-600 shadow-xs"
            style={{ borderRadius: '4px' }}
          >
            [CLOSE INCIDENT & FILE COMPLIANCE REPORT]
          </button>
        </div>
      </div>
    </div>
  );
};
