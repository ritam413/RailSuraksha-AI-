# 🎫 `TICKET-DEV1-03`: Dual-Layer SVG Corridor Time-Distance String Chart (Marey Chart)

- **Assignee:** Developer 1 (Lead Integrator)
- **Role:** Core Visualization & SVG Graphics
- **Status:** `BLOCKED` by `TICKET-DEV1-01`
- **Priority:** `P1 (High)`
- **Blocking For:** `TICKET-DEV1-05`
- **Reference Spec:** [`refactoring_plan.md#bead-3-corridoroptimizeragent`](../refactoring_plan.md#bead-3-corridoroptimizeragent) & [`docs/MINIMALIST_YAGNI_EXECUTION_GUIDE.md#3-frontend-dual-layer-react-svg-marey-chart`](../MINIMALIST_YAGNI_EXECUTION_GUIDE.md#3-frontend-dual-layer-react-svg-marey-chart)

---

## 🎯 Objective
Build a high-performance, dual-layer React SVG Marey String Chart (`CorridorStringChart.tsx`) rendering 24-hour train trajectories across the CSMT–Kalyan corridor and interactive shaded joint maintenance block windows.

---

## 📁 File Manifest
- **Create:** `src/components/Planner/CorridorStringChart.tsx`
- **Test:** `tests/CorridorStringChart.test.tsx`

---

## 📐 Component Specification

```tsx
// src/components/Planner/CorridorStringChart.tsx
'use client';

import React, { useMemo } from 'react';
import { JointBlockSchedule, TrainScheduleSlot } from '@/types/apiContracts';

interface StringChartProps {
  activeBlocks: JointBlockSchedule[];
  trainPaths?: TrainScheduleSlot[];
  selectedBlockId?: string;
  onSelectBlock: (blockId: string) => void;
  horizon?: 'TACTICAL_24H' | 'OPERATIONAL_7D' | 'STRATEGIC_30D';
}

const STATIONS = [
  { code: 'CSMT', name: 'CSMT (Mumbai)', km: 0 },
  { code: 'DR',   name: 'Dadar (DR)',     km: 9 },
  { code: 'CLA',  name: 'Kurla (CLA)',    km: 15 },
  { code: 'TNA',  name: 'Thane (TNA)',    km: 33 },
  { code: 'KYN',  name: 'Kalyan (KYN)',   km: 54 }
];

export const CorridorStringChart: React.FC<StringChartProps> = ({
  activeBlocks,
  trainPaths = [],
  selectedBlockId,
  onSelectBlock,
  horizon = 'TACTICAL_24H'
}) => {
  const width = 860;
  const height = 440;
  const padding = { top: 30, right: 30, bottom: 40, left: 100 };

  const scaleX = (timeMinutes: number) => 
    padding.left + (timeMinutes / 1440) * (width - padding.left - padding.right);

  const scaleY = (km: number) => 
    padding.top + (km / 54) * (height - padding.top - padding.bottom);

  // 1. Memoized Static Background Grid
  const backgroundGrid = useMemo(() => (
    <g className="grid-layer">
      {STATIONS.map((stn) => (
        <g key={stn.code}>
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

      {Array.from({ length: 9 }).map((_, i) => {
        const hour = i * 3;
        const timeMin = hour * 60;
        return (
          <g key={hour}>
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
    <div className="bg-white border border-[#D0DFEE] rounded-[16px] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Corridor Time-Distance String Chart (CSMT — KYN Fast Corridor)
          </h3>
          <p className="text-xs text-slate-500">
            Marey Stringline Diagram with Joint Shadow-Block Possessions
          </p>
        </div>
        <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-[4px] border border-blue-200">
          White-Corridor Window: 01:30 - 04:45 IST
        </span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {backgroundGrid}

        {/* 2. Shaded Rectangular Joint Maintenance Block Windows */}
        {activeBlocks.map((block) => {
          const startX = scaleX(block.startTimeMinutes);
          const endX = scaleX(block.endTimeMinutes);
          const startY = scaleY(9);  // Dadar
          const endY = scaleY(33);   // Thane
          const blockWidth = Math.max(endX - startX, 40);
          const blockHeight = endY - startY;

          const isSelected = block.blockId === selectedBlockId;

          return (
            <g key={block.blockId} onClick={() => onSelectBlock(block.blockId)} className="cursor-pointer group">
              <rect
                x={startX}
                y={startY}
                width={blockWidth}
                height={blockHeight}
                fill="#2B7FFF"
                fillOpacity={isSelected ? 0.25 : 0.15}
                stroke="#2B7FFF"
                strokeWidth={isSelected ? 2 : 1}
                strokeDasharray="4 2"
                rx={4}
              />
              <text
                x={startX + blockWidth / 2}
                y={startY + blockHeight / 2}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-[#2B7FFF]"
              >
                ⚡ SHADOW BLOCK ({block.downtimeSavedMinutes}m Saved)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
```

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Write rendering test in `tests/CorridorStringChart.test.tsx`**
- [ ] **Step 2: Implement `src/components/Planner/CorridorStringChart.tsx`**
- [ ] **Step 3: Verify 60fps interaction and test PASS**
  Run `npx vitest run tests/CorridorStringChart.test.tsx`.
- [ ] **Step 4: Commit**
  `git commit -m "feat(planner): build dual-layer SVG Marey string chart"`

---

## ✅ Acceptance Criteria
1. Station horizontal guidelines and hourly time labels render accurately.
2. Clicking a block triggers `onSelectBlock(blockId)`.
3. Zero SVG layout jumping ($\text{CLS} < 0.05$).
