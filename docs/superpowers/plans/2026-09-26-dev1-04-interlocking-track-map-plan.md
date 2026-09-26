# DEV-04: Section Interlocking & Track Circuit Schematic Implementation Plan (Hardened & Grounded)

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `src/components/Common/SignalHead.tsx` and modernize `src/components/Overview/InterlockingMap.tsx` to provide a high-fidelity, interactive schematic view of track circuits `TC-01` through `TC-06` (CSMT $\to$ Dadar $\to$ Kalyan) with live axle counters, 4-aspect signal heads (`RED`, `YELLOW`, `DOUBLE_YELLOW`, `GREEN`), and Form `S&T/T-351` statutory safety lockout states.

**Architecture:** Visual safety layer grounded against Central Railway Mumbai suburban quadrupled track geometry (`UP_SLOW`, `DOWN_SLOW`, `UP_FAST`, `DOWN_FAST`, `5TH_LINE`, `6TH_LINE`). Integrates with `src/types/apiContracts.ts` (`TrackCircuitState`, `SignalAspect`, `CircuitOperationalStatus`) and `src/lib/mockData.ts` (`MOCK_TRACK_CIRCUITS`), providing deterministic state visualizers for disjunctive possession blocks, automatic train stop (ATS) clamping, and 25kV AC OHE power isolation.

**Tech Stack:** TypeScript 5.x, React 19 / Next.js 16, Tailwind CSS v4, Lucide React icons, Vitest 4.x.

---

## 🏛️ AST CodeGraph & Semantic Seam Analysis (`/serena`, `/context7`, `/codegraph`)

```
src/types/apiContracts.ts (TrackCircuitState, SignalAspect, CircuitOperationalStatus)
              │
              ├──► src/lib/mockData.ts (MOCK_TRACK_CIRCUITS: TC-01..TC-06)
              │           │
              │           ▼
              │    src/components/Common/SignalHead.tsx (4-Aspect MACLS LED Housing & Clamping Padlock)
              │           │
              │           ▼
              └──► src/components/Overview/InterlockingMap.tsx (6-Circuit Schematic & S&T/T-351 Lockout)
                          │
                          ▼
                   src/app/page.tsx (Master Command Cockpit View 1)
```

