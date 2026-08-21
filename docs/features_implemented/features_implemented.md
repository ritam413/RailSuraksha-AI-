# RailSuraksha AI — Implemented & Planned Features Specification

> **Location:** `docs/features_implemented/features_implemented.md`  
> **Purpose:** Detailed documentation of every feature, why it was implemented, how it is implemented, and how components interact.  
> **Last Updated:** 2026-08-21  

---

## 📋 Summary Matrix of System Features

| Feature Name | Primary Component | Why Implemented | How Implemented | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Global Navigation & Mode Switcher** | `Navbar.tsx` | Enforces single-page tactical switching & Advisory/Autonomous safety compliance | Top fixed header with tab router + mode dropdown context provider | ✅ Specified |
| **Operational KPI Strip** | `KpiStrip.tsx` | Instant situational awareness for Station Master / Controller | 6 metric cards displaying active trains, track circuits, signals, incidents | ✅ Specified |
| **Railway Track Interlocking Diagram** | `InterlockingMap.tsx` | Real-time visual tracking of signal aspects and block occupancy | SVG/Canvas interlocking grid showing track circuits (`BLK-101`) & signals (`S-12`) | ✅ Specified |
| **AI Triage Agent Queue** | `TriagePanel.tsx` | Priority classification of safety anomalies | Severity classifier (`CRITICAL`, `MODERATE`, `LOW`) with human review CTAs | ✅ Specified |
| **Loco-Cab Camera Hazard Vision** | `LocoCameraFeed.tsx` | Continuous optical detection of track obstructions | Video canvas overlay with YOLOv11 bounding box annotations | ✅ Specified |
| **Interactive 4-Agent Pipeline Canvas** | `AgentPipelineCanvas.tsx` | Explainable visualizer for Kavach auto-braking calculations | Animated sequential canvas step (Vision $\to$ Telemetry $\to$ EBD Physics $\to$ Actuation) | ✅ Specified |
| **Platform Gateway CCTV & Crowd Density** | `GatewayCctvFeed.tsx` | Stampede prevention at shared platform staircases | Gateway entrance camera view with YOLOv11 crowd count & Optical Flow velocity | ✅ Specified |
| **5-Min Deterministic Hold & ML Timer** | `HoldCountdown.tsx` | Prevents simultaneous arrivals on adjacent platforms | SVG countdown ring with Station Master manual release/extension overrides | ✅ Specified |
| **Explainable Decision Log & Audit Workspace** | `DecisionLogModal.tsx` | Post-incident compliance filing for Railway Auditors | Modal drawer showing immutable timestamped AI decision trace & report export | ✅ Specified |

---

## 🔎 Detailed Feature Breakdown

### 1. Global Navigation & Deployment Mode Switcher
- **Why Implemented:** Safety governance requires clear visibility of operational views and whether the system is running in Advisory Mode (human approval required) or Autonomous Mode (auto-executed).
- **How Implemented:**
  - `Navbar.tsx` renders brand identity (`RailSuraksha AI PROD-v2.4`).
  - Contains a 3-way view switcher (`OVERVIEW`, `LOCO-CAB VIEW`, `PLATFORM GATEWAY VIEW`).
  - Features a deployment mode dropdown toggle setting global React context `deploymentMode` (`ADVISORY` | `AUTONOMOUS`).
  - Displays live telemetry indicators (`08:45:12 IST`, `AI ONLINE 99.8%`, Controller ID `OP-402`).

---

### 2. Railway Track Interlocking Diagram (Overview Page)
- **Why Implemented:** Railway dispatchers need a single unified track interlocking diagram to monitor signals, track circuits, and active train locations.
- **How Implemented:**
  - Rendered inside `InterlockingMap.tsx` using SVG track paths.
  - Track circuits (e.g., `BLK-101`, `BLK-102`) update fill color based on occupancy state (Gray: Clear, Red: Occupied, Blue: Hold Active).
  - Signals (`S-12`, `S-14`, `S-16`) toggle aspect colors (Green 🟢, Yellow 🟡, Red 🔴).
  - Point switches (e.g., `P-4A`) display locked/unlocked alignment states.

---

### 3. AI Triage Agent & Incident Queue (Overview Page)
- **Why Implemented:** Thousands of sensor events occur daily. The Triage Agent filters false positives and categorizes incidents by urgency.
- **How Implemented:**
  - `TriagePanel.tsx` receives incoming anomaly payloads.
  - Runs classification algorithm (`triageAgent.ts`) to assign severity scores (e.g., `CRITICAL 98.2%`).
  - Directs incident to appropriate agent handler (`KavachBrakingAgent`, `SectionDispatchAgent`, or `RiskAuditAgent`).
  - In Advisory Mode, presents `[APPROVE ACTION]` and `[REJECT]` buttons for dispatcher confirmation.

---

### 4. Loco-Cab Forward Vision & Interactive 4-Agent Pipeline (Loco-Cab View)
- **Why Implemented:** Allows locomotive pilots and dispatchers to see what the train front camera detects and verify emergency braking calculations in real time.
- **How Implemented:**
  - `LocoCameraFeed.tsx` displays front-facing rail video with dynamic bounding boxes highlighting hazards (e.g., `Boulder on Track`, distance `340m`).
  - Clicking `[APPLY BRAKING FORMULA]` triggers `AgentPipelineCanvas.tsx`.
  - Animates the 4 subagents sequentially:
    1. *Vision Agent:* Captures obstacle distance $D_{\text{obstacle}} = 340\text{m}$.
    2. *Telemetry Agent:* Queries train speed $V = 110\text{ km/h}$, mass $M = 1400\text{t}$, friction coefficient $\mu = 0.35$.
    3. *Kavach Physics Agent:* Computes RDSO stopping distance formula $D_{\text{stop}} = 410\text{m}$. Since $D_{\text{stop}} > D_{\text{obstacle}}$, emergency braking is mandatory.
    4. *Auto-Brake Actuator:* Transmits solenoid trigger signal and updates brake state to `EMERGENCY AUTOMATIC BRAKE ACTUATED`.

---

### 5. Platform Gateway CCTV & 5-Minute Hold Timer (Platform Gateway View)
- **Why Implemented:** High-density stations suffer stampedes when two trains arrive simultaneously at adjacent platforms sharing a foot-over-bridge.
- **How Implemented:**
  - `GatewayCctvFeed.tsx` monitors entrance camera (Pillar #1) and calculates Gateway Occupancy Index $\rho = \text{Count} / \text{Capacity}$.
  - `HoldCountdown.tsx` displays a 5-minute countdown ring (`04:12` remaining) holding incoming train on Platform 18 until Platform 17 staircase clears.
  - If crowd flow remains bottlenecked ($\rho > 80\%$), ML extension adds 3 minutes automatically.
  - `StationController.tsx` provides manual override controls (`[RELEASE HOLD NOW]`, `[EXTEND HOLD +3M]`).

---

### 6. Explainable Decision Log & Auditor Workspace
- **Why Implemented:** Ensures complete transparency, accountability, and regulatory compliance for Indian Railways safety inspectors.
- **How Implemented:**
  - `DecisionLogModal.tsx` aggregates end-to-end timeline steps for any incident.
  - Displays detection timestamp, Triage score, Kavach EBD parameters, dispatcher approval log, brake actuation verification, and final outcome (e.g., train stopped 30m prior to hazard).
  - Provides `[CLOSE INCIDENT & FILE COMPLIANCE REPORT]` button generating downloadable compliance documentation.
