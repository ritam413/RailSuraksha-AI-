# RailSuraksha AI — 3-Developer Parallel 6-Hour Hackathon Execution Plan

> **Location:** `docs/three_developer_execution_plan.md`  
> **Target Timeline:** 6 Hours (Fast-Track Hackathon Prototype)  
> **Team Size:** 3 Developers using Antigravity AI Coding Assistants  
> **Core Strategy:** Strict File/Directory Ownership Boundaries & Contract-First Interface Specs (Zero Merge Conflicts).  

---

## 👥 Role Allocation & Dedicated File Ownership Matrix

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                               3-DEVELOPER PARALLEL WORK SPLIT                           │
├───────────────────────────────┬───────────────────────────────┬─────────────────────────┤
│ DEVELOPER 1 (YOU - LEAD)      │ DEVELOPER 2 (BASIC CODER)     │ DEVELOPER 3 (ML / AI)   │
│ Full-Stack / Integrator       │ Component & UI Layouts        │ Physics & Agent Logic   │
├───────────────────────────────┼───────────────────────────────┼─────────────────────────┤
│ 📁 Directory:                 │ 📁 Directory:                 │ 📁 Directory:           │
│   src/app/page.tsx            │   src/components/Overview/**  │   src/lib/agents/**     │
│   src/components/Navbar.tsx   │   src/components/Auditor/**   │   src/lib/physics/**    │
│   src/app/globals.css         │   src/components/Common/**    │   src/lib/vision/**     │
├───────────────────────────────┼───────────────────────────────┼─────────────────────────┤
│ 🎯 Focus:                     │ 🎯 Focus:                     │ 🎯 Focus:               │
│   - Next.js 16 App Routing    │   - KPI Strip Card Component  │   - RDSO EBD Physics    │
│   - Global Advisory Switcher  │   - Incident Queue List UI    │     stopping distance   │
│   - Video Canvas Overlay      │   - Decision Log Modal        │   - Triage severity     │
│   - Mock State & Demo Wiring  │   - Light-Blue Design System  │   - Crowd density state │
└───────────────────────────────┴───────────────────────────────┴─────────────────────────┘
```

---

## 🔒 Shared Interface Contract (`src/types/apiContracts.ts`)

> **CRITICAL RULE:** All 3 developers agree on `src/types/apiContracts.ts` in **Hour 01**. No developer modifies property names in `apiContracts.ts` without notifying the team.

```typescript
// src/types/apiContracts.ts

export type DeploymentMode = 'ADVISORY' | 'AUTONOMOUS';
export type SeverityCategory = 'CRITICAL' | 'MODERATE' | 'LOW';

export interface AnomalyBoundingBox {
  class: 'BOULDER' | 'RAIL_FRACTURE' | 'CROWD_SURGE' | 'CATTLE';
  confidence: number; // e.g. 0.982
  x: number;
  y: number;
  width: number;
  height: number;
  estimatedDistanceMeters: number;
}

export interface IncidentRecord {
  incidentId: string;
  timestamp: string;
  sourceCameraId: string;
  cameraType: 'LOCO_CAB' | 'PLATFORM_GATEWAY' | 'OHE';
  severityCategory: SeverityCategory;
  severityScore: number;
  assignedAgent: 'KavachBrakingAgent' | 'SectionDispatchAgent' | 'RiskAuditAgent';
  status: 'PENDING_APPROVAL' | 'EXECUTING' | 'RESOLVED' | 'REJECTED';
  boundingBoxes: AnomalyBoundingBox[];
}

export interface EbdCalculationResult {
  trainId: string;
  velocityKmh: number;
  obstacleDistanceMeters: number;
  calculatedStoppingDistanceMeters: number; // D_stop
  marginDistanceMeters: number;
  isCollisionRisk: boolean;
  requiredDecelerationMs2: number;
  brakeState: 'CLEAR' | 'EMERGENCY_SOLENOID_ACTUATED';
}

export interface PlatformHoldState {
  stationCode: string;
  heldPlatformId: string;
  adjacentPlatformId: string;
  gatewayOccupancyIndex: number; // rho (0.0 - 1.0)
  gatewayCrowdCount: number;
  remainingHoldSeconds: number;
  isMlExtensionActive: boolean;
  status: 'HOLD_ACTIVE' | 'CLEARING' | 'RELEASED';
}

export interface ExplainableDecisionLog {
  incidentId: string;
  trainNumber: string;
  trackSection: string;
  status: 'ACTION_CONFIRMED' | 'REJECTED' | 'RESOLVED';
  deploymentMode: DeploymentMode;
  steps: Array<{
    stepNumber: number;
    agentName: string;
    title: string;
    detailText: string;
    timestamp: string;
  }>;
  outcomeSummary: string;
}
```

---

## ⏰ 6-Hour Master Execution Schedule

### 🚀 HOUR 01: Setup, Contract Sync & Design System Tokens
- **ALL 3 DEVS (15 Mins):** Align on `src/types/apiContracts.ts` and `src/lib/mockData.ts`.
- **DEV 1 (Lead):** Setup Light-Blue global CSS (`#F0F6FC`, `#FFFFFF`, `#2B7FFF`, `#0F172A`) and `Navbar.tsx` shell with Advisory/Autonomous mode toggle.
- **DEV 2 (Basic Coder):** Copy static mock dataset types and prepare `src/components/Overview/` folder.
- **DEV 3 (ML/AI):** Setup `src/lib/agents/` pure TypeScript module exports and stubs.

### 🏗️ HOURS 02–03: Isolated Parallel Component & Agent Construction
- **DEV 1 (Frontend Lead):**
  - Build `LocoCameraFeed.tsx` video container with HTML5 canvas bounding box overlay.
  - Wire main tab view switcher (`Overview`, `Loco-Cab Vision`, `Platform Gateway`) in `src/app/page.tsx`.
- **DEV 2 (Basic Coder UI):**
  - Prompt Antigravity: *"Build `KpiStrip.tsx` (6 metric cards) and `IncidentQueue.tsx` (alert list with `[APPROVE ACTION]` buttons) in `src/components/Overview/` using static data from `src/lib/mockData.ts`."*
- **DEV 3 (ML / AI / Physics):**
  - Prompt Antigravity: *"Implement `kavachBrakingAgent.ts` with RDSO physics formula $D_{\text{stop}} = \frac{V^2}{2g(\mu + G)} + V \cdot t_{\text{reaction}}$."*
  - Implement `triageAgent.ts` severity classifier and `sectionDispatchAgent.ts` 5-minute crowd density hold logic.

### ⚡ HOURS 04–05: Scenario Wiring, Pipeline Visualizer & Decision Logs
- **DEV 1 (Lead):** Build `AgentPipelineCanvas.tsx` (4-stage animated safety pipeline visualizer).
- **DEV 2 (Basic Coder UI):** Build `DecisionLogModal.tsx` auditor drawer modal displaying step-by-step decision steps.
- **DEV 3 (ML/AI):** Connect agent outputs to `explainableLogger.ts` to output clean 4-step decision logs.
- **MILESTONE:** All 3 component sets import cleanly into `src/app/page.tsx` without merge conflicts.

### 🎯 HOUR 06: System Integration, Mintlify Geometry Verification & Presentation Practice
- **ALL DEVS:** Verify 4 key demo flows:
  1. **Flow 1 (Track Hazard & Kavach EBD):** Boulder detected at 340m $\to$ $D_{\text{stop}} = 410\text{m}$ $\to$ Emergency brake actuated.
  2. **Flow 2 (Platform Overcrowding):** Platform 17 overcrowding ($\rho = 88\%$) $\to$ 5-minute hold on Platform 18 train.
  3. **Flow 3 (Advisory vs Autonomous):** Global header toggle switches between manual approval gate and automatic execution.
  4. **Flow 4 (Auditor Compliance):** Click `[CLOSE INCIDENT & FILE REPORT]` to show compliance log output.
- **DEV 1:** Enforce Mintlify spatial geometry rules (4px button radius, 16px card radius, 24px container radius, 0 pill buttons).

---

## 🛠️ Antigravity Agent Prompt Templates (Copy-Paste per Role)

### 📌 Prompt for Developer 1 (Frontend & System Lead):
```text
You are Developer 1 on RailSuraksha AI. Your exclusive domain is building client-side React 19 components in `src/app/page.tsx` and `src/components/Navbar.tsx` using Next.js 16 and Tailwind CSS v4.

Follow the Light-Blue Mintlify design system:
- Canvas Base: #F0F6FC
- Card Surface: #FFFFFF (border #D0DFEE)
- Primary Accent: #2B7FFF (Signal Blue)
- Text Primary: #0F172A (Ink Slate)
- Geometry: 4px button/input radius, 16px card radius, 24px container radius (STRICTLY ZERO PILL BUTTONS).

Do NOT modify files in `src/components/Overview/` or `src/lib/agents/`. Import types strictly from `src/types/apiContracts.ts` and datasets from `src/lib/mockData.ts`.
```

### 📌 Prompt for Developer 2 (Basic Coder - UI Components):
```text
You are Developer 2 on RailSuraksha AI. Your exclusive domain is building client-side UI components in `src/components/Overview/` and `src/components/Auditor/`.

Build:
1. `KpiStrip.tsx` (6 operational metric cards displaying Active Trains, Track Circuits, Signals, Incidents, Active Holds).
2. `IncidentQueue.tsx` (Priority alert list displaying severity badges and `[APPROVE ACTION]` buttons).
3. `DecisionLogModal.tsx` (Drawer modal showing 4-step AI decision logs).

Follow Light-Blue Mintlify styling (#F0F6FC base, #FFFFFF cards with #D0DFEE border, 4px button radius, 16px card radius). Import mock data from `src/lib/mockData.ts`. Do NOT touch `src/app/page.tsx` or `src/lib/agents/`.
```

### 📌 Prompt for Developer 3 (ML, AI & Physics Lead):
```text
You are Developer 3 on RailSuraksha AI. Your exclusive domain is building pure TypeScript business logic in `src/lib/agents/`, `src/lib/physics/`, and `src/lib/vision/`.

Implement:
1. `kavachBrakingAgent.ts`: RDSO stopping distance formula D_stop = (V^2 / (2 * g * (mu + G))) + (V * t_reaction). Compare D_stop vs D_obstacle.
2. `triageAgent.ts`: Severity scoring classifier (CRITICAL, MODERATE, LOW).
3. `sectionDispatchAgent.ts`: 5-minute hold timer & crowd flow density index calculation.
4. `explainableLogger.ts`: Immutable 4-step decision log timeline generator.

Export pure TypeScript functions. Do NOT touch UI components or `src/app/page.tsx`.
```
