'use client';

import React, { useMemo } from 'react';
import { JointBlockSchedule, TrainScheduleSlot, TrainClassification } from '@/types/apiContracts';

export interface StringChartProps {
  activeBlocks: JointBlockSchedule[];
  trainPaths?: TrainScheduleSlot[];
  selectedBlockId?: string;
  onSelectBlock: (blockId: string) => void;
  horizon?: 'TACTICAL_24H' | 'OPERATIONAL_7D' | 'STRATEGIC_30D';
}

export const STATIONS = [
  { code: 'CSMT', name: 'CSMT (Mumbai)', km: 0 },
  { code: 'DR',   name: 'Dadar (DR)',     km: 9 },
  { code: 'CLA',  name: 'Kurla (CLA)',    km: 15 },
  { code: 'TNA',  name: 'Thane (TNA)',    km: 33 },
  { code: 'KYN',  name: 'Kalyan (KYN)',   km: 54 }
];

const TRAIN_COLORS: Record<TrainClassification, { stroke: string; label: string }> = {
  PREMIUM_PASSENGER: { stroke: '#2563EB', label: 'Vande Bharat / Rajdhani' },
  EXPRESS: { stroke: '#059669', label: 'Mail / Express' },
  SUBURBAN: { stroke: '#64748B', label: 'Suburban EMU' },
  FREIGHT: { stroke: '#D97706', label: 'Freight BOXN' }
};

export const CorridorStringChart: React.FC<StringChartProps> = ({
  activeBlocks,
  trainPaths = [],
  selectedBlockId,
  onSelectBlock,
  horizon = 'TACTICAL_24H'
}) => {
  const width = 860;
  const height = 440;
  const padding = { top: 30, right: 30, bottom: 40, left: 110 };

  const scaleX = (timeMinutes: number) => 
    padding.left + (timeMinutes / 1440) * (width - padding.left - padding.right);

  const scaleY = (km: number) => 
    padding.top + (km / 54) * (height - padding.top - padding.bottom);

  // 1. Static Background Grid (Station Y-Lines and 3-Hourly X-Lines)
  const backgroundGrid = useMemo(() => (
    <g className="grid-layer" data-testid="background-grid">
      {/* Station horizontal guidelines */}
      {STATIONS.map((stn) => (
        <g key={stn.code} className="station-guide">
          <line
            x1={padding.left}
            y1={scaleY(stn.km)}
            x2={width - padding.right}
            y2={scaleY(stn.km)}
            stroke="#E2E8F0"
            strokeDasharray="2 2"
          />
          <text
            x={padding.left - 12}
            y={scaleY(stn.km) + 4}
            textAnchor="end"
            className="text-[11px] font-mono fill-slate-700 font-semibold"
          >
            {stn.name}
          </text>
        </g>
      ))}

      {/* 3-hour vertical time guidelines (00:00 to 24:00) */}
      {Array.from({ length: 9 }).map((_, i) => {
        const hour = i * 3;
        const timeMin = hour * 60;
        return (
          <g key={hour} className="time-guide">
            <line
              x1={scaleX(timeMin)}
              y1={padding.top}
              x2={scaleX(timeMin)}
              y2={height - padding.bottom}
              stroke="#E2E8F0"
            />
            <text
              x={scaleX(timeMin)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-[10px] font-mono fill-slate-500 font-medium"
            >
              {String(hour).padStart(2, '0')}:00
            </text>
          </g>
        );
      })}
    </g>
  ), []);

  return (
    <div className="bg-white border border-[#D0DFEE] rounded-[16px] p-4 shadow-sm select-none" data-testid="corridor-string-chart">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span>Corridor Time-Distance String Chart</span>
            <span className="text-[11px] font-mono font-normal text-slate-500">(CSMT — KYN Fast Corridor)</span>
          </h3>
          <p className="text-xs text-slate-500">
            Marey Stringline Diagram with Joint Shadow-Block Possessions ({horizon})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-[4px] border border-blue-200 font-semibold">
            ⚡ White-Corridor: 01:30 - 04:45 IST
          </span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[700px] select-none"
          role="img"
          aria-label="CSMT to Kalyan Marey String Chart"
        >
          {backgroundGrid}

          {/* 2. Train Stringline Trajectories */}
          <g className="train-paths-layer" data-testid="train-paths-layer">
            {trainPaths.map((train) => {
              if (!train.trajectoryPoints || train.trajectoryPoints.length < 2) return null;
              
              const pointsStr = train.trajectoryPoints
                .map((pt) => `${scaleX(pt.departureTimeMinutes)},${scaleY(pt.km)}`)
                .join(' ');

              const colorInfo = TRAIN_COLORS[train.trainType] || { stroke: '#64748B', label: 'Train' };

              return (
                <g key={train.trainNumber} className="train-trajectory group">
                  <polyline
                    points={pointsStr}
                    fill="none"
                    stroke={colorInfo.stroke}
                    strokeWidth={1.75}
                    strokeOpacity={0.85}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {train.trajectoryPoints.length > 0 && (
                    <text
                      x={scaleX(train.trajectoryPoints[0].departureTimeMinutes) + 4}
                      y={scaleY(train.trajectoryPoints[0].km) - 4}
                      className="text-[9px] font-mono fill-slate-600 font-semibold opacity-80"
                    >
                      {train.trainNumber}
                    </text>
                  )}
                </g>
              );
            })}
          </g>

          {/* 3. Shaded Rectangular Joint Maintenance Block Windows */}
          <g className="blocks-layer" data-testid="blocks-layer">
            {activeBlocks.map((block) => {
              const startX = scaleX(block.startTimeMinutes);
              const endX = scaleX(block.endTimeMinutes);
              const startY = scaleY(9);  // Dadar section default start
              const endY = scaleY(33);   // Thane section default end
              const blockWidth = Math.max(endX - startX, 40);
              const blockHeight = Math.max(endY - startY, 40);

              const isSelected = block.blockId === selectedBlockId;

              return (
                <g
                  key={block.blockId}
                  onClick={() => onSelectBlock(block.blockId)}
                  className="cursor-pointer transition-all duration-150"
                  data-testid={`block-${block.blockId}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectBlock(block.blockId);
                    }
                  }}
                >
                  <rect
                    x={startX}
                    y={startY}
                    width={blockWidth}
                    height={blockHeight}
                    fill="#2B7FFF"
                    fillOpacity={isSelected ? 0.28 : 0.14}
                    stroke="#2B7FFF"
                    strokeWidth={isSelected ? 2.5 : 1.2}
                    strokeDasharray="4 2"
                    rx={4}
                  />
                  <text
                    x={startX + blockWidth / 2}
                    y={startY + blockHeight / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-[10px] font-mono font-bold fill-[#2B7FFF] pointer-events-none"
                  >
                    ⚡ SHADOW BLOCK ({block.downtimeSavedMinutes}m Saved)
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Legend & Classification Badges */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="w-3 h-0.5 bg-[#2563EB] inline-block rounded"></span>
            <span>Vande Bharat / Rajdhani</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="w-3 h-0.5 bg-[#059669] inline-block rounded"></span>
            <span>Mail / Express</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="w-3 h-0.5 bg-[#64748B] inline-block rounded"></span>
            <span>Suburban EMU</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="w-3 h-0.5 bg-[#D97706] inline-block rounded"></span>
            <span>Freight</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>Scale: 0-54 KM | 24 Hours</span>
        </div>
      </div>
    </div>
  );
};

export default CorridorStringChart;
