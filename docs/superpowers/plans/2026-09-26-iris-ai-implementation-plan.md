# IRIS AI (Auto-BDMS) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete IRIS AI Automatic Block Planning & Corridor Optimization System (SIH 26027) featuring a Next.js 16 React 19 Frontend with Dual-Layer SVG Marey String Chart, 6-Metric Block Planning KPI Strip, Multi-Department Demand Queue, Track Interlocking Map, Cab Defect Vision HUD with Kavach EBD, Asynchronous Google OR-Tools CP-SAT Solver Backend, and SHA-256 RDSO Form 14B Cryptographic Audit Dossiers.

**Architecture:** Hexagonal Ports & Adapters architecture with externalized policy configuration (`DivisionalPolicyProfile`). Pure TypeScript BEADS pipeline on client-side, asynchronous thread-isolated CP-SAT optimization on FastAPI backend (`asyncio.to_thread`), and dual-mode data client with automatic offline static fallback.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5+, Tailwind CSS v4, Recharts, Lucide React, FastAPI (Python 3.12), Google OR-Tools CP-SAT (`ortools.sat.python.cp_model`), Vitest.

---

## Global Constraints

- **Design System:** Light-Blue Mintlify Discipline (`#F0F6FC` Base, `#FFFFFF` Surface, `#D0DFEE` Border, `#2B7FFF` Signal Blue, `#0F172A` Text, strictly 4px button/input radius, 16px card radius, strictly zero pill buttons).
- **Zero Passenger Delay Invariant:** The CP-SAT solver strictly forbids canceling or truncating scheduled passenger train paths.
- **Safety Headway Invariant:** Enforces $\Delta_{\text{clear}} \ge 15\text{ min}$ between block release and approaching trains.
- **Power Earthing Buffers:** 10-minute earthing and 10-minute restoration buffers for 25kV OHE power blocks.
- **Cryptographic Parity Invariant:** RFC 8785 canonical delimiter string (`blockId|operator|timestamp|sortedDemands|tsr|policy`) for SHA-256 seal verification across TypeScript and Python.

---

## 📋 Task Breakdown & Ticket Backlog

### Task 1: `TICKET-DEV1-01` — Core TypeScript Contracts & Grounded Mock Data Seam

**Files:**
- Modify: `src/types/apiContracts.ts`
- Modify: `src/lib/mockData.ts`
- Test: `tests/contracts.test.ts`

**Interfaces:**
- Produces: `MaintenanceDemand`, `JointBlockSchedule`, `CorridorKpiMetrics`, `DivisionalPolicyProfile`, `TrackCircuitState`, `ExplainableDecisionDossier`, `MOCK_DEMANDS`, `MOCK_JOINT_BLOCKS`, `MOCK_POLICY_PROFILE`, `MOCK_CIRCUITS`, `MOCK_TRAIN_PATHS`.

- [ ] **Step 1: Write the failing contract validation test**
```typescript
// tests/contracts.test.ts
import { describe, it, expect } from 'vitest';
import { MOCK_DEMANDS, MOCK_JOINT_BLOCKS, MOCK_POLICY_PROFILE } from '../src/lib/mockData';
import { JointBlockSchedule, MaintenanceDemand } from '../src/types/apiContracts';

describe('IRIS AI Core Contracts & Mock Data', () => {
  it('should export valid multi-department maintenance demands', () => {
    expect(MOCK_DEMANDS.length).toBeGreaterThanOrEqual(3);
    const civil = MOCK_DEMANDS.find((d) => d.department === 'TMS_CIVIL');
    expect(civil).toBeDefined();
    expect(civil?.trackCircuitId).toBe('TC-03');
    expect(civil?.urgencyTier).toBe('P1_CRITICAL');
  });

  it('should export a valid nocturnal joint shadow block schedule with 0 passenger delay', () => {
    expect(MOCK_JOINT_BLOCKS.length).toBeGreaterThanOrEqual(1);
    const block = MOCK_JOINT_BLOCKS[0];
    expect(block.passengerDelaysMinutes).toBe(0);
    expect(block.downtimeSavedMinutes).toBe(85);
    expect(block.bundledDemandIds.length).toBeGreaterThanOrEqual(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/contracts.test.ts`  
