// src/components/Overview/KpiStrip.tsx
import React from 'react';
import { Card } from '../Common/Card';

export const KpiStrip: React.FC = () => {
  const metrics = [
    { label: 'Active Trains', value: '1,284', status: 'ON TIME', color: 'text-emerald-600' },
    { label: 'Track Circuits', value: '4,820', status: 'MONITORED', color: 'text-blue-600' },
    { label: 'Signals Active', value: '1,240', status: 'ASPECT OK', color: 'text-emerald-600' },
    { label: 'Incidents Logged', value: '02', status: 'ACTION REQD', color: 'text-amber-600' },
    { label: 'Platform Holds', value: '01', status: 'PLATFORM 18', color: 'text-indigo-600' },
    { label: 'Telemetry Latency', value: '<85ms', status: 'SUB-100MS', color: 'text-emerald-600' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {metrics.map((item, idx) => (
        <Card key={idx} className="p-4">
          <div className="text-xs font-medium text-slate-500 mb-1">{item.label}</div>
          <div className="text-2xl font-bold text-[#0F172A] tracking-tight mb-1">{item.value}</div>
          <div className={`text-[10px] font-mono font-bold ${item.color}`}>{item.status}</div>
        </Card>
      ))}
    </div>
  );
};
