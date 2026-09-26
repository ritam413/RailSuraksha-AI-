// src/components/Charts/TriageDonut.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';
import { Card } from '../Common/Card';
import { MaintenanceDemand } from '@/types/apiContracts';
import { MOCK_DEMANDS } from '@/lib/mockData';

export interface TriageDonutProps {
  demands?: MaintenanceDemand[];
  selectedDepartment?: string;
  onSelectDepartment?: (dept: string | null) => void;
  className?: string;
}

interface DeptSummary {
  name: string;
  departmentKey: string;
  value: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  p1Count: number;
  p2Count: number;
  totalDurationMin: number;
  powerBlocksReq: number;
}

export const DEPARTMENT_THEMES: Record<
  string,
  { name: string; color: string; badgeBg: string; badgeText: string }
> = {
  TMS_CIVIL: {
    name: 'TMS Civil Track',
    color: '#F97316',
    badgeBg: 'bg-orange-50 border-orange-200',
    badgeText: 'text-orange-700'
  },
  TDMS_ELECTRICAL: {
    name: 'TDMS OHE Traction',
    color: '#EAB308',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-800'
  },
  SMMS_SIGNAL: {
    name: 'SMMS Signaling & Telecom',
    color: '#2B7FFF',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-700'
  },
  ROLLING_STOCK: {
    name: 'Mechanical & Rolling Stock',
    color: '#64748B',
    badgeBg: 'bg-slate-50 border-slate-200',
    badgeText: 'text-slate-700'
  }
};

/**
 * Summarize supplied demands by department, using mock demands when omitted.
 * Unknown departments count as Civil; falsy durations count as 60 minutes.
 * The bundling estimate counts TC-03, TC-04, or power-block demands and defaults
 * to 75% for an empty list; the window and savings footer use fixed demo values.
 * selectedDepartment initializes local highlighting only. Selection callbacks
 * receive the department key, or null when the active department is clicked again.
 */