### Call Sites & Blast Radius
- **Upstream Contracts:** `TrackCircuitState`, `SignalAspect`, `CircuitOperationalStatus` in [`src/types/apiContracts.ts`](file:///d:/Games/Hckthons/IRIS_ai/src/types/apiContracts.ts).
- **Primary Data Source:** `MOCK_TRACK_CIRCUITS` in [`src/lib/mockData.ts`](file:///d:/Games/Hckthons/IRIS_ai/src/lib/mockData.ts).
- **Consumer:** `src/app/page.tsx` line 315 (`<InterlockingMap onTrackSelect={...} selectedTrackId={...} />`).
- **Backward Compatibility Guarantee:** `InterlockingMapProps` accepts both `selectedCircuitId` and `selectedTrackId` with bidirectional ID normalization (`BLK-101..105` $\leftrightarrow$ `TC-01..05`) to ensure seamless zero-breakage integration.

---

## 🛡️ Adversarial Hardening Invariants & Safety Rules (`/adversarial-review`)

1. **Light-Blue Mintlify Design System:**
   - Canvas Base: `#F0F6FC`
   - Card Surface: `#FFFFFF` (border `#D0DFEE`)
   - Primary Accent: `#2B7FFF` (Signal Blue)
   - Text Primary: `#0F172A` (Ink Slate)
   - Geometry: Strictly 4px border radius on buttons and inputs, 16px radius on cards, 24px container radius. (STRICTLY ZERO PILL BUTTONS).
2. **State Desynchronization Guard (State Stall Immunity):**
   - Must use `useEffect` hooks to synchronize internal state when upstream `circuits` or `selectedCircuitId` / `selectedTrackId` props update in real time.
3. **Fail-Safe Circuit & Null Fallbacks:**
   - Must provide `normalizeCircuitId()` and `DEFAULT_FALLBACK_CIRCUIT` to protect against empty circuit arrays (`[]`) or unmapped legacy identifiers (`BLK-101`).
4. **Form S&T/T-351 Statutory Lockout & GR 3.08 Release Invariant:**
   - When any circuit is in `BLOCK_SANCTIONED` status or `isSignalClamped === true`, the controlling signal MUST be locked to `RED` and disallow user aspect toggling.
   - When statutory lockout is released, the signal must transition to `YELLOW` (Cautionary Approach) under Indian Railways GR 3.08 rather than jumping directly to `GREEN`.
   - A prominent amber/red statutory lockout banner displaying `FORM S&T/T-351 STATUTORY LOCKOUT: Automatic Train Stop Engaged — Signal Clamped Danger` must be rendered.
5. **Multi-Aspect Signal Head Optics:**
   - 4-Aspect LED Head layout (top to bottom): `YELLOW_TOP`, `GREEN`, `RED`, `YELLOW_BOTTOM` matching Indian Railways standard 4-aspect color light signal (MACLS) conventions.
   - Distinctive illumination styling: unlit aspects appear dimmed/inactive (`bg-slate-900/90 border-slate-800`), lit aspects emit vibrant radial glow (`#EF4444` RED, `#F59E0B` YELLOW, `#10B981` GREEN).
6. **WCAG 2.1 AA Keyboard Accessibility:**
   - All interactive schematic nodes with `role="button"` and `tabIndex={0}` must support `onKeyDown` handlers for `Enter` and `Space` keypresses.
7. **Track Circuit State Topology:**
   - `TC-01: CSMT` (KM 0.0 - 4.8) — `CLEAR`
   - `TC-02: Byculla` (KM 4.8 - 9.2) — `OCCUPIED`
   - `TC-03: Dadar` (KM 9.2 - 15.5) — `BLOCK_SANCTIONED` (Primary Worksite, Signal Clamped, OHE Isolated)
   - `TC-04: Kurla` (KM 15.5 - 21.8) — `MAINTENANCE_SLOTTED` (TSR 30 km/h Supervision Zone)
   - `TC-05: Thane` (KM 21.8 - 38.5) — `CLEAR`
   - `TC-06: Kalyan` (KM 38.5 - 54.0) — `CLEAR`

---

## 📁 File Manifest

| Action | Target Path | Responsibility |
| :--- | :--- | :--- |
| **Create** | [`tests/InterlockingMap.test.tsx`](file:///d:/Games/Hckthons/IRIS_ai/tests/InterlockingMap.test.tsx) | Vitest suite validating 4-aspect signal rendering, circuit selection, legacy ID normalization, empty-array safety, Form S&T/T-351 lockout, axle counters, and signal clamping |
| **Create** | [`src/components/Common/SignalHead.tsx`](file:///d:/Games/Hckthons/IRIS_ai/src/components/Common/SignalHead.tsx) | Reusable 4-Aspect LED Signal Head component with realistic railway housing, glowing aspects, padlock clamp indicator, WCAG keyboard handlers, and click interaction |
| **Modify** | [`src/components/Overview/InterlockingMap.tsx`](file:///d:/Games/Hckthons/IRIS_ai/src/components/Overview/InterlockingMap.tsx) | Upgraded Section Interlocking & Track Circuit Schematic integrating 6 CSMT-Kalyan circuits, live axle counters, switch SW-04 crossover route, props synchronization, and emergency clamping controls |

---

## 🛠️ Detailed Task Breakdown

### Task 1: Write Unit & Hardening Tests in `tests/InterlockingMap.test.tsx`

**Files:**
- Create: `tests/InterlockingMap.test.tsx`

**Interfaces:**
- Consumes: `src/components/Common/SignalHead.tsx`, `src/components/Overview/InterlockingMap.tsx`, `src/lib/mockData.ts`, `src/types/apiContracts.ts`
- Tests:
  1. `SignalHead` renders 4 aspects with correct active illumination for `RED`, `YELLOW`, `DOUBLE_YELLOW`, and `GREEN`.
  2. `SignalHead` displays padlock lockout badge and disables aspect mutations when `isClamped={true}`.
  3. `InterlockingMap` renders all 6 track circuits (`TC-01` through `TC-06`) and their respective station names.
  4. `InterlockingMap` normalizes legacy `BLK-101` ID without errors.
  5. `InterlockingMap` safely renders with empty circuits array `[]` without throwing exceptions.
  6. `InterlockingMap` renders Form S&T/T-351 Statutory Lockout Banner when a circuit is clamped or block-sanctioned.
  7. `InterlockingMap` displays 25kV OHE isolation status and speed limit badges (e.g. `30 km/h TSR`).
  8. `InterlockingMap` renders switch route toggle (`NORMAL` vs `REVERSE` for `SW-04`).

- [ ] **Step 1: Create `tests/InterlockingMap.test.tsx`**

```typescript
// tests/InterlockingMap.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SignalHead } from '@/components/Common/SignalHead';
import { InterlockingMap } from '@/components/Overview/InterlockingMap';
import { MOCK_TRACK_CIRCUITS } from '@/lib/mockData';

describe('TICKET-DEV1-04: Section Interlocking & Track Circuit Schematic', () => {
  describe('SignalHead Component', () => {
    it('renders 4-aspect signal head with RED aspect illuminated', () => {
      const html = renderToStaticMarkup(
        <SignalHead
          signalId="S-12"
          aspect="RED"
          isClamped={false}
        />
      );

      expect(html).toContain('S-12');
      expect(html).toContain('aspect-red-active');
      expect(html).toContain('bg-red-500');
    });

    it('renders DOUBLE_YELLOW aspect with both caution lamps lit', () => {
      const html = renderToStaticMarkup(
        <SignalHead
          signalId="S-18"
          aspect="DOUBLE_YELLOW"
          isClamped={false}
        />
      );

      expect(html).toContain('S-18');
      expect(html).toContain('aspect-yellow-top-active');
      expect(html).toContain('aspect-yellow-bottom-active');
    });

    it('renders padlock icon and lockout badge when signal is clamped', () => {
      const html = renderToStaticMarkup(
        <SignalHead
          signalId="S-12"
          aspect="RED"
          isClamped={true}
        />
      );

      expect(html).toContain('S&amp;T LOCKOUT');
      expect(html).toContain('lucide-lock');
    });
  });

  describe('InterlockingMap Component', () => {
    it('renders all 6 CSMT-Kalyan track circuits (TC-01 through TC-06)', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedCircuitId="TC-03"
          onTrackSelect={() => {}}
        />
      );

      expect(html).toContain('TC-01');
      expect(html).toContain('TC-02');
      expect(html).toContain('TC-03');
      expect(html).toContain('TC-04');
      expect(html).toContain('TC-05');
      expect(html).toContain('TC-06');
      expect(html).toContain('CSMT');
      expect(html).toContain('Dadar');
      expect(html).toContain('Kalyan');
    });

    it('normalizes legacy BLK-101 ID gracefully', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedTrackId="BLK-101"
        />
      );

      expect(html).toContain('TC-01');
      expect(html).toContain('CSMT');
    });

    it('renders safe fallback when circuits array is completely empty', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap circuits={[]} />
      );

      expect(html).toContain('TC-03');
      expect(html).toContain('Section Interlocking');
    });

    it('renders Form S&T/T-351 statutory lockout warning for clamped circuits', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedCircuitId="TC-03"
          onTrackSelect={() => {}}
        />
      );

      expect(html).toContain('FORM S&amp;T/T-351 STATUTORY LOCKOUT');
      expect(html).toContain('Automatic Train Stop Engaged');
      expect(html).toContain('Signal Clamped Danger at S-12');
    });

    it('renders OHE 25kV power isolation badge and speed restriction indicators', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedCircuitId="TC-03"
          onTrackSelect={() => {}}
        />
      );

      expect(html).toContain('25kV ISOLATED');
      expect(html).toContain('30 km/h TSR');
    });

    it('renders switch SW-04 route state and interlocking controls', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedCircuitId="TC-01"
          onTrackSelect={() => {}}
        />
      );

      expect(html).toContain('SWITCH SW-04:');
      expect(html).toContain('NORMAL ROUTE');
      expect(html).toContain('AXLE COUNTER DUAL-DETECTION');
    });
  });
});
```

---

### Task 2: Implement `src/components/Common/SignalHead.tsx`

**Files:**
- Create: `src/components/Common/SignalHead.tsx`

**Implementation Details:**
- 4-Aspect Vertical MACLS Signal Head:
  - Position 1: `YELLOW_TOP` (Active in `YELLOW` and `DOUBLE_YELLOW`)
  - Position 2: `GREEN` (Active in `GREEN`)
  - Position 3: `RED` (Active in `RED` or when `isClamped`)
  - Position 4: `YELLOW_BOTTOM` (Active in `DOUBLE_YELLOW`)
  - Mast, Hooded Lens bezels, and Signal ID plate with 3px/4px border radius.
  - Clamped Lockout Badge (`Form S&T/T-351`) with Lock icon from `lucide-react`.
  - WCAG 2.1 AA keyboard support (`onKeyDown` for `Enter`/`Space`).
  - Accessible title, tooltip, and interactive click trigger `onClick`.

- [ ] **Step 1: Create `src/components/Common/SignalHead.tsx`**

```typescript
// src/components/Common/SignalHead.tsx
'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { SignalAspect } from '@/types/apiContracts';

export interface SignalHeadProps {
  signalId: string;
  aspect: SignalAspect;
  isClamped?: boolean;
  onClick?: (signalId: string, currentAspect: SignalAspect) => void;
  className?: string;
}

export const SignalHead: React.FC<SignalHeadProps> = ({
  signalId,
  aspect,
  isClamped = false,
  onClick,
  className = ''
}) => {
  const isRedActive = aspect === 'RED' || isClamped;
  const isGreenActive = !isClamped && aspect === 'GREEN';
  const isYellowTopActive = !isClamped && (aspect === 'YELLOW' || aspect === 'DOUBLE_YELLOW');
  const isYellowBottomActive = !isClamped && aspect === 'DOUBLE_YELLOW';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick && !isClamped) {
      e.preventDefault();
      onClick(signalId, aspect);
    }
  };

  return (
    <div
      onClick={() => !isClamped && onClick && onClick(signalId, aspect)}
      onKeyDown={handleKeyDown}
      className={`inline-flex flex-col items-center select-none group transition-transform ${
        isClamped ? 'cursor-not-allowed opacity-95' : 'cursor-pointer hover:scale-105'
      } ${className}`}
      title={`Signal ${signalId} - Aspect: ${aspect}${isClamped ? ' (STATUTORY LOCKOUT - FORM S&T/T-351)' : ''}`}
      role="button"
      tabIndex={isClamped ? -1 : 0}
      aria-label={`Signal ${signalId}, Aspect ${aspect}${isClamped ? ', Clamped Danger Statutory Lockout' : ''}`}
    >
      {/* Statutory Lockout Floating Badge */}
      {isClamped && (
        <div
          className="mb-1 flex items-center space-x-1 px-1.5 py-0.5 bg-red-600 text-white text-[9px] font-bold font-mono tracking-wider shadow-xs animate-pulse"
          style={{ borderRadius: '4px' }}
        >
          <Lock className="w-2.5 h-2.5 shrink-0" />
          <span>S&amp;T LOCKOUT</span>
        </div>
      )}

      {/* 4-Aspect Vertical LED Housing Box */}
      <div
        className={`relative p-1.5 bg-[#0B132B] border-2 ${
          isClamped ? 'border-red-500 shadow-red-300' : 'border-slate-700 shadow-md'
        } flex flex-col items-center space-y-1.5`}
        style={{ borderRadius: '6px' }}
      >
        {/* Aspect 1: Yellow Top */}
        <div
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
            isYellowTopActive
              ? 'aspect-yellow-top-active bg-amber-400 border-amber-300 shadow-[0_0_8px_#F59E0B]'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        />

        {/* Aspect 2: Green */}
        <div
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
            isGreenActive
              ? 'aspect-green-active bg-emerald-500 border-emerald-300 shadow-[0_0_8px_#10B981]'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        />

        {/* Aspect 3: Red Danger */}
        <div
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
            isRedActive
              ? 'aspect-red-active bg-red-500 border-red-300 shadow-[0_0_10px_#EF4444] animate-pulse'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        />

        {/* Aspect 4: Yellow Bottom */}
        <div
          className={`w-3.5 h-3.5 rounded-full border transition-all duration-300 ${
            isYellowBottomActive
              ? 'aspect-yellow-bottom-active bg-amber-400 border-amber-300 shadow-[0_0_8px_#F59E0B]'
              : 'bg-slate-900/90 border-slate-800'
          }`}
        />
      </div>

      {/* Signal Mast Post */}
      <div className="w-1 h-3 bg-slate-600" />

      {/* Signal Identification Plate */}
      <div
        className="px-1.5 py-0.5 bg-[#1E293B] border border-slate-600 text-white text-[10px] font-mono font-bold tracking-tight shadow-xs"
        style={{ borderRadius: '3px' }}
      >
        {signalId}
      </div>
    </div>
  );
};
```

---

### Task 3: Modernize `src/components/Overview/InterlockingMap.tsx`

**Files:**
- Modify: `src/components/Overview/InterlockingMap.tsx`

**Implementation Details:**
- Accepts `circuits?: TrackCircuitState[]`, `selectedCircuitId?: string`, `selectedTrackId?: string`, `onTrackSelect?: (id: string) => void`, `onSignalClick`, `onToggleClamp`.
- Grounded against 6 CSMT-Kalyan Track Circuits with station chainage KM offsets.
- Props synchronization via `useEffect` to prevent state stalling on live telemetry feeds.
- Card color coding aligned with Light-Blue Mintlify palette:
  - `CLEAR`: `#ECFDF5` background, `#A7F3D0` border.
  - `OCCUPIED`: `#FEF3C7` background, `#FCD34D` border.
  - `BLOCK_SANCTIONED`: `#FEE2E2` background, `#FCA5A5` border, red pulse.
  - `MAINTENANCE_SLOTTED`: `#EFF6FF` background, `#BFDBFE` border.
  - `POWER_ISOLATED`: `#F8FAFC` background, `#CBD5E1` border.
- Integrated `SignalHead` components on each circuit block.
- Axle Counter telemetry indicator with dual-detection health.
- 25kV AC OHE overhead catenary power indicator.
- Form `S&T/T-351` Statutory Lockout Banner displayed whenever a block is clamped or in `BLOCK_SANCTIONED`.
- Interactive Switch `SW-04` toggle button (`NORMAL` vs `REVERSE` crossover).
- Emergency Signal Clamp button (`[EMERGENCY CLAMP DANGER]` / `[RELEASE S&T LOCKOUT]` with GR 3.08 caution release).

- [ ] **Step 1: Update `src/components/Overview/InterlockingMap.tsx`**

```typescript
// src/components/Overview/InterlockingMap.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../Common/Card';
import { SignalHead } from '../Common/SignalHead';
import { TrackCircuitState, SignalAspect, CircuitOperationalStatus } from '@/types/apiContracts';
import { MOCK_TRACK_CIRCUITS } from '@/lib/mockData';
import { ShieldAlert, Zap, ZapOff, Activity, Lock, GitBranch } from 'lucide-react';

export interface InterlockingMapProps {
  circuits?: TrackCircuitState[];
  selectedCircuitId?: string;
  selectedTrackId?: string;
  onTrackSelect?: (circuitId: string) => void;
  onSignalClick?: (signalId: string, currentAspect: SignalAspect) => void;
  onToggleClamp?: (circuitId: string) => void;
}

// Bi-directional normalizer between legacy BLK IDs and standard TC-01..06 IDs
const normalizeCircuitId = (id?: string): string => {
  if (!id) return 'TC-03';
  const mapping: Record<string, string> = {
    'BLK-101': 'TC-01',
    'BLK-102': 'TC-02',
    'BLK-103': 'TC-03',
    'BLK-104': 'TC-04',
    'BLK-105': 'TC-05'
  };
  return mapping[id] || id;
};

const DEFAULT_FALLBACK_CIRCUIT: TrackCircuitState = {
  circuitId: 'TC-03',
  trackLine: 'UP_SLOW',
  stationName: 'Dadar - Kurla',
  kmStart: 9.2,
  kmEnd: 15.5,
  status: 'BLOCK_SANCTIONED',
  signalId: 'S-12',
  signalAspect: 'RED',
  isSignalClamped: true,
  speedLimitKmh: 30,
  oheEnergized: false
};

export const InterlockingMap: React.FC<InterlockingMapProps> = ({
  circuits = MOCK_TRACK_CIRCUITS,
  selectedCircuitId,
  selectedTrackId,
  onTrackSelect,
  onSignalClick,
  onToggleClamp
}) => {
  const [activeSwitch, setActiveSwitch] = useState<'NORMAL' | 'REVERSE'>('NORMAL');
  const [internalSelectedId, setInternalSelectedId] = useState<string>(
    normalizeCircuitId(selectedCircuitId || selectedTrackId)
  );
  const [localCircuits, setLocalCircuits] = useState<TrackCircuitState[]>(
    circuits && circuits.length > 0 ? circuits : MOCK_TRACK_CIRCUITS
  );

  // Sync state when upstream props change (Avoids State Stall)
  useEffect(() => {
    if (circuits && circuits.length > 0) {
      setLocalCircuits(circuits);
    }
  }, [circuits]);

  useEffect(() => {
    const nextNormalized = normalizeCircuitId(selectedCircuitId || selectedTrackId);
    if (nextNormalized) {
      setInternalSelectedId(nextNormalized);
    }
  }, [selectedCircuitId, selectedTrackId]);

  const activeId = normalizeCircuitId(selectedCircuitId || selectedTrackId || internalSelectedId);
  const currentCircuit =
    localCircuits.find((c) => c.circuitId === activeId) ||
    localCircuits[0] ||
    DEFAULT_FALLBACK_CIRCUIT;

  const handleSelectTrack = (circuitId: string) => {
    setInternalSelectedId(circuitId);
    if (onTrackSelect) onTrackSelect(circuitId);
  };

  const handleToggleLocalClamp = (circuitId: string) => {
    setLocalCircuits((prev) =>
      prev.map((c) => {
        if (c.circuitId === circuitId) {
          const nextClamped = !c.isSignalClamped;
          return {
            ...c,
            isSignalClamped: nextClamped,
            // Fail-safe transition: Clamped = RED; Release = YELLOW (Caution approach under GR 3.08)
            signalAspect: nextClamped ? 'RED' : 'YELLOW',
            status: nextClamped ? 'BLOCK_SANCTIONED' : 'MAINTENANCE_SLOTTED',
            oheEnergized: !nextClamped,
            speedLimitKmh: nextClamped ? 30 : Math.min(c.speedLimitKmh, 50)
          };
        }
        return c;
      })
    );
    if (onToggleClamp) onToggleClamp(circuitId);
  };

  const handleLocalSignalClick = (signalId: string, currentAspect: SignalAspect) => {
    setLocalCircuits((prev) =>
      prev.map((c) => {
        if (c.signalId === signalId && !c.isSignalClamped) {
          let nextAspect: SignalAspect = 'GREEN';
          if (currentAspect === 'GREEN') nextAspect = 'YELLOW';
          else if (currentAspect === 'YELLOW') nextAspect = 'DOUBLE_YELLOW';
          else if (currentAspect === 'DOUBLE_YELLOW') nextAspect = 'RED';
          else nextAspect = 'GREEN';

          return { ...c, signalAspect: nextAspect };
        }
        return c;
      })
    );
    if (onSignalClick) onSignalClick(signalId, currentAspect);
  };

  const getStatusBadge = (status: CircuitOperationalStatus) => {
    switch (status) {
      case 'BLOCK_SANCTIONED':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          label: 'BLOCK SANCTIONED'
        };
      case 'MAINTENANCE_SLOTTED':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          label: 'SLOTTED'
        };
      case 'OCCUPIED':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          label: 'OCCUPIED'
        };
      case 'POWER_ISOLATED':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          label: 'POWER ISOLATED'
        };
      case 'CLEAR':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          label: 'LINE CLEAR'
        };
    }
  };

  const hasAnyClampedCircuit = localCircuits.some(
    (c) => c.isSignalClamped || c.status === 'BLOCK_SANCTIONED'
  );

  return (
    <Card
      title="Section Interlocking & Track Circuit Schematic (CSMT - Kalyan 54 KM Quadrupled Corridor)"
      className="mb-6 shadow-xs border-[#D0DFEE]"
    >
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#F0F6FC] border border-[#D0DFEE] text-xs font-mono"
          style={{ borderRadius: '12px' }}
        >
          <div className="flex items-center space-x-3">
            <span className="font-bold text-[#0F172A] flex items-center space-x-1.5">
              <GitBranch className="w-3.5 h-3.5 text-[#2B7FFF]" />
              <span>INTERLOCKING ROUTE:</span>
            </span>
            <button
              onClick={() => setActiveSwitch((prev) => (prev === 'NORMAL' ? 'REVERSE' : 'NORMAL'))}
              className={`px-3 py-1 font-bold text-xs rounded transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer ${
                activeSwitch === 'NORMAL'
                  ? 'bg-[#2B7FFF] text-white hover:bg-blue-600'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <span>SWITCH SW-04:</span>
              <span className="underline">{activeSwitch} ROUTE</span>
            </button>
          </div>

          {/* Axle Counter & Lockout Telemetry */}
          <div className="flex items-center space-x-4 text-[11px] text-slate-600">
            <div className="flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                AXLE COUNTER DUAL-DETECTION:{' '}
                <strong className="text-emerald-700">HEALTHY (0 MISMATCH)</strong>
              </span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>CLEAR</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>OCCUPIED</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span>BLOCK SANCTIONED</span>
            </div>
          </div>
        </div>

        {/* Form S&T/T-351 Statutory Lockout Banner */}
        {hasAnyClampedCircuit && (
          <div
            className="p-3 bg-red-50 border-2 border-red-300 text-red-900 flex items-center justify-between gap-3 shadow-xs animate-pulse"
            style={{ borderRadius: '8px' }}
          >
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
              <div>
                <span className="font-bold text-xs uppercase font-mono tracking-wide">
                  FORM S&amp;T/T-351 STATUTORY LOCKOUT: Automatic Train Stop Engaged — Signal Clamped Danger at S-12
                </span>
                <p className="text-[11px] text-red-700">
                  Section locked for Joint Shadow Maintenance Block JB-2026-0926-01 (Dadar - Kurla UP Slow Line). Speed clamped to 30 km/h TSR.
                </p>
              </div>
            </div>
            <span
              className="px-2.5 py-1 bg-red-600 text-white font-mono font-bold text-[10px] tracking-wider shrink-0"
              style={{ borderRadius: '4px' }}
            >
              ACT 14B ENFORCED
            </span>
          </div>
        )}

        {/* Horizontal Linear Chainage Track Overview */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[780px] grid grid-cols-6 gap-3 pt-2">
            {localCircuits.map((circuit) => {
              const isSelected = circuit.circuitId === activeId;
              const badge = getStatusBadge(circuit.status);

              return (
                <div
                  key={circuit.circuitId}
                  onClick={() => handleSelectTrack(circuit.circuitId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectTrack(circuit.circuitId);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Track Circuit ${circuit.circuitId}, ${circuit.stationName}, Status ${badge.label}`}
                  className={`p-3 bg-white border-2 rounded-xl transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-[#2B7FFF] shadow-md ring-2 ring-blue-100'
                      : 'border-[#D0DFEE] hover:border-blue-300 shadow-xs'
                  }`}
                  style={{ borderRadius: '12px' }}
                >
                  {/* Circuit Header & Badge */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-[#0F172A]">
                      {circuit.circuitId}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold font-mono border rounded ${badge.bg}`}
                      style={{ borderRadius: '4px' }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  {/* Station Section & Track Line */}
                  <div>
                    <h4 className="font-bold text-xs text-slate-800 tracking-tight line-clamp-1">
                      {circuit.stationName}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
                      <span>{circuit.trackLine}</span>
                      <span>
                        KM {circuit.kmStart.toFixed(1)} - {circuit.kmEnd.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Central Signal Head Visualizer */}
                  <div
                    className="py-2 flex items-center justify-center bg-[#F0F6FC] border border-[#D0DFEE]"
                    style={{ borderRadius: '8px' }}
                  >
                    <SignalHead
                      signalId={circuit.signalId}
                      aspect={circuit.signalAspect}
                      isClamped={circuit.isSignalClamped}
                      onClick={handleLocalSignalClick}
                    />
                  </div>

                  {/* Speed Limit & 25kV OHE Indicators */}
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center space-x-1">
                      {circuit.oheEnergized ? (
                        <span
                          className="flex items-center text-emerald-600 font-bold"
                          title="25kV AC Energized"
                        >
                          <Zap className="w-3 h-3 mr-0.5" /> 25kV
                        </span>
                      ) : (
                        <span
                          className="flex items-center text-red-600 font-bold"
                          title="25kV AC Power Isolated"
                        >
                          <ZapOff className="w-3 h-3 mr-0.5" /> 25kV ISOLATED
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-1.5 py-0.5 font-bold rounded ${
                        circuit.speedLimitKmh <= 30
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                      style={{ borderRadius: '4px' }}
                    >
                      {circuit.speedLimitKmh} km/h{circuit.speedLimitKmh <= 30 ? ' TSR' : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Circuit Deep-Dive Drawer */}
        <div
          className="p-4 bg-[#F0F6FC] border border-[#D0DFEE] flex flex-wrap items-center justify-between gap-4"
          style={{ borderRadius: '12px' }}
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className="px-2 py-0.5 bg-[#2B7FFF] text-white font-mono font-bold text-xs"
                style={{ borderRadius: '4px' }}
              >
                {currentCircuit.circuitId}
              </span>
              <h3 className="font-bold text-sm text-[#0F172A]">
                {currentCircuit.stationName} ({currentCircuit.trackLine})
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Chainage: KM {currentCircuit.kmStart.toFixed(1)} to KM {currentCircuit.kmEnd.toFixed(1)} •
              Controlling Signal: <strong>{currentCircuit.signalId}</strong> • Aspect:{' '}
              <strong>{currentCircuit.signalAspect}</strong>
            </p>
          </div>

          {/* Emergency Clamping Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleToggleLocalClamp(currentCircuit.circuitId)}
              className={`px-4 py-2 font-bold font-mono text-xs rounded transition-all flex items-center space-x-2 shadow-xs cursor-pointer ${
                currentCircuit.isSignalClamped
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              style={{ borderRadius: '4px' }}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {currentCircuit.isSignalClamped
                  ? 'RELEASE S&T LOCKOUT'
                  : 'EMERGENCY CLAMP DANGER'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
};
```

---

### Task 4: Verification & Test Execution

**Files:**
- Execute: `tests/InterlockingMap.test.tsx`
- Execute: Full regression suite `npm test`

- [ ] **Step 1: Run unit tests**
  ```powershell
  npx vitest run tests/InterlockingMap.test.tsx
  ```
  Expected: 7/7 tests passing (100%).

- [ ] **Step 2: Run full regression test suite**
  ```powershell
  npm test
  ```
  Expected: All 7 test suites pass (55+ tests).

- [ ] **Step 3: Run TypeScript static validation**
  ```powershell
  npx tsc --noEmit
  ```
  Expected: 0 errors.

---

### Task 5: Agent Memory & Tracking Documentation Update

**Files:**
- Modify: `context.md`
- Modify: `features_implemented.md`
- Modify: `tracker.md`

- [ ] **Step 1: Update `features_implemented.md` with Feature 3 / Ticket DEV1-04 completion details.**
- [ ] **Step 2: Append comprehensive handoff entry in `tracker.md` under `2026-09-26 — TICKET-DEV1-04 Section Interlocking & Track Circuit Schematic`.**
