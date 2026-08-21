// src/components/Overview/IncidentQueue.tsx
import React from 'react';
import { Card } from '../Common/Card';
import { MOCK_INCIDENTS } from '@/lib/mockData';
import { IncidentRecord } from '@/types/apiContracts';

interface IncidentQueueProps {
  onSelectIncident?: (incident: IncidentRecord) => void;
  onApproveAction?: (incidentId: string) => void;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({ onSelectIncident, onApproveAction }) => {
  return (
    <Card title="AI Triage Incident Queue">
      <div className="space-y-3">
        {MOCK_INCIDENTS.map((item) => (
          <div
            key={item.incidentId}
            onClick={() => onSelectIncident && onSelectIncident(item)}
            className="p-4 rounded-xl border border-[#D0DFEE] bg-white hover:border-[#2B7FFF] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
            style={{ borderRadius: '12px' }}
          >
            <div className="flex items-center space-x-3">
              <span
                className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded ${
                  item.severityCategory === 'CRITICAL'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : item.severityCategory === 'MODERATE'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {item.severityCategory}
              </span>
              <div>
                <div className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                  <span>Incident {item.incidentId}</span>
                  <span className="text-xs text-slate-400 font-mono font-normal">({item.timestamp})</span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Camera: {item.sourceCameraId} | Confidence: {(item.severityScore * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono text-slate-600 font-semibold">{item.assignedAgent}</span>
              {item.status === 'PENDING_APPROVAL' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onApproveAction) onApproveAction(item.incidentId);
                  }}
                  className="px-3 py-1.5 bg-[#2B7FFF] text-white text-xs font-bold rounded hover:bg-blue-600 transition-all shadow-xs"
                  style={{ borderRadius: '4px' }}
                >
                  [APPROVE ACTION]
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
