// src/components/Overview/IncidentQueue.tsx
'use client';

import React, { useState } from 'react';
import { Card } from '../Common/Card';
import { MOCK_INCIDENTS } from '@/lib/mockData';
import { IncidentRecord, SeverityCategory } from '@/types/apiContracts';

interface IncidentQueueProps {
  onSelectIncident?: (incident: IncidentRecord) => void;
  onApproveAction?: (incidentId: string) => void;
  selectedIncidentId?: string;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  onSelectIncident,
  onApproveAction,
  selectedIncidentId
}) => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>(MOCK_INCIDENTS);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | SeverityCategory>('ALL');

  const handleApprove = (e: React.MouseEvent, incidentId: string) => {
    e.stopPropagation();
    setIncidents((prev) =>
      prev.map((item) =>
        item.incidentId === incidentId ? { ...item, status: 'RESOLVED' } : item
      )
    );
    if (onApproveAction) onApproveAction(incidentId);
  };

  const filteredIncidents = incidents.filter((item) => {
    if (filterSeverity === 'ALL') return true;
    return item.severityCategory === filterSeverity;
  });

  return (
    <Card title="AI Triage Incident Queue & Safety Action Dispatch">
      <div className="space-y-4">
        {/* Severity Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#F0F6FC]">
          <div className="flex items-center space-x-2">
            {(['ALL', 'CRITICAL', 'MODERATE', 'LOW'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 text-xs font-mono font-bold rounded transition-all ${
                  filterSeverity === sev
                    ? 'bg-[#2B7FFF] text-white shadow-xs'
                    : 'bg-[#F0F6FC] text-slate-600 hover:bg-slate-200'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {sev}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-slate-500">
            Showing {filteredIncidents.length} of {incidents.length} Active Feeds
          </span>
        </div>

        {/* Incident List */}
        <div className="space-y-3">
          {filteredIncidents.map((item) => {
            const isSelected = selectedIncidentId === item.incidentId;
            return (
              <div
                key={item.incidentId}
                onClick={() => onSelectIncident && onSelectIncident(item)}
                className={`p-4 border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50/70 border-[#2B7FFF] shadow-md ring-1 ring-[#2B7FFF]'
                    : 'bg-white border-[#D0DFEE] hover:border-[#2B7FFF]'
                }`}
                style={{ borderRadius: '12px' }}
              >
                <div className="flex items-center space-x-3">
                  {/* Severity Badge */}
                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded ${
                      item.severityCategory === 'CRITICAL'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : item.severityCategory === 'MODERATE'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                    style={{ borderRadius: '4px' }}
                  >
                    {item.severityCategory}
                  </span>

                  <div>
                    <div className="text-sm font-bold text-[#0F172A] flex items-center space-x-2">
                      <span>Incident {item.incidentId}</span>
                      <span className="text-xs text-slate-400 font-mono font-normal">
                        ({item.timestamp})
                      </span>
                      {item.status === 'RESOLVED' && (
                        <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold rounded">
                          ✓ RESOLVED
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Camera: <strong className="text-slate-700">{item.sourceCameraId}</strong> | Confidence:{' '}
                      <strong className="text-slate-700">{(item.severityScore * 100).toFixed(1)}%</strong> | Anomaly:{' '}
                      <strong className="text-[#2B7FFF]">{item.boundingBoxes[0]?.class || 'HAZARD'}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-xs font-mono text-slate-600 font-semibold block">
                      {item.assignedAgent}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.cameraType === 'LOCO_CAB' ? 'Loco Forward View' : 'Platform Gateway CCTV'}
                    </span>
                  </div>

                  {item.status === 'PENDING_APPROVAL' ? (
                    <button
                      onClick={(e) => handleApprove(e, item.incidentId)}
                      className="px-3 py-1.5 bg-[#2B7FFF] text-white text-xs font-bold rounded hover:bg-blue-600 active:scale-95 transition-all shadow-xs"
                      style={{ borderRadius: '4px' }}
                    >
                      [APPROVE ACTION]
                    </button>
                  ) : (
                    <span
                      className="px-3 py-1.5 bg-slate-100 text-slate-500 text-xs font-mono font-bold rounded border border-slate-200"
                      style={{ borderRadius: '4px' }}
                    >
                      ACTION EXECUTED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