Expected: FAIL (`MOCK_DEMANDS` or properties not found)

- [ ] **Step 3: Implement updated `src/types/apiContracts.ts`**
```typescript
// src/types/apiContracts.ts
export type DeploymentMode = 'ADVISORY' | 'AUTONOMOUS';
export type DepartmentCode = 'TMS_CIVIL' | 'TDMS_ELECTRICAL' | 'SMMS_SIGNAL';
export type UrgencyTier = 'P1_CRITICAL' | 'P2_SCHEDULED' | 'P3_ROUTINE';
export type HorizonTier = 'TACTICAL_24H' | 'OPERATIONAL_7D' | 'STRATEGIC_30D';
export type TrackCircuitId = 'TC-01' | 'TC-02' | 'TC-03' | 'TC-04' | 'TC-05' | 'TC-06';

export interface DivisionalPolicyProfile {
  divisionId: string;
  divisionName: string;
  safetyHeadwayBufferMinutes: number; // 15
  oheEarthingBufferMinutes: number;    // 10
  oheRestorationBufferMinutes: number; // 10
  defaultTsrSpeedKmh: number;          // 30
  weightSafetyRisk: number;            // 0.40
  weightDegradationRate: number;       // 0.35
  weightTrafficDensity: number;        // 0.25
  p1ScoreThreshold: number;            // 0.80
  p2ScoreThreshold: number;            // 0.50
}

export interface MaintenanceDemand {
  demandId: string;
  department: DepartmentCode;
  trackCircuitId: TrackCircuitId;
  stationSection: string;
  chainageKm: number;
  urgencyTier: UrgencyTier;
  urgencyScore: number;
  durationMinutes: number;
  requiresPowerBlock: boolean;
  assignedMachine?: string;
  deadheadTransitMinutes: number;
  status: 'PENDING_TRIAGE' | 'TRIAGED' | 'SLOTTED' | 'SANCTIONED' | 'COMPLETED';
  rawTicketId: string;
  defectDescription: string;
}

export interface JointBlockSchedule {
  blockId: string;
  corridorName: string;
  startTimeMinutes: number;  // 90 = 01:30 IST
  endTimeMinutes: number;    // 285 = 04:45 IST
  affectedTrackCircuits: TrackCircuitId[];
  bundledDemandIds: string[];
  downtimeSavedMinutes: number;
  corridorDowntimeSavedPct: number;
  passengerDelaysMinutes: 0;
  kavachTsrSpeedKmh: number;
  isEmergencyTsrFallback: boolean;
  status: 'PROPOSED' | 'SANCTIONED' | 'ACTIVE' | 'RESTORED';
  optimizationTimestamp: string;
}

export interface CorridorKpiMetrics {
  corridorDowntimeSavedPct: number; // 38.4%
  assetAvailabilityIndexPct: number; // 96.2%
  activeBlocksCount: number;
  pendingDemandsCount: number;
  whiteCorridorHeadwayMinutes: number; // 195 mins
  activeKavachTsrsCount: number;
}

export interface TrackCircuitState {
  circuitId: TrackCircuitId;
  stationName: string;
  kmStart: number;
  kmEnd: number;
  status: 'CLEAR' | 'OCCUPIED' | 'MAINTENANCE_SLOTTED' | 'BLOCK_SANCTIONED' | 'POWER_ISOLATED';
  activeBlockId?: string;
  signalId: string;
  signalAspect: 'RED' | 'YELLOW' | 'DOUBLE_YELLOW' | 'GREEN';
  isSignalClamped: boolean;
  speedLimitKmh: number;
  oheEnergized: boolean;
}

export interface TrainScheduleSlot {
  trainNumber: string;
  trainName: string;
  trainType: 'PREMIUM_PASSENGER' | 'EXPRESS' | 'SUBURBAN' | 'FREIGHT';
  originStation: string;
  destinationStation: string;
  trajectoryPoints: Array<{
    stationCode: string;
    km: number;
    arrivalTimeMinutes: number;
    departureTimeMinutes: number;
  }>;
}

export interface ExplainableDecisionDossier {
  dossierId: string;
  blockId: string;
  sanctionedBy: string;
  timestamp: string;
  canonicalPayloadString: string;
  sha256Signature: string;
  chronologicalTimeline: Array<{
    stepNumber: 1 | 2 | 3 | 4;
    stageName: 'INGESTION' | 'TRAFFIC_CONFLICT' | 'JOINT_BUNDLING' | 'SANCTION_DISSEMINATION';
    title: string;
    agentName: string;
    description: string;
    timestamp: string;
  }>;
  bundledDemands: MaintenanceDemand[];
  statutoryForms: {
    formST351LockoutNumber: string;
    formT409CautionOrderNumber: string;
    rdsoForm14BCertificateHash: string;
  };
  verificationStatus: 'VERIFIED_TAMPER_FREE' | 'SIGNATURE_MISMATCH';
}
```

