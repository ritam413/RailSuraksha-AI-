# RailSuraksha AI — Component Library & UI Architecture

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Design System:** Light-Blue Mintlify Discipline (`#F0F6FC` Base, `#FFFFFF` Cards, `#D0DFEE` Border, `#2B7FFF` Accent, 4px button/input radius, 16px card radius, strictly zero pill buttons)  
**Governing Standards:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 🧱 1. Atomic Design Component Taxonomy

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              COMPONENT ARCHITECTURE TAXONOMY                           │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 1. ATOMS                   │ 2. MOLECULES               │ 3. ORGANISMS & LAYOUTS       │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • UrgencyBadge (P1/P2/P3)  │ • KpiCard                  │ • Navbar                     │
│ • SignalHead (Aspects)     │ • DemandRowItem            │ • KpiStrip (6 Metrics)       │
│ • StatusDot                │ • HorizonTabButton         │ • CorridorStringChart (SVG)  │
│ • MetricCounter            │ • KavachTsrPill            │ • IncidentQueue (Demand Triage│
│ • DepartmentTag            │ • DecisionTimelineStep     │ • InterlockingMap            │
│ • IconButton / Button      │ • AuditHashBox             │ • DecisionLogModal (Drawer)  │
│ • Tooltip / MonospaceTag   │ • SpeedLimitIndicator      │ • CabHudTelemetry            │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

---

## 🧩 2. Detailed Component Specifications & Props Contracts

### 2.1 Atoms

#### `UrgencyBadge`
* **File:** `src/components/Common/UrgencyBadge.tsx`
* **Props:**
  ```typescript
  interface UrgencyBadgeProps {
    tier: 'P1_CRITICAL' | 'P2_SCHEDULED' | 'P3_ROUTINE';
    score?: number; // 0.00 - 1.00
    showScore?: boolean;
  }
  ```
* **Styling Tokens:**
  * `P1_CRITICAL`: Background `#FEE2E2`, Border `#FCA5A5`, Text `#991B1B` (Crimson).
  * `P2_SCHEDULED`: Background `#FEF3C7`, Border `#FCD34D`, Text `#92400E` (Amber).
  * `P3_ROUTINE`: Background `#DCFCE7`, Border `#86EFAC`, Text `#166534` (Emerald).
  * Radius: strictly `4px`.

#### `SignalHead`
* **File:** `src/components/Common/SignalHead.tsx`
* **Props:**
  ```typescript
  interface SignalHeadProps {
    aspect: 'RED' | 'YELLOW' | 'DOUBLE_YELLOW' | 'GREEN';
    signalId: string; // e.g. "S-12"
    isClamped?: boolean;
  }
  ```
* **Rendering:** 4-aspect vertical LED stack with active pulsing glow and lockout lock icon overlay if `isClamped = true`.

---

### 2.2 Molecules

#### `KpiCard`
* **File:** `src/components/Overview/KpiCard.tsx`
* **Props:**
  ```typescript
  interface KpiCardProps {
    title: string;
    value: string | number;
    subtext: string;
    trend?: 'UP' | 'DOWN' | 'NEUTRAL';
    trendValue?: string;
    variant?: 'primary' | 'warning' | 'success' | 'danger';
  }
  ```
* **Styling:** White surface `#FFFFFF`, 1px border `#D0DFEE`, 16px radius, subtle hover lift.

#### `DemandRowItem`
* **File:** `src/components/Overview/DemandRowItem.tsx`
* **Props:**
  ```typescript
  interface DemandRowItemProps {
    demand: MaintenanceDemand;
    onSanction: (id: string) => void;
    onViewDossier: (id: string) => void;
  }
  ```
* **Features:** Displays department badge (`TMS_CIVIL`, `TDMS_ELECTRICAL`, `SMMS_SIGNAL`), chainage range (`KM 108/4`), track circuit ID (`TC-03`), estimated duration, and `[SANCTION BLOCK]` action button.

---

### 2.3 Organisms

#### `CorridorStringChart`
* **File:** `src/components/Planner/CorridorStringChart.tsx`
* **Props:**
  ```typescript
  interface CorridorStringChartProps {
    horizon: 'TACTICAL_24H' | 'WEEKLY_7D' | 'MONTHLY_30D';
    trainSchedules: TrainScheduleSlot[];
    jointBlocks: JointBlockSchedule[];
    onBlockClick: (blockId: string) => void;
    currentTime?: string;
  }
  ```
* **Architecture:**
  * High-performance SVG canvas.
  * X-Axis: 24-hour timeline (00:00 to 24:00 IST) with 1-hour grid markers.
  * Y-Axis: Station chainage linear scale (CSMT $\to$ Dadar $\to$ Thane $\to$ Kalyan).
  * Trajectory Lines: Slanted SVG paths styled by train priority (Rajdhani Blue `#2B7FFF`, Express Purple `#8B5CF6`, Freight Gray `#64748B`).
  * Maintenance Overlays: Colored semi-transparent rectangular zones with cross-hatching and bundling badges.

#### `IncidentQueue`
* **File:** `src/components/Overview/IncidentQueue.tsx`
* **Props:**
  ```typescript
  interface IncidentQueueProps {
    demands: MaintenanceDemand[];
    onSanction: (demandId: string) => void;
    onFilterChange: (department: string | null) => void;
  }
  ```
* **Features:** Filter tabs (`[All]`, `[TMS Civil]`, `[TDMS OHE]`, `[SMMS Signal]`, `[P1 Only]`), search input, and one-click bulk bundling trigger.

#### `KpiStrip`
* **File:** `src/components/Overview/KpiStrip.tsx`
* **Props:**
  ```typescript
  interface KpiStripProps {
    metrics: CorridorKpiMetrics;
  }
  ```
* **Renders 6 Cards:**
  1. *Corridor Downtime Saved:* `38.4%` (Shadow Blocking ROI).
  2. *Track Availability Index:* `96.2%`.
  3. *Active Corridor Blocks:* `03 Active`.
  4. *Pending Demands:* `08 In Queue`.
  5. *White Corridor Headway Gap:* `3h 15m`.
  6. *Active Kavach TSRs:* `02 Enforced (30 km/h)`.

#### `InterlockingMap`
* **File:** `src/components/Overview/InterlockingMap.tsx`
* **Props:**
  ```typescript
  interface InterlockingMapProps {
    circuits: TrackCircuitState[];
    activeBlockId?: string;
  }
  ```
* **Features:** Top-down schematic of tracks `TC-01` to `TC-06`, live axle counter occupancies, signal heads (`S-12`), and turnout points (`SW-04`).

#### `DecisionLogModal`
* **File:** `src/components/Auditor/DecisionLogModal.tsx`
* **Props:**
  ```typescript
  interface DecisionLogModalProps {
    isOpen: boolean;
    onClose: () => void;
    dossier: ExplainableDecisionDossier | null;
    onExportPdf: (blockId: string) => void;
  }
  ```
* **Features:** Slide-over modal drawer displaying the 4-step chronological audit timeline, SHA-256 digital signature copy button, and RDSO Form 14B certificate export.
