# Project Context: IRIS AI (Intelligent Railway Inspection and Restoration AI)

## 1. Project Overview & SIH 26027 Problem Statement
IRIS AI (Intelligent Railway Inspection and Restoration AI) is an AI-powered Automatic Block Planning and Corridor Optimization System aligned with **Smart India Hackathon (SIH) Problem Statement 26027**: *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*. 

It transforms decentralized, manual maintenance scheduling into a data-driven, coordinated process by integrating maintenance defect data across Civil Engineering (**TMS**), Electrical TRD (**TDMS**), and Signaling & Telecom (**SMMS**) with live corridor availability from the Control Office Application (**COA**). It uses Google OR-Tools CP-SAT and a **Rolling Horizon Framework (RHF)** (24h Tactical, 7-Day Operational, 30-Day Strategic) to bundle co-located maintenance into multi-department **joint shadow blocks**, and disseminates Temporary Speed Restrictions (TSRs) directly to locomotive **Kavach TCAS** units.

## 2. Grounding Status & Decoupled Architecture
* **Grounded Core Paradigm:** Multi-Horizon Rolling Planning (24h Tactical, 7D Operational, 30D Strategic) + Mathematical Constraint Programming (Google OR-Tools CP-SAT Disjunctive Graph) + Cryptographic Explainable Audit Trails (SHA-256).
* **Decoupled Swappable Layers:** Ingestion Adapters (`IIngestionAdapter`) and Dynamic Safety Policy Engine (`DivisionalPolicyProfile`). Specific numerical values (e.g. 15-min train clearance, 10-min earthing buffers, 30 km/h TSR default, urgency weights `0.40/0.35/0.25`) are provisional reference baselines drawn from railway manuals (IRPWM, ACTM, IRSEM) and are externalized into configurable policy profiles rather than hardcoded in source code.

## 3. Team Architecture & Ownership Matrix
- **Developer 1 (Lead / Integrator):** `src/app/page.tsx`, `src/components/Navbar.tsx`, `src/components/LocoCameraFeed.tsx`, `src/components/AgentPipelineCanvas.tsx`, `src/components/PlatformGatewayFeed.tsx`, `src/app/globals.css`.
- **Developer 2 (UI Components Lead):** `src/components/Overview/KpiStrip.tsx`, `src/components/Overview/IncidentQueue.tsx`, `src/components/Overview/InterlockingMap.tsx`, `src/components/Auditor/DecisionLogModal.tsx`, `src/components/Common/**`.
- **Developer 3 (ML / AI / Physics Lead):** `src/lib/agents/**`, `src/lib/physics/**`, `src/lib/vision/**`.

## 4. Architecture & Tech Stack
- **Architecture Style:** Hexagonal (Ports & Adapters) with externalized policy configuration.
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Visualization & Charting:** Recharts (`ResponsiveContainer`, `AreaChart`, `ComposedChart`, `PieChart`, `ReferenceLine`)
- **Styling:** Tailwind CSS v4 with Light-Blue Mintlify Design Tokens:
  - Base Canvas (Surface 0): `#F0F6FC`
  - Card/Panel Surface (Surface 1): `#FFFFFF` (1px border `#D0DFEE`)
  - Elevated Tabs/Inputs (Surface 2): `#E6F0FA`
  - Primary Accent: `#2B7FFF` (Signal Blue)
  - Atmospheric Accent: `#426188` (Twilight Blue)
  - Typography Primary: `#0F172A` (Ink Slate)
  - Radii: 4px button/input, 16px card, 24px container (strictly 0 pill buttons)
- **State Management & Agent Flow:** Modular pure TypeScript agents in `src/lib/agents/` communicating with React UI components.
- **Contracts & Data:** Shared interface contracts in `src/types/apiContracts.ts` and static mock data generator in `src/lib/mockData.ts`.