- [ ] **Step 4: Implement grounded mock datasets in `src/lib/mockData.ts`**
Populate `MOCK_POLICY_PROFILE`, `MOCK_DEMANDS`, `MOCK_JOINT_BLOCKS`, `MOCK_CIRCUITS`, `MOCK_TRAIN_PATHS`, `MOCK_CORRIDOR_KPIS`, and `MOCK_DECISION_DOSSIER`.

- [ ] **Step 5: Run tests and verify PASS**
Run: `npx vitest run tests/contracts.test.ts`  
Expected: PASS

- [ ] **Step 6: Commit**
`git add src/types/apiContracts.ts src/lib/mockData.ts tests/contracts.test.ts && git commit -m "feat(contracts): implement IRIS AI API contracts and mock datasets"`

---

### Task 2: `TICKET-DEV1-02` — Asynchronous Google OR-Tools CP-SAT Optimizer Backend

**Files:**
- Create: `backend/optimizer.py`
- Modify: `backend/main.py`
- Modify: `backend/requirements.txt`
- Test: `backend/test_optimizer.py`

**Interfaces:**
- Consumes: `OptimizationRequest` dictionary payload
- Produces: `solve_corridor_cp_sat(demands, train_paths, policy)` $\to$ `JointBlockSchedule` dict

- [ ] **Step 1: Write backend optimizer test in Python**
```python
# backend/test_optimizer.py
import pytest
from optimizer import solve_corridor_cp_sat

def test_solve_corridor_optimal():
    demands = [
        {"demandId": "DEM-01", "durationMinutes": 90, "trackCircuitId": "TC-03", "department": "TMS_CIVIL"},
        {"demandId": "DEM-02", "durationMinutes": 60, "trackCircuitId": "TC-03", "department": "TDMS_ELECTRICAL"}
    ]
    train_paths = []
    policy = {"safetyHeadwayBufferMinutes": 15, "solverTimeoutSeconds": 2.0}
    result = solve_corridor_cp_sat(demands, train_paths, policy)
    assert result["status"] in ("OPTIMAL", "FEASIBLE")
    assert result["passengerDelaysMinutes"] == 0
    assert result["downtimeSavedMinutes"] > 0
```

- [ ] **Step 2: Implement `backend/optimizer.py` using CP-SAT**
Implement Google OR-Tools CP-SAT model with `asyncio.to_thread` wrapping and fallback speed squeeze.

- [ ] **Step 3: Add endpoint to `backend/main.py`**
Route `/api/v1/optimizer/solve-corridor` calling `await asyncio.to_thread(solve_corridor_cp_sat, ...)`.

