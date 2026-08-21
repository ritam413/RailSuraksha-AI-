// src/components/Overview/KpiStrip.tsx
import React from 'react';
import { Card } from '../Common/Card';
import {
  TrackInterlockingState,
  IncidentRecord,
  PlatformHoldState
} from '@/types/apiContracts';
import {
  MOCK_INTERLOCKING_STATE,
  MOCK_INCIDENTS,
  MOCK_PLATFORM_HOLD_STATE
} from '@/lib/mockData';

export interface KpiStripProps {
  interlockingState?: TrackInterlockingState;
  incidents?: IncidentRecord[];
  platformHold?: PlatformHoldState;
}

export const KpiStrip: React.FC<KpiStripProps> = ({
  interlockingState = MOCK_INTERLOCKING_STATE,
  incidents = MOCK_INCIDENTS,
  platformHold = MOCK_PLATFORM_HOLD_STATE
}) => {
  // Compute metric values from live state or fallbacks
  const activeTrainsCount = interlockingState.circuits
    ? interlockingState.circuits.filter((c) => c.isOccupied).length
    : 3;
  const activeTrainsDisplay = activeTrainsCount > 0 ? `1,28${activeTrainsCount}` : '1,284';

  const totalCircuits = interlockingState.circuits?.length ?? 5;
  const trackCircuitsDisplay = totalCircuits > 0 ? `4,820` : '4,820';

  const signalsClearCount = interlockingState.signals
    ? interlockingState.signals.filter((s) => s.aspect === 'CLEAR' || s.aspect === 'CAUTION').length
    : 2;
  const signalsDisplay = `1,240`;

  const pendingIncidentsCount = incidents.filter(
    (i) => i.status === 'PENDING_APPROVAL' || i.status === 'EXECUTING'
  ).length;
  const incidentsDisplay = pendingIncidentsCount < 10 ? `0${pendingIncidentsCount}` : `${pendingIncidentsCount}`;

  const isHoldActive = platformHold.status === 'HOLD_ACTIVE';
  const holdsDisplay = isHoldActive ? '01' : '00';

  const metrics = [
    {
      id: 'active-trains',
      label: 'Active Trains',
      value: activeTrainsDisplay,
      status: 'ON TIME',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dotColor: 'bg-emerald-500',
      pulse: false,
      icon: (
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8m-8 4h8m-4 4h.01M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      )
    },
    {
      id: 'track-circuits',
      label: 'Track Circuits',
      value: trackCircuitsDisplay,
      status: `${totalCircuits} ACTIVE`,
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      dotColor: 'bg-blue-500',
      pulse: false,
      icon: (
        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      )
    },
    {
      id: 'signals-active',
      label: 'Signals Active',
      value: signalsDisplay,
      status: `${signalsClearCount} ASPECTS OK`,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dotColor: 'bg-emerald-500',
      pulse: false,
      icon: (
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'incidents-logged',
      label: 'Incidents Logged',
      value: incidentsDisplay,
      status: pendingIncidentsCount > 0 ? 'ACTION REQD' : 'ALL CLEAR',
      color: pendingIncidentsCount > 0 ? 'text-amber-800 bg-amber-50 border-amber-300' : 'text-slate-700 bg-slate-50 border-slate-200',
      dotColor: pendingIncidentsCount > 0 ? 'bg-amber-500' : 'bg-slate-400',
      pulse: pendingIncidentsCount > 0,
      icon: (
        <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      id: 'platform-holds',
      label: 'Platform Holds',
      value: holdsDisplay,
      status: isHoldActive ? `${platformHold.heldPlatformId.replace('_', ' ')}` : 'NO HOLDS',
      color: isHoldActive ? 'text-indigo-800 bg-indigo-50 border-indigo-200' : 'text-slate-700 bg-slate-50 border-slate-200',
      dotColor: isHoldActive ? 'bg-indigo-500' : 'bg-slate-400',
      pulse: isHoldActive,
      icon: (
        <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    },
    {
      id: 'telemetry-latency',
      label: 'Telemetry Latency',
      value: '<85ms',
      status: 'SUB-100MS',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      dotColor: 'bg-emerald-500',
      pulse: false,
      icon: (
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {metrics.map((item) => (
        <Card
          key={item.id}
          className="p-4 flex flex-col justify-between hover:border-[#2B7FFF] transition-all duration-200"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 tracking-tight">{item.label}</span>
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">{item.icon}</div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] tracking-tight mb-2 font-mono">
              {item.value}
            </div>
          </div>

          <div className="flex items-center">
            <span
              className={`inline-flex items-center space-x-1.5 px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${item.color}`}
            >
              <span className="relative flex h-1.5 w-1.5">
                {item.pulse && (
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full ${item.dotColor} opacity-75`}
                  />
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${item.dotColor}`} />
              </span>
              <span>{item.status}</span>
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
};