## 5. Directory Structure
```
data/                                 # Grounded & scraped Indian Railways open datasets
├── cr_csmt_kalyan_corridor_trains.json # Real schedules for Central Railway corridor
├── cag_derailments_and_block_deficits.json # CAG Report 22 traffic block deficit metrics
├── rdso_kavach_friction_and_braking_benchmarks.json # RDSO braking parameters
└── station_gateway_footfalls.json    # Station platform bottleneck crowd thresholds
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                      # Main Command Center page
├── components/
│   ├── Navbar.tsx                    # Top navigation & Advisory/Autonomous switcher
│   ├── LocoCameraFeed.tsx            # Forward loco cab video & hazard overlay
│   ├── AgentPipelineCanvas.tsx       # 4-stage Kavach execution pipeline visualizer
│   ├── PlatformGatewayFeed.tsx       # View 3 Platform CCTV crowd surge monitor
│   ├── Charts/                       # Recharts analytics visualizers
│   │   ├── KinematicDecelChart.tsx   # Kavach EBD velocity & brake pressure curve
│   │   ├── CrowdSurgeTrendChart.tsx  # Platform bottleneck PAX flow & surge threshold
│   │   └── IncidentTriageDonutChart.tsx # Severity P1/P2/P3/P4 distribution
│   ├── Common/
│   │   └── Card.tsx                  # Standard Mintlify card wrapper
│   ├── Overview/
│   │   ├── KpiStrip.tsx              # 6-metric operational summary strip
│   │   ├── InterlockingMap.tsx       # Track block & signaling aspect diagram
│   │   └── IncidentQueue.tsx         # AI Triage incident priority list
│   └── Auditor/
│       └── DecisionLogModal.tsx      # 4-step explainable AI audit timeline modal
├── lib/
│   ├── apiClient.ts                  # Type-safe API client connecting to FastAPI port 8000
│   ├── audioAlerts.ts                # Web Audio API synthesizer for RDSO cab alarms & chimes
│   ├── agents/
│   │   ├── kavachBrakingAgent.ts     # RDSO Emergency Braking Distance physics (with weather friction factors)
│   │   ├── triageAgent.ts            # Severity scoring & classifier
│   │   ├── sectionDispatchAgent.ts   # Platform hold timer & crowd density agent
│   │   └── explainableLogger.ts      # Immutable 4-step decision log generator
│   ├── mockData.ts                   # Static datasets, circuits, incidents, demo video URLs
│   ├── physics/                      # Physics calculation helpers
│   └── vision/                       # Computer vision inference helpers
└── types/
    └── apiContracts.ts               # Shared TypeScript interfaces & types (weather, sensor angles, contracts)
```

## 6. Key Rules & Constraints
- Strict role boundaries according to the team ownership matrix.
- Zero pill buttons across all components (strictly 4px radius).
- All AI automated interventions must produce an immutable 4-step explainable decision log.
- Domain rules and parameters must be configurable via policy profiles rather than hardcoded in business logic.

## 7. Dual-Mode API Client & Network Invariants (TICKET-DEV1-06)
- **File Location:** `src/lib/apiClient.ts` | **Tests:** `tests/apiClient.test.ts` (13/13 passing)
- **Base URL Resolution:** `process.env.NEXT_PUBLIC_API_URL` || `process.env.NEXT_PUBLIC_BACKEND_URL` || `https://railsuraksha-ai.onrender.com/api/v1`
- **Timeout Policy:** 1500ms default for GET queries; 2500ms for POST mutations via native `AbortController`.
- **Memory Safety:** All offline fallbacks return immutable deep clones via `structuredClone()` to prevent in-memory SPA state contamination.
- **Exported API Methods & Fallback Matrix:**
  1. `fetchCorridorSchedule(divisionId)` $\to$ `MOCK_JOINT_BLOCKS`
  2. `fetchMaintenanceDemands(department)` $\to$ `MOCK_DEMANDS`
  3. `fetchCorridorKpis()` $\to$ `MOCK_CORRIDOR_KPIS`
  4. `fetchInterlockingCircuits()` $\to$ `MOCK_CIRCUITS` (alias of `MOCK_TRACK_CIRCUITS`)
  5. `sanctionBlockRequest(blockId, controllerId)` $\to$ `MOCK_DECISION_DOSSIER`
  6. `checkBackendHealth()` $\to$ `{ online: boolean, message: string, latencyMs?: number }`
  7. `fetchInterlockingState()` $\to$ `MOCK_INTERLOCKING_STATE` (GIS Topology)
  8. `fetchIncidentQueue(status, severity)` $\to$ `MOCK_INCIDENTS`
  9. `reviewIncidentAction(incidentId, action, operatorId)` $\to$ `{ success: true, newStatus }`
  10. `calculateEbd(params)` $\to$ `calculateKavachEbd` local physics agent
  11. `fetchPlatformHoldState(platformId)` $\to$ `MOCK_PLATFORM_HOLD_STATE`
  12. `overridePlatformHold(platformId, action)` $\to$ `RELEASE` (0s) / `EXTEND_3M` (+180s)
  13. `fetchAuditLog(incidentId, mode)` $\to$ `buildExplainableDecisionLog`



