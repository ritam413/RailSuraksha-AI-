# RailSuraksha AI — Comprehensive Architecture & Frontend/Backend Walkthrough

> **Location:** `docs/architecture_walkthrough.md`  
> **Purpose:** Full technical walkthrough of System Architecture, Multi-Agent Pipeline, Frontend UI Components, and Backend Event-Driven Execution Engine.  
> **Last Updated:** 2026-08-21  

---

## 🏗️ 1. High-Level Architecture Pattern

RailSuraksha AI utilizes an **Event-Driven Microservices Architecture** paired with a **Real-Time Edge Multi-Agent Pipeline**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER (FRONTEND)                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Next.js 16 App Router (React 19, Mintlify Light-Blue System, Tailwind v4)        │  │
│  │  - View 1: Railway Signaling & Interlocking Overview Map (SVG Interlocking Grid) │  │
│  │  - View 2: Loco-Cab Forward Vision & 4-Agent Pipeline Canvas Animation           │  │
│  │  - View 3: Platform Gateway CCTV & 5-Min Deterministic Hold Timer               │  │
│  │  - Auditor Workspace: Explainable Decision Log Viewer Modal                       │  │
│  └──────────────────────────────────────────┬───────────────────────────────────────┘  │
└─────────────────────────────────────────────┼──────────────────────────────────────────┘
                                              │ WebSockets / SSE / REST APIs
┌─────────────────────────────────────────────▼──────────────────────────────────────────┐
│                                   BACKEND APPLICATION SERVICES                         │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │ API Gateway & Router   │  │ Real-Time WebSocket Hub │  │ Deployment Mode Manager │  │
│  │ (REST / Auth / Audits) │  │ (Telemetry Broadcaster) │  │ (Advisory vs Autonomous)│  │
│  └───────────┬────────────┘  └────────────┬────────────┘  └────────────┬────────────┘  │
└──────────────┼────────────────────────────┼────────────────────────────┼───────────────┘
               │                            │                            │