export const TriageDonut: React.FC<TriageDonutProps> = ({
  demands = MOCK_DEMANDS,
  selectedDepartment,
  onSelectDepartment,
  className = ''
}) => {
  const [activeDept, setActiveDept] = useState<string | null>(selectedDepartment ?? null);

  const deptSummaries = useMemo<DeptSummary[]>(() => {
    const map: Record<string, DeptSummary> = {
      TMS_CIVIL: {
        name: 'TMS Civil Track',
        departmentKey: 'TMS_CIVIL',
        value: 0,
        color: DEPARTMENT_THEMES.TMS_CIVIL.color,
        badgeBg: DEPARTMENT_THEMES.TMS_CIVIL.badgeBg,
        badgeText: DEPARTMENT_THEMES.TMS_CIVIL.badgeText,
        p1Count: 0,
        p2Count: 0,
        totalDurationMin: 0,
        powerBlocksReq: 0
      },
      TDMS_ELECTRICAL: {
        name: 'TDMS OHE Traction',
        departmentKey: 'TDMS_ELECTRICAL',
        value: 0,
        color: DEPARTMENT_THEMES.TDMS_ELECTRICAL.color,
        badgeBg: DEPARTMENT_THEMES.TDMS_ELECTRICAL.badgeBg,
        badgeText: DEPARTMENT_THEMES.TDMS_ELECTRICAL.badgeText,
        p1Count: 0,
        p2Count: 0,
        totalDurationMin: 0,
        powerBlocksReq: 0
      },
      SMMS_SIGNAL: {
        name: 'SMMS Signaling & Telecom',
        departmentKey: 'SMMS_SIGNAL',
        value: 0,
        color: DEPARTMENT_THEMES.SMMS_SIGNAL.color,
        badgeBg: DEPARTMENT_THEMES.SMMS_SIGNAL.badgeBg,
        badgeText: DEPARTMENT_THEMES.SMMS_SIGNAL.badgeText,
        p1Count: 0,
        p2Count: 0,
        totalDurationMin: 0,
        powerBlocksReq: 0
      },
      ROLLING_STOCK: {
        name: 'Mechanical & Rolling Stock',
        departmentKey: 'ROLLING_STOCK',
        value: 0,
        color: DEPARTMENT_THEMES.ROLLING_STOCK.color,
        badgeBg: DEPARTMENT_THEMES.ROLLING_STOCK.badgeBg,
        badgeText: DEPARTMENT_THEMES.ROLLING_STOCK.badgeText,
        p1Count: 0,
        p2Count: 0,
        totalDurationMin: 0,
        powerBlocksReq: 0
      }
    };

    demands.forEach((d) => {
      const dept = d.department || 'TMS_CIVIL';
      const target = map[dept] || map.TMS_CIVIL;
      target.value += 1;
      target.totalDurationMin += d.durationMinutes || 60;
      if (d.urgencyTier === 'P1_CRITICAL') target.p1Count += 1;
      if (d.urgencyTier === 'P2_SCHEDULED') target.p2Count += 1;
      if (d.requiresPowerBlock) target.powerBlocksReq += 1;
    });

    return Object.values(map).filter((item) => item.value > 0);
  }, [demands]);

  const totalDemands = demands.length;
  const totalP1Critical = deptSummaries.reduce((acc, curr) => acc + curr.p1Count, 0);
  
  // Calculate Bundling Co-location rate: % of demands located in joint shadow blocks
  const bundledCount = demands.filter(
    (d) => d.trackCircuitId === 'TC-03' || d.trackCircuitId === 'TC-04' || d.requiresPowerBlock
  ).length;
  const bundlingRatePercent = totalDemands > 0 ? Math.round((bundledCount / totalDemands) * 100) : 0;

  /**
   * Toggle the highlighted department and notify the optional listener.
   * Listener errors propagate after the state update is queued.
   */
  const handleSliceClick = (deptKey: string) => {
    const next = activeDept === deptKey ? null : deptKey;
    setActiveDept(next);
    if (onSelectDepartment) {
      onSelectDepartment(next);
    }
  };

  return (
    <Card className={`p-5 bg-white border-[#D0DFEE] rounded-2xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D0DFEE]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#F97316] inline-block" />
            <h3 className="text-base font-bold text-[#0F172A] tracking-tight">
              Multi-Department Demand Triage Distribution
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FFF7ED] text-[#EA580C] font-semibold border border-[#FDBA74]">
              TMS · TDMS · SMMS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Requisition breakdown and co-location bundling feasibility across Central Railway silos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            {bundlingRatePercent}% SHADOW BUNDLED
          </span>
        </div>
      </div>

      {/* Main Grid: Donut visual + Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center py-4">
        {/* Left / Center Donut Graphic (7 Cols) */}
        <div className="lg:col-span-6 relative w-full h-[260px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload as DeptSummary;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-[#D0DFEE] text-xs font-mono">
                      <div className="font-bold text-[#0F172A] border-b border-slate-100 pb-1 mb-1.5">
                        {item.name}
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-500">Demands:</span>
                          <span className="font-bold text-[#0F172A]">{item.value}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-rose-600">
                          <span>P1 Urgent:</span>
                          <span className="font-bold">{item.p1Count}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-slate-600">
                          <span>Total Hrs:</span>
                          <span>{(item.totalDurationMin / 60).toFixed(1)} hrs</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Pie
                data={deptSummaries}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                onClick={(entry: any) => handleSliceClick(entry?.departmentKey || entry?.payload?.departmentKey)}
                cursor="pointer"
              >
                {deptSummaries.map((entry) => (
                  <Cell
                    key={`cell-${entry.departmentKey}`}
                    fill={entry.color}
                    stroke={activeDept === entry.departmentKey ? '#0F172A' : '#FFFFFF'}
                    strokeWidth={activeDept === entry.departmentKey ? 3 : 1.5}
                    opacity={activeDept && activeDept !== entry.departmentKey ? 0.45 : 1.0}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Central Donut KPI Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-black text-[#0F172A] font-mono tracking-tight leading-none">
              {totalDemands < 10 ? `0${totalDemands}` : totalDemands}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-1">
              Demands
            </span>
            <span className="text-[10px] font-mono text-emerald-600 font-bold mt-0.5">
              {bundlingRatePercent}% Bundled
            </span>
          </div>
        </div>

        {/* Right Department Breakdown List (6 Cols) */}
        <div className="lg:col-span-6 space-y-2">
          {deptSummaries.map((item) => {
            const isSelected = activeDept === item.departmentKey;
            const pct = Math.round((item.value / totalDemands) * 100);

            return (
              <button
                key={item.departmentKey}
                type="button"
                onClick={() => handleSliceClick(item.departmentKey)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                  isSelected
                    ? 'border-[#0F172A] bg-slate-50 shadow-sm'
                    : 'border-[#D0DFEE] bg-white hover:bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-bold text-[#0F172A]">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.p1Count > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-rose-100 text-rose-800 border border-rose-200">
                        {item.p1Count} P1
                      </span>
                    )}
                    <span className="text-xs font-mono font-black text-[#0F172A]">
                      {item.value} ({pct}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-100">
                  <span>Req. Duration: {(item.totalDurationMin / 60).toFixed(1)}h</span>
                  <span>Power Block: {item.powerBlocksReq > 0 ? `${item.powerBlocksReq} required` : 'None'}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#D0DFEE] bg-slate-50/50 -mx-5 -mb-5 p-4 rounded-b-2xl">
        <div className="text-left">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Critical P1 Requisitions
          </span>
          <span className="text-sm font-black font-mono text-rose-600">
            {totalP1Critical < 10 ? `0${totalP1Critical}` : totalP1Critical} Immediate
          </span>
        </div>

        <div className="text-left">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Joint Shadow Window
          </span>
          <span className="text-sm font-black font-mono text-[#0F172A]">
            01:30 - 04:45 IST
          </span>
        </div>

        <div className="text-left">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
            Corridor Downtime Saved
          </span>
          <span className="text-sm font-black font-mono text-emerald-600">
            85 mins (38.4%)
          </span>
        </div>
      </div>
    </Card>
  );
};
