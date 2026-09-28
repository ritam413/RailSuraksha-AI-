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
- **Typography Engine:**
  - **Display / Editorial Serifs:** `Ivy Presto` / `Cormorant Garamond` (`--font-display` / `.font-display`) for hero titles and major section headings ($\ge 28\text{px}$) with hairline serifs and subtle positive tracking.
  - **UI Sans:** `Inter` (`--font-sans` / `.font-sans`) for operational data, telemetry badges, tables, and nav links.
- **Visualization & Charting:** Recharts (`ResponsiveContainer`, `AreaChart`, `ComposedChart`, `PieChart`, `ReferenceLine`) & Three.js WebGL 3D digital twins
- **Styling & Design Tokens:** Tailwind CSS v4 with dual-mode luxury color token system:
  - **Light Mode (Mintlify Clean Base):**
    - Canvas: `#F0F6FC`
    - Card: `#FFFFFF` (1px border `#D0DFEE`)
    - Elevated: `#E6F0FA`
    - Primary Accent: `#2B7FFF` (Signal Blue)
    - Ink Slate Text: `#0F172A`
  - **Dark Mode (Slash Luxury Obsidian System):**
    - Canvas (Obsidian): `#08080a`
    - Card Surface (Onyx): `#040406`
    - Elevated Panels (Carbon): `#121317`
    - Hairline Borders (Graphite / Slate / Smoke): `#1c1d22` / `#2e3038` / `#464853`
    - Body Text (Bone / Silver / Fog / Ash): `#e2e3e9` / `#c7c9d1` / `#9194a1` / `#5e616e`
    - High-Emphasis Heading / Active Fill: `#ffffff` (Paper White)
    - Warm Curated Accent: `#cc9166` (Copper)
    - Financial & Telemetry Accent: `#ae9357` (Gilded Gradient)
  - **Radii:** 4px button/input, 16px card, 24px container (strictly 0 pill buttons).
- **State Management & Agent Flow:** Modular pure TypeScript agents in `src/lib/agents/` communicating with React UI components via atomic `useSyncExternalStore` hooks.
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
│   ├── layout.tsx                    # Root layout with AuthProvider wrapper
│   ├── page.tsx                      # Command Center master dashboard
│   ├── landing/                      # 3D Shadow Block WebGL & GSAP landing page
│   │   └── page.tsx
│   ├── login/                        # Dedicated Suspense-wrapped login & persona auth hub
│   │   ├── page.tsx
│   │   └── LoginClient.tsx
│   ├── unauthorized/                 # Statutory RDSO access denial screen
│   │   └── page.tsx
│   ├── planner/                      # Screen 1: Corridor Planner & Joint Block Optimizer (CPTM)
│   │   └── page.tsx
│   ├── interlocking/                 # Screen 2: Section Interlocking & Signal Controller (Controller)
│   │   └── page.tsx
│   ├── vision-telemetry/             # Screen 3: Loco Cab Forward Vision & TCAS Telemetry (Loco Pilot)
│   │   └── page.tsx
│   ├── auditor/                      # Screen 4: Statutory Safety Auditor & CRS Form 14B (Auditor)
│   │   └── page.tsx
│   └── field-checkin/                # Screen 5: Ground Crew Execution & Anti-Ghost Verification (SSE Field)
│       └── page.tsx
├── context/
│   └── AuthContext.tsx               # React 19 useSyncExternalStore RBAC auth engine
├── components/
│   ├── Navbar.tsx                    # Top navigation with dynamic RBAC tab filtering
│   ├── Auth/
│   │   ├── ProtectedRoute.tsx        # Client-side RDSO statutory route guard
│   │   └── RoleSwitcherDropdown.tsx  # 1-click persona switcher dropdown
│   ├── Field/
│   │   └── GroundCheckinPortal.tsx   # GPS Geofence, YOLOv11 PPE, 25kV OHE validation
│   ├── LocoCameraFeed.tsx            # Forward loco cab video & hazard overlay
│   ├── AgentPipelineCanvas.tsx       # 4-stage Kavach execution pipeline visualizer
│   ├── PlatformGatewayFeed.tsx       # View 3 Platform CCTV crowd surge monitor
│   ├── Charts/                       # Recharts analytics visualizers
│   │   ├── DecelerationCurve.tsx     # RDSO Kavach EBD kinematic deceleration curve & weather friction simulator
│   │   ├── TriageDonut.tsx           # Multi-department TMS/TDMS/SMMS demand distribution & shadow bundling donut
│   │   └── index.ts                  # Recharts module exports
│   ├── Common/
│   │   └── Card.tsx                  # Standard Mintlify card wrapper
│   ├── Overview/
│   │   ├── KpiStrip.tsx              # 6-metric operational summary strip
│   │   ├── InterlockingMap.tsx       # Track block & signaling aspect diagram
│   │   └── IncidentQueue.tsx         # AI Triage incident priority list
│   ├── Auditor/
│   │   ├── DecisionLogModal.tsx      # 4-step explainable AI audit timeline modal
│   │   └── AuditorWorkspace.tsx      # Regulatory compliance terminal & CRS attestation
│   └── Requisition/
│       └── BlockRequisitionModal.tsx # Direct TDMS/SMMS/TMS online block requisition portal
├── lib/
│   ├── rbac.ts                       # RBAC permission matrix, officer personas, route matchers
│   ├── apiClient.ts                  # Type-safe API client with X-User-Role / X-Employee-ID headers
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
    └── apiContracts.ts               # Shared TypeScript interfaces & types (AppRole, UserProfile, contracts)
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



