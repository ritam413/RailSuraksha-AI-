# RailSuraksha AI — 3-Developer Parallel Execution Plan (SIH 26027)

> **Location:** `docs/three_developer_execution_plan.md`  
> **Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
> **Target Timeline:** Fast-Track Hackathon Prototype & Finalist Presentation  
> **Team Strategy:** Strict File/Directory Ownership Boundaries & Contract-First Interface Specs (Zero Merge Conflicts).

---

## 👥 1. Role Allocation & Dedicated File Ownership Matrix

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           3-DEVELOPER PARALLEL WORK SPLIT (SIH 26027)                   │
├───────────────────────────────┬───────────────────────────────┬─────────────────────────┤
│ DEVELOPER 1 (LEAD / INTEGRATE)│ DEVELOPER 2 (UI COMPONENTS)   │ DEVELOPER 3 (AI / SOLVER│
│ Full-Stack & Operations Engine│ Dispatcher Surfaces & Dossiers│ Optimization & Safety   │
├───────────────────────────────┼───────────────────────────────┼─────────────────────────┤
│ 📁 Dedicated Directory:       │ 📁 Dedicated Directory:       │ 📁 Dedicated Directory: │
│   src/app/page.tsx            │   src/components/Overview/**  │   src/lib/agents/**     │
│   src/components/Navbar.tsx   │   src/components/Auditor/**   │   src/lib/ingestion/**  │
│   src/components/Planner/**   │   src/components/Common/**    │   backend/optimizer.py  │
│   src/app/globals.css         │                               │   src/types/**          │
├───────────────────────────────┼───────────────────────────────┼─────────────────────────┤
│ 🎯 Focus:                     │ 🎯 Focus:                     │ 🎯 Focus:               │
│   - Next.js 16 App Router     │   - 6-Metric KPI Strip        │   - Unified Ingestion   │
│   - Corridor String Chart     │   - Department Demand Queue   │     Adapter (TMS/TDMS)  │
│   - Multi-Horizon Switcher    │   - Decision Dossier Modal    │   - MILP Shadow-Block   │
│     (24h / 7D / 30D)          │   - Mintlify Light-Blue tokens│     Optimizer Engine    │
│   - Interlocking Sync         │   - Urgency Tier Badges       │   - Kavach TSR Broadcast│
└───────────────────────────────┴───────────────────────────────┴─────────────────────────┘
```

---

## 🔒 2. Shared Interface Contract (`src/types/apiContracts.ts`)

All 3 developers program against these shared TypeScript contracts:

```typescript
// src/types/apiContracts.ts

export type DeploymentMode = 'ADVISORY' | 'AUTONOMOUS';
export type DepartmentCode = 'TMS_CIVIL' | 'TDMS_ELECTRICAL' | 'SMMS_SIGNAL';
export type UrgencyTier = 'P1_CRITICAL' | 'P2_SCHEDULED' | 'P3_ROUTINE';
export type HorizonTier = 'TACTICAL_24H' | 'WEEKLY_7D' | 'MONTHLY_30D';

export interface MaintenanceDemand {
  id: string;
  department: DepartmentCode;
  assetType: 'RAIL_TRACK' | 'OHE_CATENARY' | 'POINT_MACHINE' | 'TRACK_CIRCUIT';
  sectionId: string;
  chainageKm: string;           // e.g. "KM 108/4 - 112/2"
  trackCircuitId: string;       // e.g. "TC-03"
  urgencyTier: UrgencyTier;
  urgencyScore: number;         // 0.0 - 1.0
  estimatedDurationMinutes: number;
  requiredAssets: string[];      // e.g. ["CSM_TAMPER", "TOWER_WAGON"]
  canShadowBlock: boolean;
  status: 'PENDING_TRIAGE' | 'SLOTTED' | 'SANCTIONED';
}

export interface JointBlockSchedule {
  blockId: string;
  sectionId: string;
  trackCircuits: string[];
  startTime: string;            // e.g. "01:30 IST"
  endTime: string;              // e.g. "04:45 IST"
  durationMinutes: number;
  bundledDemands: MaintenanceDemand[];
  downtimeSavedMinutes: number; // Co-located bundling savings
  passengerDelays: number;      // Strictly 0
  freightDelayMinutes: number;
  kavachTsrSpeedKmh: number;    // e.g. 30
  sanctionStatus: 'RECOMMENDED' | 'SANCTIONED';
}

export interface CorridorKpiMetrics {
  corridorDowntimeSavedPct: number; // 38.4%
  assetAvailabilityIndexPct: number; // 96.2%
  activeBlocksCount: number;
  pendingDemandsCount: number;
  whiteCorridorHeadwayMinutes: number; // 195 mins (3h 15m)
  activeKavachTsrsCount: number;
}
```

---

## ⏱️ 3. Hour-by-Hour Implementation Sequence

| Hour | Developer 1 (Lead) | Developer 2 (UI Layouts) | Developer 3 (AI & Solver) |
| :---: | :--- | :--- | :--- |
| **01** | Wire top Navbar, Horizon Switcher (24h/7D/30D), and view containers. | Build `KpiStrip.tsx` with 6 block planning metrics and status badges. | Formalize `src/types/apiContracts.ts` and `src/lib/mockData.ts` with TMS/SMMS/TDMS datasets. |
| **02** | Scaffold SVG Corridor Time-Distance String Chart with train lines. | Implement `IncidentQueue.tsx` with Department origin badges and filter tabs. | Build Unified Ingestion Normalizer mapping chainage KMs to `TC-01..06`. |
| **03** | Overlay shaded rectangular maintenance block windows onto String Chart. | Style Urgency Tier badges (`P1`, `P2`, `P3`) and `[SANCTION BLOCK]` buttons. | Implement Joint Shadow-Block Bundling algorithm (co-location matching). |
| **04** | Connect one-click `[SANCTION BLOCK]` to update Interlocking Map circuits. | Build `DecisionLogModal.tsx` displaying 4-step block sanction justification. | Integrate Google OR-Tools MILP constraint logic / white-corridor search. |
| **05** | Integrate Advisory vs Autonomous mode toggle and live demo ticker. | Wire RDSO Section 14B certificate export and clipboard copy. | Generate Kavach TSR packets (30 km/h) and safety boundary checks. |
| **06** | End-to-end rehearsal, UI polish, run `vitest` test suite, update tracking files. | Cross-browser styling audit & responsive layout verification. | Verification of zero-passenger-delay constraint and downtime savings. |

---

## 🎯 4. Demo Pitch Narrative for Hackathon Judges

1. **The Hook (0:00–0:45):** Show the problem — Civil, Electrical, and Signal teams blocking the same track 3 times a week, causing cascading freight delays and passenger speed restrictions.
2. **The Innovation (0:45–2:00):** Show the **Corridor Time-Distance String Chart**. Point to the 02:15 AM night lull where the AI bundled OHE catenary wash and track tamping into **one single window**, saving **38.4% corridor downtime**.
3. **The Workflow (2:00–3:15):** The Section Controller clicks `[SANCTION BLOCK]`. Instantly show:
   * The Interlocking Map clamping circuit `TC-03` to red.
   * Kavach TCAS broadcasting a 30 km/h TSR directly to locomotives.
   * The Decision Log producing an immutable RDSO Form 14B certificate.
4. **The Impact (3:15–4:00):** Highlight quantifiable ROI: +18% asset availability, 0 passenger cancellations, and compliance with RDSO safety standards.