┌──────────────▼────────────────────────────▼────────────────────────────▼───────────────┐
│                                 AI MULTI-AGENT SAFETY ENGINE                           │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ 1. TRIAGE AGENT (Filters edge frames & scores anomaly severity)                  │  │
│  ├────────────────────────────┬────────────────────────────┬────────────────────────┤  │
│  │ 2. KAVACH BRAKING AGENT    │ 3. SECTION DISPATCH AGENT  │ 4. RISK AUDIT AGENT    │  │
│  │ (RDSO EBD Physics Calc)    │ (Rerouting & 5-Min Hold)   │ (Duty Logs & Compliance│  │
│  └───────────┬────────────────┴────────────┬───────────────┴───────────┬────────────┘  │
└──────────────┼─────────────────────────────┼───────────────────────────┼───────────────┘
               │                             │                           │
┌──────────────▼─────────────────────────────▼───────────────────────────▼───────────────┐
│                                  EDGE HARDWARE & TELEMETRY LAYER                       │
│  ┌───────────────────────┐   ┌───────────────────────────┐   ┌──────────────────────┐  │
│  │ Loco-Cab Cam (YOLOv11)│   │ Station Gateway CCTV (P1) │   │ Track Circuit Relay  │  │
│  └───────────────────────┘   └───────────────────────────┘   └──────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎨 2. Frontend Walkthrough (Next.js 16 + React 19)

### 2.1 Spatial Layout & Mintlify Theme Tokens
The frontend implements **Mintlify Layout Discipline**:
- **Canvas Base:** `#F0F6FC` (`bg-[#F0F6FC]`)
- **Cards/Panels:** `#FFFFFF` (`bg-white border-[#D0DFEE]`)
- **Elevated Controls:** `#E6F0FA` (`bg-[#E6F0FA]`)
- **Primary Accent:** `#2B7FFF` (Signal Blue)
- **Geometry:** `4px` button/input radius, `16px` card radius, `24px` main container radius. Strictly zero pill buttons.

### 2.2 Component Hierarchy & Routing
- `src/app/layout.tsx`: Configures `Inter` font, root canvas `#F0F6FC` background, and global telemetry providers.
- `src/app/page.tsx`: Top-level view router switching between `Overview`, `LocoCab`, and `PlatformGateway` views based on active tab state.
- `src/components/Navbar.tsx`: Fixed header rendering brand logo, view links, IST clock, operator ID, and the **Deployment Mode Switcher** dropdown.

#### View Components:
1. `src/components/Overview/`:
   - `KpiStrip.tsx`: 6 white metric cards displaying active trains, track circuits, signals, incidents, and holds.
   - `InterlockingMap.tsx`: SVG railway track interlocking diagram (circuits `BLK-101`, signals `S-12`/`S-14` with Red/Yellow/Green aspect lights, switch points `P-4A`).
   - `TriagePanel.tsx`: Live incident queue with severity badges and dispatcher review action buttons (`[APPROVE ACTION]`, `[REJECT]`).
2. `src/components/LocoCab/`:
   - `LocoCameraFeed.tsx`: Locomotive forward camera feed with YOLOv11 bounding boxes for track hazards (boulders, surface cracks).
   - `AgentPipelineCanvas.tsx`: Interactive canvas visualizing the 4 sequential AI subagent calculation steps (Vision $\to$ Telemetry $\to$ EBD Physics $\to$ Auto-Brake Actuator).
3. `src/components/PlatformGateway/`:
   - `GatewayCctvFeed.tsx`: Entrance CCTV video feed at Pillar #1 with crowd count and Optical Flow density ($\rho = 88\%$).
   - `HoldCountdown.tsx`: 5-minute countdown ring timer holding adjacent train arrivals.
   - `StationController.tsx`: Manual override controls (`[RELEASE HOLD NOW]`, `[EXTEND HOLD +3M]`).
4. `src/components/Audit/`:
   - `DecisionLogModal.tsx`: Slide-over drawer displaying step-by-step explainable AI decision log and report export button.

---

## ⚙️ 3. Backend Walkthrough (Execution Pipeline)

### 3.1 Step 1 — Anomaly Ingestion & Edge Frame Pre-processing
1. Edge camera streams (Loco front camera, Station Gateway camera) run YOLOv11 detection on incoming video frames.
2. When a bounding box confidence exceeds 85%, an `AnomalyEvent` payload is transmitted over WebSocket / REST to `POST /api/v1/triage/classify`.

### 3.2 Step 2 — AI Triage Agent Scoring
1. `triageAgent.ts` evaluates the incoming payload and assigns a severity score (0.0 to 1.0).
2. Scores $\ge 0.90$ are categorized as `CRITICAL` and routed to `KavachBrakingAgent`.
3. Scores between $0.60$ and $0.89$ are categorized as `MODERATE` and routed to `SectionDispatchAgent`.
4. Scores $< 0.60$ are categorized as `LOW` and routed to `RiskAuditAgent`.

### 3.3 Step 3 — Kavach Braking Agent Physics Execution
1. Queries train telemetry: Speed $V$, Mass $M$, Track Gradient $G$, Friction $\mu$.
2. Executes RDSO Emergency Braking Distance formula:
   $$D_{\text{stop}} = \frac{V^2}{2 \cdot g \cdot (\mu + G)} + (V \cdot t_{\text{reaction}})$$
3. If $D_{\text{stop}} > D_{\text{obstacle}}$, flags collision risk and generates brake command.
4. Check global `deploymentMode`:
   - If `ADVISORY`: Sends alert to `TriagePanel.tsx` with `[APPROVE BRAKING ACTION]` button.
   - If `AUTONOMOUS`: Immediately dispatches auto-brake command to locomotive cab hardware solenoid.

### 3.4 Step 4 — Section Dispatch Agent Platform Hold Control
1. Monitors Platform Gateway Occupancy Index $\rho = \text{Count} / \text{Capacity}$.
2. If Platform 17 staircase occupancy exceeds 80%, places an automatic 5-minute hold on Platform 18 incoming signal (`S-16` aspect set to `HOLD_ACTIVE` / Blue).
3. Evaluates dynamic ML clearance rate: if exit flow remains bottlenecked after 5 minutes, automatically extends hold by +3 minutes.

### 3.5 Step 5 — Immutable Explainable Decision Logging
1. Every multi-agent action appends an entry to the `ExplainableDecisionLog` store.
2. Captures exact timestamps, camera frame URLs, confidence scores, physics formula parameters, dispatcher review actions, and stopping outcomes.
3. Accessible via `DecisionLogModal.tsx` for safety auditors.
