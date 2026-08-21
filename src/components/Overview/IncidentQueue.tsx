'use client';

// src/components/Overview/IncidentQueue.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { MOCK_INCIDENTS } from '@/lib/mockData';
import { fetchIncidentQueue } from '@/lib/apiClient';
import { IncidentRecord, SeverityCategory } from '@/types/apiContracts';

interface IncidentQueueProps {
  incidents?: IncidentRecord[];
  selectedIncidentId?: string;
  onSelectIncident?: (incident: IncidentRecord) => void;
  onApproveAction?: (incidentId: string) => void;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  incidents: initialIncidents = MOCK_INCIDENTS,
  selectedIncidentId,
  onSelectIncident,
  onApproveAction
}) => {
  const [incidentsList, setIncidentsList] = useState<IncidentRecord[]>(initialIncidents);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<'ALL' | SeverityCategory>('ALL');
  const [localStatusMap, setLocalStatusMap] = useState<Record<string, IncidentRecord['status']>>({});

  useEffect(() => {
    let isMounted = true;
    fetchIncidentQueue('all', 'all').then((data) => {
      if (isMounted && data && data.length > 0) {
        setIncidentsList(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApprove = (e: React.MouseEvent, incidentId: string) => {
    e.stopPropagation();
    setLocalStatusMap((prev) => ({ ...prev, [incidentId]: 'EXECUTING' }));
    
    setTimeout(() => {
      setLocalStatusMap((prev) => ({ ...prev, [incidentId]: 'RESOLVED' }));
    }, 1200);

    if (onApproveAction) {
      onApproveAction(incidentId);
    }
  };

  const filteredIncidents = incidentsList.filter((item) => {
    if (activeSeverityFilter === 'ALL') return true;
    return item.severityCategory === activeSeverityFilter;
  });

  const pendingCount = incidentsList.filter(
    (item) => (localStatusMap[item.incidentId] || item.status) === 'PENDING_APPROVAL'
  ).length;

  return (
    <Card
      title="AI Triage Incident Queue"
      action={
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 bg-[#E6F0FA] text-[#2B7FFF] border border-[#D0DFEE] text-[11px] font-bold font-mono rounded">
            {pendingCount} Pending Approval
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Severity Filter Tabs */}
        <div className="flex items-center justify-between border-b border-[#D0DFEE] pb-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500 font-semibold mr-1">Filter Severity:</span>
            {(['ALL', 'CRITICAL', 'MODERATE', 'LOW'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveSeverityFilter(cat)}
                className={`px-2.5 py-1 text-xs font-bold font-mono transition-all rounded ${
                  activeSeverityFilter === cat
                    ? 'bg-[#2B7FFF] text-white shadow-xs'
                    : 'bg-[#E6F0FA] text-[#0F172A] hover:bg-slate-200 border border-[#D0DFEE]'
                }`}
                style={{ borderRadius: '4px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
            Showing {filteredIncidents.length} of {incidentsList.length} anomalies
          </div>
        </div>

        {/* Incident List */}
        <div className="space-y-3">
          {filteredIncidents.length === 0 ? (
            <div className="py-8 text-center bg-[#F0F6FC] rounded-xl border border-dashed border-[#D0DFEE]">
              <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 10 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-bold text-[#0F172A]">No incidents found for severity filter "{activeSeverityFilter}"</p>
              <p className="text-[11px] text-slate-500">All track safety telemetry parameters are operating within standard parameters.</p>
            </div>
          ) : (
            filteredIncidents.map((item) => {
              const currentStatus = localStatusMap[item.incidentId] || item.status;
              const isSelected = selectedIncidentId === item.incidentId;
              const primaryBox = item.boundingBoxes && item.boundingBoxes[0];

              return (
                <div
                  key={item.incidentId}
                  onClick={() => onSelectIncident && onSelectIncident(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-[#2B7FFF] bg-blue-50/40 shadow-xs'
                      : 'border-[#D0DFEE] bg-white hover:border-[#2B7FFF] hover:shadow-xs'
                  }`}
                  style={{ borderRadius: '12px' }}
                >
                  {/* Left Metadata Group */}
                  <div className="flex items-start sm:items-center space-x-3">
                    {/* Severity Badge with Status Dot */}
                    <div className="flex flex-col items-center">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-extrabold font-mono rounded flex items-center space-x-1.5 ${
                          item.severityCategory === 'CRITICAL'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : item.severityCategory === 'MODERATE'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                        style={{ borderRadius: '4px' }}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.severityCategory === 'CRITICAL'
                              ? 'bg-red-600 animate-pulse'
                              : item.severityCategory === 'MODERATE'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span>{item.severityCategory}</span>
                      </span>
                    </div>

                    <div>
                      {/* Title & Timestamp */}
                      <div className="text-sm font-bold text-[#0F172A] flex items-center space-x-2 flex-wrap">
                        <span>Incident {item.incidentId}</span>
                        <span className="text-xs text-slate-400 font-mono font-normal">({item.timestamp})</span>
                        
                        {/* Hazard Category Tag */}
                        {primaryBox && (
                          <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#E6F0FA] text-[#426188] border border-[#D0DFEE] rounded">
                            {primaryBox.class} @ {primaryBox.estimatedDistanceMeters}m
                          </span>
                        )}
                      </div>

                      {/* Sub-telemetry Detail */}
                      <div className="text-xs text-slate-500 font-mono mt-1 flex items-center space-x-3 flex-wrap gap-y-1">
                        <span>Cam: <strong className="text-slate-700">{item.cameraType}</strong> ({item.sourceCameraId})</span>
                        <span className="text-slate-300">|</span>
                        <span className="flex items-center space-x-1">
                          <span>Conf:</span>
                          <span className="font-bold text-[#0F172A]">{(item.severityScore * 100).toFixed(1)}%</span>
                          <span className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden inline-block ml-1">
                            <span
                              className={`h-full block ${
                                item.severityScore > 0.9 ? 'bg-red-500' : item.severityScore > 0.7 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${item.severityScore * 100}%` }}
                            />
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Group */}
                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <span className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-semibold rounded">
                      {item.assignedAgent}
                    </span>

                    {currentStatus === 'PENDING_APPROVAL' && (
                      <button
                        onClick={(e) => handleApprove(e, item.incidentId)}
                        className="px-3.5 py-1.5 bg-[#2B7FFF] text-white text-xs font-bold rounded hover:bg-blue-600 active:bg-blue-700 transition-all shadow-xs flex items-center space-x-1.5"
                        style={{ borderRadius: '4px' }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>[APPROVE ACTION]</span>
                      </button>
                    )}

                    {currentStatus === 'EXECUTING' && (
                      <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-mono font-bold rounded flex items-center space-x-1.5" style={{ borderRadius: '4px' }}>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>EXECUTING...</span>
                      </span>
                    )}

                    {currentStatus === 'RESOLVED' && (
                      <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold rounded flex items-center space-x-1" style={{ borderRadius: '4px' }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 10 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>APPROVED / RESOLVED</span>
                      </span>
                    )}

                    {currentStatus === 'REJECTED' && (
                      <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs font-mono font-bold rounded" style={{ borderRadius: '4px' }}>
                        REJECTED
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
};