- [ ] **Step 4: Run pytest and verify PASS**
Run: `pytest backend/test_optimizer.py -v`  
Expected: PASS

- [ ] **Step 5: Commit**
`git add backend/ && git commit -m "feat(backend): implement CP-SAT corridor optimizer endpoint"`

---

### Task 3: `TICKET-DEV1-03` — Dual-Layer SVG Corridor Marey String Chart

**Files:**
- Create: `src/components/Planner/CorridorStringChart.tsx`
- Test: `tests/CorridorStringChart.test.tsx`

**Interfaces:**
- Consumes: `JointBlockSchedule[]`, `TrainScheduleSlot[]`, `onSelectBlock(blockId)`
- Produces: Interactive React SVG component

- [ ] **Step 1: Write rendering test**
Verify station labels (CSMT, Dadar, Kurla, Thane, Kalyan) render in SVG and block clicking fires `onSelectBlock`.

- [ ] **Step 2: Implement `src/components/Planner/CorridorStringChart.tsx`**
Build memoized background grid (`React.useMemo`) and slanted SVG train paths + shaded rectangular maintenance block windows.

- [ ] **Step 3: Verify with test suite**
Run: `npx vitest run tests/CorridorStringChart.test.tsx`  
Expected: PASS

- [ ] **Step 4: Commit**
`git add src/components/Planner/ tests/ && git commit -m "feat(planner): build dual-layer SVG Marey string chart"`

---

### Task 4: `TICKET-DEV2-01` — 6-Metric Block Planning KPI Strip

**Files:**
- Modify: `src/components/Overview/KpiStrip.tsx`
- Create: `src/components/Overview/KpiCard.tsx`
- Test: `tests/KpiStrip.test.tsx`

**Interfaces:**
- Consumes: `CorridorKpiMetrics`
- Produces: 6 Mintlify metric cards (38.4% Downtime Saved, 96.2% Availability, 03 Active Blocks, 08 Demands, 3h 15m White Corridor, 02 Active TSRs).

- [ ] **Step 1: Write KPI strip test**
Verify all 6 metrics render with correct percentage badges and 4px button styling.

- [ ] **Step 2: Implement `KpiCard.tsx` and refactor `KpiStrip.tsx`**

- [ ] **Step 3: Verify and Commit**
`git add src/components/Overview/ && git commit -m "feat(ui): update KPI strip with IRIS AI block planning metrics"`

---

### Task 5: `TICKET-DEV2-02` — Multi-Department Demand Queue & Triage Component

**Files:**
- Modify: `src/components/Overview/IncidentQueue.tsx`
- Create: `src/components/Overview/DemandRowItem.tsx`
- Create: `src/components/Common/UrgencyBadge.tsx`
- Test: `tests/IncidentQueue.test.tsx`

**Interfaces:**
- Consumes: `MaintenanceDemand[]`, `onSanction(demandId)`
- Produces: Filterable queue with `TMS_CIVIL`, `TDMS_ELECTRICAL`, `SMMS_SIGNAL` badges and `[SANCTION BLOCK]` buttons.

- [ ] **Step 1: Write DemandQueue test**
Verify department filtering and sanction callback trigger.

- [ ] **Step 2: Implement `UrgencyBadge.tsx`, `DemandRowItem.tsx`, and `IncidentQueue.tsx`**

- [ ] **Step 3: Verify and Commit**
`git add src/components/Overview/ src/components/Common/ && git commit -m "feat(ui): implement multi-department demand triage queue"`

---

### Task 6: `TICKET-DEV2-03` — Section Interlocking & Track Circuit Map

**Files:**
- Modify: `src/components/Overview/InterlockingMap.tsx`
- Create: `src/components/Common/SignalHead.tsx`
- Test: `tests/InterlockingMap.test.tsx`

**Interfaces:**
- Consumes: `TrackCircuitState[]`, `activeBlockId`
- Produces: Schematic layout for `TC-01..06` with signal aspect clamping and Form S&T/T-351 lockout notices.

