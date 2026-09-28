'use client';

import React, { useState } from 'react';

interface DepartmentInfo {
  id: string;
  name: string;
  role: string;
  badge: string;
  color: string;
  accentBg: string;
  description: string;
  telemetry: { label: string; value: string }[];
  safetyProtocol: string;
}

const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'TRD',
    name: 'Traction Distribution (TRD)',
    role: 'Electrical & 25kV OHE Catenary',
    badge: 'POWER ISOLATION',
    color: 'text-amber-400',
    accentBg: 'bg-amber-500/10 border-amber-500/30',
    description:
      'Coordinates real-time power de-energization, pantograph contact wire tensioning, and grounding rod verification.',
    telemetry: [
      { label: 'Voltage State', value: '0.0 kV (Discharged)' },
      { label: 'Grounding Rods', value: '4 Secured' },
      { label: 'Catenary Slack', value: '0.02 mm / 100m' },
    ],
    safetyProtocol: 'SCADA Interlocked Power Cutout with Double-Earth Verification',
  },
  {
    id: 'TRACK',
    name: 'Civil Engineering (Track & P-Way)',
    role: 'Ultrasonic Flaw Detection & Weld Repair',
    badge: 'STRUCTURAL INTEGRITY',
    color: 'text-emerald-400',
    accentBg: 'bg-emerald-500/10 border-emerald-500/30',
    description:
      'Autonomous rail flaw classification from forward camera telemetry, thermite weld replacement, and sleeper tamping.',
    telemetry: [
      { label: 'Defect Severity', value: 'CRITICAL (Cavitation)' },
      { label: 'Thermite Weld Time', value: '45 min' },
      { label: 'Gauge Clearance', value: '1676 mm Standard' },
    ],
    safetyProtocol: 'Ultrasonic A-Scan Transducer Verification with GPS Lock',
  },
  {
    id: 'ST',
    name: 'Signal & Telecom (S&T)',
    role: 'Point Switch Machines & Audio Frequency Circuits',
    badge: 'ROUTE ASSURANCE',
    color: 'text-sky-400',
    accentBg: 'bg-sky-500/10 border-sky-500/30',
    description:
      '1:12 turnout point motor stroke measurement, relay locking checks, and electronic interlocking route locking.',
    telemetry: [
      { label: 'Switch Throw Time', value: '2.8s Normal' },
      { label: 'Motor Current', value: '3.4 A Peak' },
      { label: 'Track Circuit', value: 'TC-03 High Impedance' },
    ],
    safetyProtocol: 'Solid State Interlocking (SSI) Dual Relay Cross-Check',
  },
  {
    id: 'KAVACH',
    name: 'Kavach SIL-4 Onboard System',
    role: 'Predictive Emergency Braking Distance',
    badge: 'COLLISION AVOIDANCE',
    color: 'text-purple-400',
    accentBg: 'bg-purple-500/10 border-purple-500/30',
    description:
      'Dynamically enforces temporary speed restrictions (TSR) and calculates weather-adjusted EBD deceleration curves.',
    telemetry: [
      { label: 'Max Approach Speed', value: '30 km/h (Restricted)' },
      { label: 'Brake Decel Rate', value: '0.85 m/s²' },
      { label: 'Radio Packet Latency', value: '18 ms' },
    ],
    safetyProtocol: 'CENELEC EN 50128 SIL-4 Certified Braking Computer',
  },
];

export function MultiDeptSynergyMatrix() {
  const [selectedDept, setSelectedDept] = useState<string>('TRD');
  const active = DEPARTMENTS.find((d) => d.id === selectedDept) || DEPARTMENTS[0];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="pb-8 border-b border-[#1c1d22]">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ae9357] mb-2">
          Multi-Agent Corridor Coordination
        </div>
        <h2 className="text-3xl sm:text-4xl font-display font-medium text-[#e2e3e9] tracking-tight">
          Four Specialized Gangs. One Unified Shadow Block.
        </h2>
        <p className="text-sm text-[#9194a1] mt-2 max-w-2xl">
          RailSuraksha AI dissolves departmental silos by synthesizing Track, Traction, Signalling, and Kavach telemetry into
          a single interlocked execution schedule.
        </p>
      </div>

      {/* 4-Tab Department Selector Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
        {DEPARTMENTS.map((dept) => {
          const isSelected = dept.id === selectedDept;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`p-4 rounded-[12px] text-left transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#121317] border-[#2e3038] shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
                  : 'bg-[#040406] border-[#1c1d22] hover:border-[#2e3038] opacity-75 hover:opacity-100'
              }`}
            >
              <div className={`text-xs font-mono font-semibold ${dept.color}`}>{dept.id}</div>
              <div className="text-sm font-semibold text-[#e2e3e9] mt-1 truncate">{dept.name.split('(')[0]}</div>
              <div className="text-[11px] text-[#9194a1] mt-0.5">{dept.role.split('&')[0]}</div>
            </button>
          );
        })}
      </div>

      {/* Selected Department Dossier Showcase */}
      <div className="mt-6 p-6 sm:p-8 rounded-[16px] bg-[#040406] border border-[#1c1d22]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#1c1d22]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${active.accentBg} ${active.color}`}>
                {active.badge}
              </span>
              <span className="text-xs font-mono text-[#9194a1]">Department Protocol Node</span>
            </div>
            <h3 className="text-2xl font-bold font-display text-[#e2e3e9] mt-2">{active.name}</h3>
            <p className="text-sm text-[#c7c9d1] mt-1">{active.description}</p>
          </div>

          <div className="p-4 rounded-[12px] bg-[#121317] border border-[#1c1d22] self-start lg:self-auto min-w-[280px]">
            <div className="text-[10px] font-mono text-[#ae9357] uppercase">Safety Interlock Standard</div>
            <div className="text-xs font-mono text-[#e2e3e9] mt-1">{active.safetyProtocol}</div>
          </div>
        </div>

        {/* Live Telemetry Data Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {active.telemetry.map((metric, idx) => (
            <div key={idx} className="p-4 rounded-[12px] bg-[#08080a] border border-[#1c1d22]">
              <div className="text-[11px] font-mono text-[#9194a1]">{metric.label}</div>
              <div className="text-lg font-bold font-mono text-[#e2e3e9] mt-1">{metric.value}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default MultiDeptSynergyMatrix;
