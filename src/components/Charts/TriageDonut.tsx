// src/components/Charts/TriageDonut.tsx
// Departmental Demand Triage Distribution Donut Chart (TICKET-DEV2-03)

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { MaintenanceDemand, DepartmentCode } from '@/types/apiContracts';
import { MOCK_DEMANDS } from '@/lib/mockData';
import {
  TriageDonutProps,
  DepartmentSliceData,
  DEPARTMENT_METADATA_MAP
} from './types';

/**
 * Pure helper function to aggregate maintenance demands by department.
 * FDE zero-defect guarantee: Safe on null, undefined, and empty arrays.
 */
export function aggregateDemandsByDepartment(
  demands: MaintenanceDemand[] = [],
  selectedDepartment: DepartmentCode | 'ALL' | string = 'ALL'
): {
  slices: DepartmentSliceData[];
  totalDemandsCount: number;
  totalP1Count: number;
  totalDurationMinutes: number;
  totalDurationHours: number;
  activeFilteredCount: number;
} {
  const safeDemands = Array.isArray(demands) ? demands : [];
  
  const filteredDemands = selectedDepartment === 'ALL'
    ? safeDemands
    : safeDemands.filter(d => d.department === selectedDepartment);

  const counts: Record<string, { count: number; p1Count: number; durationMinutes: number }> = {
    TMS_CIVIL: { count: 0, p1Count: 0, durationMinutes: 0 },
    TDMS_ELECTRICAL: { count: 0, p1Count: 0, durationMinutes: 0 },
    SMMS_SIGNAL: { count: 0, p1Count: 0, durationMinutes: 0 },
    ROLLING_STOCK: { count: 0, p1Count: 0, durationMinutes: 0 }
  };

  safeDemands.forEach(d => {
    const deptKey = (d.department in counts) ? d.department : 'ROLLING_STOCK';
    const isP1 = d.urgencyTier === 'P1_CRITICAL' || (d as any).urgencyTier === 'CRITICAL' || d.urgencyScore >= 0.8;
    counts[deptKey].count += 1;
    if (isP1) counts[deptKey].p1Count += 1;
    counts[deptKey].durationMinutes += d.durationMinutes || 0;
  });

  const totalDemandsCount = safeDemands.length;
  const totalP1Count = Object.values(counts).reduce((sum, c) => sum + c.p1Count, 0);
  const totalDurationMinutes = Object.values(counts).reduce((sum, c) => sum + c.durationMinutes, 0);
  const totalDurationHours = Number((totalDurationMinutes / 60).toFixed(1));

  const deptKeys: Array<DepartmentCode | 'ROLLING_STOCK'> = [
    'TMS_CIVIL',
    'TDMS_ELECTRICAL',
    'SMMS_SIGNAL',
    'ROLLING_STOCK'
  ];

  const slices: DepartmentSliceData[] = deptKeys.map(key => {
    const meta = DEPARTMENT_METADATA_MAP[key] || DEPARTMENT_METADATA_MAP.OTHER;
    const stat = counts[key] || { count: 0, p1Count: 0, durationMinutes: 0 };
    const percentage = totalDemandsCount > 0 ? Number(((stat.count / totalDemandsCount) * 100).toFixed(1)) : 0;

    return {
      department: key,
      label: meta.label,
      shortLabel: meta.shortLabel,
      description: meta.description,
      count: stat.count,
      p1Count: stat.p1Count,
      totalDurationMinutes: stat.durationMinutes,
      totalDurationHours: Number((stat.durationMinutes / 60).toFixed(1)),
      color: meta.color,
      darkColor: meta.darkColor,
      bgColor: meta.bgColor,
      borderColor: meta.borderColor,
      percentage
    };
  });

  return {
    slices,
    totalDemandsCount,
    totalP1Count,
    totalDurationMinutes,
    totalDurationHours,
    activeFilteredCount: filteredDemands.length
  };
}