- [ ] **Step 1: Write Interlocking Map test**
Verify circuit state changes to `BLOCK_SANCTIONED` and signal clamps to `RED`.

- [ ] **Step 2: Implement `SignalHead.tsx` and refactor `InterlockingMap.tsx`**

- [ ] **Step 3: Verify and Commit**
`git add src/components/Overview/InterlockingMap.tsx src/components/Common/SignalHead.tsx && git commit -m "feat(ui): implement track circuit interlocking schematic"`

---

### Task 7: `TICKET-DEV2-04` — Explainable Decision Dossier Modal & RDSO Form 14B

**Files:**
- Modify: `src/components/Auditor/DecisionLogModal.tsx`
- Modify: `src/lib/agents/explainableLogger.ts`
- Test: `tests/DecisionLogModal.test.tsx`

**Interfaces:**
- Consumes: `ExplainableDecisionDossier`, `isOpen`, `onClose`
- Produces: 4-step chronological timeline, SHA-256 seal copy, and RDSO Form 14B print certificate.

- [ ] **Step 1: Write DecisionLogModal test**
Verify SHA-256 canonical calculation and 4-step timeline rendering.

- [ ] **Step 2: Implement canonical hashing and refactor `DecisionLogModal.tsx`**

- [ ] **Step 3: Verify and Commit**
`git add src/components/Auditor/ src/lib/agents/ && git commit -m "feat(auditor): implement 4-step decision dossier modal and canonical SHA-256 seal"`

---

### Task 8: `TICKET-DEV1-04` & `TICKET-DEV2-05` — API Client & Recharts Analytics Suite

**Files:**
- Modify: `src/lib/apiClient.ts`
- Modify: `src/components/Charts/KinematicDecelChart.tsx`
- Modify: `src/components/Charts/IncidentTriageDonutChart.tsx`
- Test: `tests/apiClient.test.ts`

**Interfaces:**
- Produces: Type-safe dual-mode API fetcher with 1.5s timeout + Recharts EBD deceleration curve and triage donut.

- [ ] **Step 1: Implement `src/lib/apiClient.ts` dual-mode client with mock fallback**
- [ ] **Step 2: Refactor Recharts components for gradient-compensated EBD and triage donut**
- [ ] **Step 3: Verify and Commit**
`git add src/lib/apiClient.ts src/components/Charts/ && git commit -m "feat(analytics): implement dual-mode client and Recharts visualizers"`

---

### Task 9: `TICKET-DEV1-05` — Master 3-View Cockpit & Horizon Switcher Assembly

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/Navbar.tsx`
- Test: `tests/MainCockpit.test.tsx`

**Interfaces:**
- Assembles all components into the Master IRIS AI Cockpit with 3 tactical views:
  1. *View 1:* Master Corridor String Chart & Demand Queue
  2. *View 2:* Section Interlocking & Track Circuit Map
  3. *View 3:* Defect Vision & Cab Telemetry Console (Kavach HUD)
  Top Navbar Horizon Switcher (`[24h Tactical]`, `[7D Operational]`, `[30D Strategic]`) and `[Advisory / Autonomous]` toggle.

- [ ] **Step 1: Implement `src/components/Navbar.tsx` with horizon switcher tabs**
- [ ] **Step 2: Implement `src/app/page.tsx` integrating all views and global sanction event bus**
- [ ] **Step 3: Run end-to-end component test**
Run: `npx vitest run`  
Expected: All tests PASS

- [ ] **Step 4: Commit**
`git add src/app/page.tsx src/components/Navbar.tsx && git commit -m "feat(cockpit): assemble master 3-view command center and horizon switcher"`

---

## 🚀 Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-09-26-iris-ai-implementation-plan.md`.

**Two execution options:**

1. **Subagent-Driven (recommended)** — Dispatch fresh subagents per task with review checkpoints between tasks.
2. **Inline Execution** — Execute tasks sequentially in this session using `executing-plans`.

**Which approach would you like to take?**
