'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { JointBlockSchedule, TrainScheduleSlot, TrainClassification } from '@/types/apiContracts';

const CorridorTwin3D = dynamic(() => import('@/components/Three/CorridorTwin3D'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] bg-[#090D16] border border-[#D0DFEE] dark:border-[#1c1d22] rounded-[16px] flex items-center justify-center text-cyan-400 font-mono text-xs animate-pulse">
      Loading 3D Corridor Twin Engine...
    </div>
  )
});

export interface StringChartProps {
  activeBlocks: JointBlockSchedule[];
  trainPaths?: TrainScheduleSlot[];
  selectedBlockId?: string;
  onSelectBlock: (blockId: string) => void;
  onViewDossier?: (blockId: string) => void;
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

export function getBlockSectionKm(block: JointBlockSchedule): { startKm: number; endKm: number } {
  const name = (block.corridorName || '').toLowerCase();
  if (name.includes('dadar') && name.includes('kurla')) {
    return { startKm: 9, endKm: 15 };
  }
  if (name.includes('kurla') && (name.includes('thane') || name.includes('ghatkopar'))) {
    return { startKm: 15, endKm: 33 };
  }
  if (name.includes('thane') && name.includes('kalyan')) {
    return { startKm: 33, endKm: 54 };
  }
  if (name.includes('csmt') && name.includes('dadar')) {
    return { startKm: 0, endKm: 9 };
  }
  if (name.includes('dadar') && name.includes('thane')) {
    return { startKm: 9, endKm: 33 };
  }
  if (block.affectedTrackCircuits?.includes('TC-03')) {
    return { startKm: 9, endKm: 15 };
  }
  if (block.affectedTrackCircuits?.includes('TC-04') || block.affectedTrackCircuits?.includes('TC-05')) {
    return { startKm: 15, endKm: 33 };
  }
  return { startKm: 9, endKm: 33 };
}

export const CorridorStringChart: React.FC<StringChartProps> = ({
  activeBlocks,
  trainPaths = [],
  selectedBlockId,
  onSelectBlock,
  onViewDossier,
  horizon = 'TACTICAL_24H'
}) => {
  const [viewMode, setViewMode] = useState<'2D_CHART' | '3D_TWIN'>('2D_CHART');
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
            stroke="#CBD5E1"
            className="stroke-slate-200 dark:stroke-slate-800"
            strokeDasharray="2 2"
          />
          <text
            x={padding.left - 12}
            y={scaleY(stn.km) + 4}
            textAnchor="end"
            className="text-[11px] font-mono fill-slate-700 dark:fill-[#c7c9d1] font-semibold"
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
              className="stroke-slate-200 dark:stroke-slate-800/80"
            />
            <text
              x={scaleX(timeMin)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-[10px] font-mono fill-slate-500 dark:fill-[#9194a1] font-medium"
            >
              {String(hour).padStart(2, '0')}:00
            </text>
          </g>
        );
      })}
    </g>
  ), []);

  return (
    <div className="bg-white dark:bg-[#040406] border border-[#D0DFEE] dark:border-[#1c1d22] rounded-[16px] p-4 shadow-sm select-none" data-testid="corridor-string-chart">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-[#e2e3e9] flex items-center gap-2">
            <span>Corridor Time-Distance String Chart</span>
            <span className="text-[11px] font-mono font-normal text-slate-500 dark:text-[#9194a1]">(CSMT — KYN Fast Corridor)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-[#9194a1]">
            Marey Stringline Diagram with Joint Shadow-Block Possessions ({horizon})
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 2D vs 3D Viewport Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-[#121317] p-0.5 rounded-[4px] border border-slate-200 dark:border-[#1c1d22] text-xs font-mono">
            <button
              onClick={() => setViewMode('2D_CHART')}
              className={`px-2.5 py-1 rounded-[3px] font-semibold transition-all cursor-pointer ${
                viewMode === '2D_CHART'
                  ? 'bg-white dark:bg-[#1c1d22] text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-[#9194a1] hover:text-slate-900 dark:hover:text-[#e2e3e9]'
              }`}
              data-testid="view-2d-button"
            >
              📈 2D String Chart
            </button>
            <button
              onClick={() => setViewMode('3D_TWIN')}
              className={`px-2.5 py-1 rounded-[3px] font-semibold transition-all cursor-pointer ${
                viewMode === '3D_TWIN'
                  ? 'bg-[#2B7FFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-[#9194a1] hover:text-slate-900 dark:hover:text-[#e2e3e9]'
              }`}
              data-testid="view-3d-button"
            >
              🌐 3D Corridor Twin
            </button>
          </div>

          <span className="text-xs font-mono bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-[4px] border border-blue-200 dark:border-blue-500/30 font-semibold">
            ⚡ White-Corridor: 01:30 - 04:45 IST
          </span>
        </div>
      </div>

      {viewMode === '3D_TWIN' ? (
        <div className="w-full mt-2">
          <CorridorTwin3D
            activeBlocks={activeBlocks}
            trainPaths={trainPaths}
            selectedBlockId={selectedBlockId}
            onSelectBlock={onSelectBlock}
            onViewDossier={onViewDossier}
          />
        </div>
      ) : (
        <>
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
            {trainPaths.map((train, idx) => {
              if (!train.trajectoryPoints || train.trajectoryPoints.length < 2) return null;
              
              const startPt = train.trajectoryPoints[0];
              const pointsStr = train.trajectoryPoints
                .map((pt) => `${scaleX(pt.departureTimeMinutes)},${scaleY(pt.km)}`)
                .join(' ');

              const colorInfo = TRAIN_COLORS[train.trainType] || { stroke: '#64748B', label: 'Train' };
              const isTopOrigin = startPt.km <= 5;
              const labelY = isTopOrigin ? scaleY(startPt.km) - (idx % 2 === 0 ? 6 : 14) : scaleY(startPt.km) + 12;
              const labelX = scaleX(startPt.departureTimeMinutes);

              return (
                <g key={train.trainNumber} className="train-trajectory group">
                  <polyline
                    points={pointsStr}
                    fill="none"
                    stroke={colorInfo.stroke}
                    strokeWidth={2}
                    strokeOpacity={0.9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {train.trajectoryPoints.length > 0 && (
                    <text
                      x={labelX}
                      y={labelY}
                      textAnchor="middle"
                      className="text-[9px] font-mono fill-slate-700 dark:fill-[#c7c9d1] font-bold"
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
              const { startKm, endKm } = getBlockSectionKm(block);
              const startX = scaleX(block.startTimeMinutes);
              const endX = scaleX(block.endTimeMinutes);
              const startY = scaleY(startKm);
              const endY = scaleY(endKm);
              const blockWidth = Math.max(endX - startX, 40);
              const blockHeight = Math.max(endY - startY, 24);

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
                    className="text-[10px] font-mono font-bold fill-[#2B7FFF] dark:fill-[#38bdf8] pointer-events-none"
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
      <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 border-t border-slate-100 dark:border-[#1c1d22] text-xs text-slate-600 dark:text-[#9194a1]">
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
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 dark:text-slate-500">
          <span>Scale: 0-54 KM | 24 Hours</span>
        </div>
      </div>
    </>
  )}
</div>
  );
};

export default CorridorStringChart;