export const TriageDonut: React.FC<TriageDonutProps> = ({
  demands = MOCK_DEMANDS,
  selectedDepartment = 'ALL',
  onSelectDepartment,
  width,
  height = 280,
  innerRadius = '62%',
  outerRadius = '88%',
  showCenterSummary = true,
  showBreakdownList = true,
  className = ''
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [activeDept, setActiveDept] = useState<DepartmentCode | 'ALL' | string>(selectedDepartment);
  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setActiveDept(selectedDepartment);
  }, [selectedDepartment]);

  const aggregated = useMemo(() => {
    return aggregateDemandsByDepartment(demands, activeDept);
  }, [demands, activeDept]);

  const handleDepartmentClick = (dept: DepartmentCode | 'ALL' | string) => {
    const nextDept = activeDept === dept ? 'ALL' : dept;
    setActiveDept(nextDept);
    if (onSelectDepartment) {
      onSelectDepartment(nextDept as DepartmentCode | 'ALL');
    }
  };

  // Only render non-zero slices in Recharts Pie
  const activeSlices = useMemo(() => {
    return aggregated.slices.filter(s => s.count > 0);
  }, [aggregated.slices]);

  // Center HUD Dynamic Calculation
  const centerDisplay = useMemo(() => {
    if (activeDept !== 'ALL') {
      const selectedSlice = aggregated.slices.find(s => s.department === activeDept);
      if (selectedSlice) {
        return {
          count: selectedSlice.count < 10 ? `0${selectedSlice.count}` : `${selectedSlice.count}`,
          label: selectedSlice.shortLabel.toUpperCase(),
          hours: `${selectedSlice.totalDurationHours}h POSSESSION`,
          p1Text: selectedSlice.p1Count > 0 ? `${selectedSlice.p1Count} P1 ACTIVE` : '0 P1 ACTIVE',
          isFiltered: true
        };
      }
    }

    const countPadded = aggregated.totalDemandsCount < 10
      ? `0${aggregated.totalDemandsCount}`
      : `${aggregated.totalDemandsCount}`;

    return {
      count: countPadded,
      label: 'TOTAL DEMANDS',
      hours: `${aggregated.totalDurationHours}h POSSESSION`,
      p1Text: `${aggregated.totalP1Count} P1 ACTIVE`,
      isFiltered: false
    };
  }, [activeDept, aggregated]);

  return (
    <div
      data-testid="triage-donut-card"
      className={`bg-white border border-[#D0DFEE] rounded-[6px] p-5 shadow-sm flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 pb-3 border-b border-[#E2E8F0] dark:border-[#1c1d22]">
        <div>
          <h2 className="text-[15px] font-bold text-[#0F172A] dark:text-[#e2e3e9] flex items-center gap-2">
            <svg className="w-4 h-4 text-[#2B7FFF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
              <path d="M22 12A10 10 0 0 0 12 2v10z" />
            </svg>
            <span>Departmental Demand Triage Distribution</span>
          </h2>
          <p className="text-[12px] text-[#64748B] dark:text-[#9194a1] mt-0.5">
            Maintenance workload allocation across Civil, Electrical, Signal, and Rolling Stock
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleDepartmentClick('ALL')}
          className={`text-[11px] font-bold px-2 py-0.5 rounded-[4px] font-mono tracking-wider transition-colors cursor-pointer ${
            activeDept === 'ALL'
              ? 'bg-[#FEF3C7] dark:bg-[#221808] text-[#92400E] dark:text-[#f7c978] border border-[#FCD34D] dark:border-[#4a3411]'
              : 'bg-[#EFF6FF] dark:bg-[#0b1d33] text-[#2B7FFF] dark:text-[#77C6FF] border border-[#BFDBFE] dark:border-[#1e3a5f]'
          }`}
        >
          {activeDept === 'ALL'
            ? 'ALL DEPARTMENTS'
            : `FILTER: ${DEPARTMENT_METADATA_MAP[activeDept as DepartmentCode]?.shortLabel || activeDept}`}
        </button>
      </div>

      {/* Donut Chart and Center HUD Canvas */}
      <div className="relative w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {isMounted ? (
          aggregated.totalDemandsCount === 0 ? (
            /* FDE Zero-State Fallback Ring */
            <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-[#CBD5E1] dark:border-[#2e3038] rounded-[6px] bg-[#F8FAFC] dark:bg-[#121317]">
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-[#CBD5E1] dark:border-[#2e3038] flex flex-col items-center justify-center">
                <span className="text-[20px] font-mono font-bold text-[#64748B] dark:text-[#9194a1]">00</span>
                <span className="text-[9px] font-mono font-semibold text-[#94A3B8] dark:text-[#5e616e]">EMPTY QUEUE</span>
              </div>
              <p className="text-[12px] font-semibold text-[#64748B] dark:text-[#9194a1] mt-3">No Active Demands in Queue</p>
            </div>
          ) : (
            <ResponsiveContainer width={(width as number | `${number}%`) ?? '100%'} height="100%">
              <PieChart>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DepartmentSliceData;
                      return (
                        <div className="bg-white dark:bg-[#040406] border border-[#CBD5E1] dark:border-[#1c1d22] rounded-[4px] p-2.5 shadow-lg text-[11.5px] font-sans">
                          <div className="font-bold text-[#0F172A] dark:text-[#e2e3e9] border-b border-[#E2E8F0] dark:border-[#1c1d22] pb-1 mb-1.5 flex items-center justify-between gap-4">
                            <span>{data.label}</span>
                            <span className="font-mono text-[#2B7FFF] dark:text-[#77C6FF]">{data.percentage}%</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[#334155] dark:text-[#c7c9d1]">
                            <span>Demands Count:</span>
                            <span className="font-mono font-bold">{data.count} ({data.totalDurationHours}h)</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-[#EF4444] dark:text-[#ff7b88]">
                            <span>P1 Critical:</span>
                            <span className="font-mono font-bold">{data.p1Count} Demands</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Pie
                  data={activeSlices}
                  dataKey="count"
                  nameKey="shortLabel"
                  cx="50%"
                  cy="50%"
                  innerRadius={innerRadius}
                  outerRadius={outerRadius}
                  paddingAngle={3}
                  isAnimationActive={false}
                  onClick={(data: any) => {
                    const dept = data?.department || data?.payload?.department;
                    if (dept) handleDepartmentClick(dept);
                  }}
                  onMouseEnter={(_, index) => setHoveredSliceIndex(index)}
                  onMouseLeave={() => setHoveredSliceIndex(null)}
                  cursor="pointer"
                >
                  {activeSlices.map((entry, index) => {
                    const isSelected = activeDept === entry.department;
                    const isHovered = hoveredSliceIndex === index;
                    return (
                      <Cell
                        key={`cell-${entry.department}`}
                        fill={entry.color}
                        stroke={isSelected ? '#2B7FFF' : '#040406'}
                        strokeWidth={isSelected || isHovered ? 2.5 : 1.5}
                        opacity={activeDept === 'ALL' || isSelected ? 1 : 0.45}
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[12px] text-[#64748B] dark:text-[#9194a1] font-mono">
            Initializing Demand Triage Donut...
          </div>
        )}

        {/* Absolute Centered Donut HUD */}
        {showCenterSummary && aggregated.totalDemandsCount > 0 && (
          <div
            data-testid="donut-center-hud"
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
          >
            <div className="w-28 h-28 rounded-full bg-white dark:bg-[#040406] border border-[#E2E8F0] dark:border-[#1c1d22] shadow-sm flex flex-col items-center justify-center text-center p-2">
              <span className="text-[20px] font-extrabold font-mono text-[#0F172A] dark:text-[#ffffff] leading-tight">
                {centerDisplay.count}
              </span>
              <span className="text-[9.5px] font-bold text-[#64748B] dark:text-[#9194a1] uppercase tracking-wide leading-tight">
                {centerDisplay.label}
              </span>
              <span className="text-[9px] font-extrabold font-mono text-[#2B7FFF] dark:text-[#77C6FF] mt-0.5">
                {centerDisplay.hours}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Department Breakdown Cards */}
      {showBreakdownList && (
        <div className="flex flex-col gap-2 mt-4">
          {aggregated.slices.map(slice => {
            const isSelected = activeDept === slice.department;
            return (
              <div
                key={`card-${slice.department}`}
                data-testid={`dept-card-${slice.department}`}
                onClick={() => handleDepartmentClick(slice.department)}
                className={`flex items-center justify-between p-2.5 border rounded-[4px] cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#2B7FFF] bg-[#EFF6FF] dark:bg-[#121317] dark:border-[#2B7FFF] shadow-xs'
                    : 'border-[#E2E8F0] dark:border-[#1c1d22] bg-[#F8FAFC] dark:bg-[#040406] hover:border-[#BFDBFE] dark:hover:border-[#2e3038] hover:bg-[#F1F5F9] dark:hover:bg-[#121317]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-7 rounded-[2px]" style={{ backgroundColor: slice.color }}></div>
                  <div>
                    <div className="text-[12.5px] font-bold text-[#0F172A] dark:text-[#e2e3e9]">{slice.label}</div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#9194a1]">{slice.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {slice.p1Count > 0 ? (
                    <span className="bg-[#FEE2E2] dark:bg-[#240b0f] text-[#991B1B] dark:text-[#ff7b88] border border-[#FCA5A5] dark:border-[#521822] text-[10.5px] font-bold px-1.5 py-0.5 rounded-[4px] font-mono">
                      {slice.p1Count} P1 CRITICAL
                    </span>
                  ) : (
                    <span className="bg-[#EFF6FF] dark:bg-[#0b1d33] text-[#1E40AF] dark:text-[#77C6FF] border border-[#DBEAFE] dark:border-[#1e3a5f] text-[10.5px] font-bold px-1.5 py-0.5 rounded-[4px] font-mono">
                      0 P1
                    </span>
                  )}
                  <span
                    className="font-mono text-[11.5px] font-bold px-2 py-0.5 rounded-[4px] bg-white dark:bg-[#121317] border border-[#E2E8F0] dark:border-[#1c1d22]"
                    style={{ color: slice.color }}
                  >
                    {slice.count} Demands ({slice.totalDurationHours}h)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
