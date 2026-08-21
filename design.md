# RailSuraksha AI — National Railway Safety & Incident Intelligence Platform
## Complete Architecture & High-Fidelity UI Specification Document
### (Synchronized with Official RailSuraksha AI Multi-Agent Workflow)

> **Product Vision:** A national-grade railway operations command center combined with an AI safety multi-agent ecosystem.
> **Design Philosophy:** Mintlify spatial layout discipline (1440px grid, strict component geometry: 4px button/input radius, 16px card radius, 24px container radius, 0.03-opacity whisper elevation). **Pristine Light-Blue Command Center Aesthetic** using **`light-blue-canvas` (`#F0F6FC`)** as the background base, **`card-white` (`#FFFFFF`)** for panel surfaces, **`signal-blue` (`#2B7FFF`)** for active accents/CTAs, and **`ink-slate` (`#0F172A`)** for crisp readable typography.

---

# 1. OFFICIAL WORKFLOW & MULTI-AGENT ARCHITECTURE

The UI directly operationalizes the official **RailSuraksha AI Multi-Agent Safety Workflow**:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         OFFICIAL MULTI-AGENT WORKFLOW                                            │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                               ┌──────────────────────────────────────────────┐
                               │ Edge Cameras (Loco / Station CCTV / OHE Cam) │
                               └──────────────────────┬───────────────────────┘
                                                      │ Anomaly Detected?
                                                      ▼
                               ┌──────────────────────────────────────────────┐
                               │ Triage Agent (Classifies & Scores Severity)  │
                               └──────────────────────┬───────────────────────┘
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
                 [ CRITICAL ]                   [ MODERATE ]                      [ LOW ]
         ┌──────────────────────────┐    ┌──────────────────────────┐   ┌──────────────────────────┐
         │ Kavach Braking Agent     │    │ Section Dispatch Agent   │   │ Risk Audit Agent         │
         │ (RDSO Physics EBD Calc)  │    │ (Reroutes & Clears Blks) │   │ (Logs & Crew Duty Check) │
         └─────────────┬────────────┘    └────────────┬─────────────┘   └────────────┬─────────────┘
                       │                              │                              │
                       ▼                              ▼                              ▼
         ┌──────────────────────────┐    ┌─────────────────────────────────────────────────────────┐
         │ Auto Brake Command       │───>│ Command Center Dashboard (Live Alert on Mission Control)│
         │ Sent to Loco Cab & Pilot │    └────────────────────────────┬────────────────────────────┘
         └──────────────────────────┘                                 │
                                                                      ▼
                                         ┌─────────────────────────────────────────────────────────┐
                                         │ Station Master / Dispatcher (Views Alert on Track GIS)  │
                                         └────────────────────────────┬────────────────────────────┘
                                                                      │
                                         ┌────────────────────────────┴────────────────────────────┐
                                         │ DEPLOYMENT MODE SWITCHER                                │
                                         ├────────────────────────────┬────────────────────────────┤
                                         │ Advisory Mode (Phase 1)    │ Autonomous Mode (Post-RDSO)│
                                         │ Dispatcher Reviews &       │ Action Auto-Executed       │
                                         │ Approves Action            │                            │
                                         └─────────────┬──────────────┴──────────────┬─────────────┘
                                                       │                             │
                                                       └──────────────┬──────────────┘
                                                                      ▼
                                                 ┌─────────────────────────────────────────┐
                                                 │ Action Confirmed & Execution Logged     │
                                                 └────────────────────┬────────────────────┘
                                                                      │
                                                                      ▼
                                                 ┌─────────────────────────────────────────┐
                                                 │ Explainable Decision Log Generated      │
                                                 └────────────────────┬────────────────────┘
                                                                      │
                                                                      ▼
                                                 ┌─────────────────────────────────────────┐
                                                 │ Auditor / Maintenance Engineer          │
                                                 │ (Reviews Logs for Compliance)           │
                                                 └────────────────────┬────────────────────┘
                                                                      │
                                                                      ▼
                                                 ┌─────────────────────────────────────────┐
                                                 │ Incident Closed & Report Filed          │
                                                 └─────────────────────────────────────────┘
```

---

# 2. FEATURE INCLUSION & EXCLUSION SPECIFICATION

To ensure absolute scope clarity for hackathons and production implementation, the UI enforces strict inclusion and exclusion boundaries:

### ✅ FEATURES TO INCLUDE (Mandatory Core Architecture)
1. **Multi-Camera Edge Stream Feed:** Feeds for Loco-Cab Forward Camera, Station Platform Gateway CCTV, and Overhead Equipment (OHE) Cameras.
2. **AI Triage Agent Severity Panel:** Real-time classification badge & severity score (`CRITICAL`, `MODERATE`, `LOW`).
3. **Specialized AI Agent Handlers:**
   - **Kavach Braking Agent (Critical):** RDSO EBD Physics calculation & Auto-Brake Command send status.
   - **Section Dispatch Agent (Moderate):** Block rerouting & 5-minute adjacent platform hold timer.
   - **Risk Audit Agent (Low):** Incident logging & loco crew duty hour compliance check.
4. **Live Command Center Mission Control & Track GIS Diagram:** Single detailed Railway Track Interlocking Diagram (signals `S-12`/`S-14`, circuits `BLK-101`, point switches `P-4A`).
5. **Deployment Mode Control Switcher:**
   - **Advisory Mode (Phase 1):** Dispatcher Review Gate with `[APPROVE ACTION]` and `[REJECT]` manual control buttons.
   - **Autonomous Mode (Post-RDSO Cert):** Auto-execution indicator badge (`⚡ ACTION AUTO-EXECUTED`).
6. **Explainable Decision Log & Auditor Workspace:** Step-by-step transparent AI reasoning timeline for Auditors & Maintenance Engineers with `[CLOSE INCIDENT & FILE COMPLIANCE REPORT]` action.

### ❌ FEATURES TO EXCLUDE (Explicitly Out of Scope)
1. ❌ **No Passenger Coach Interior Tracking:** No top-down coach seat diagrams, passenger identity tracking, or carriage interior camera feeds (Out of scope).
2. ❌ **No Unbounded LLM Hardware Actuation:** AI models recommend or pass parameters to deterministic physics functions; direct hardware actuation is bound by RDSO formulas.
3. ❌ **No Generic SaaS/E-commerce Widgets:** No financial SaaS KPI cards, revenue charts, user marketing funnel graphics, or pill-shaped buttons.

---

# 3. DESIGN SYSTEM & COLOR TOKENS (LIGHT-BLUE THEME)

| Token Name | Hex / Value | CSS Variable | Application & Purpose |
| :--- | :--- | :--- | :--- |
| **`light-blue-canvas`** | `#F0F6FC` | `--color-canvas-light-blue` | **Surface 0:** Atmospheric Light Ice-Blue background canvas behind all panels |
| **`card-white`** | `#FFFFFF` | `--color-card-white` | **Surface 1:** Pure white card & panel background layer sitting above canvas |
| **`surface-elevated`**| `#E6F0FA` | `--color-surface-elevated` | **Surface 2:** Soft light blue elevated inputs, active table headers, & tab fills |
| **`signal-blue`** | `#2B7FFF` | `--color-signal-blue` | **Primary Theme Accent:** Active navigation tabs, live timeline indicator, primary CTAs, telemetry highlights, active selection rings |
| **`twilight-blue`** | `#426188` | `--color-twilight-blue` | Atmospheric accent: Section headers, map rail lines, monospaced metadata borders |
| **`ink-slate`** | `#0F172A` | `--color-ink-slate` | Primary text on light surfaces, high-contrast crisp titles and headers |
| **`slate-body`** | `#475569` | `--color-slate-body` | Secondary body text, timestamps, labels, and table column headers |
| **`border-cool`** | `#D0DFEE` | `--color-border-cool` | Subtle 1px dividers & card borders (`border-[#D0DFEE]`) |
| **`status-green`** | `#059669` | `--color-status-green` | Safe operational state, Signal Green aspect, on-time train indicators |
| **`status-amber`** | `#D97706` | `--color-status-amber` | Warning state, Signal Yellow aspect, delayed train status, 5-min grace hold active |
| **`status-red`** | `#DC2626` | `--color-status-red` | Critical incident alert, Signal Red aspect, emergency braking applied, track obstruction |

---

# 4. GLOBAL PERSISTENT NAVIGATION BAR & DEPLOYMENT MODE SWITCHER

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [🚆 RailSuraksha AI] │ OVERVIEW (SIGNALING MAP) │ LOCO-CAB VIEW │ PLATFORM VIEW │ MODE: [ADVISORY (PHASE 1) ▾] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Navbar Layout & Controls:
1. **Brand Identity (Left):**
   - Title: **RailSuraksha AI** (`Inter 18px font-bold text-[#0F172A]`).
   - Badge: `PROD-v2.4` (`13px Inter font-medium bg-[#E6F0FA] text-[#426188] px-2 py-0.5 radius-4px border border-[#D0DFEE]`).
2. **3-Way View Switcher (Center):**
   - `1. OVERVIEW` | `2. LOCO-CAB VIEW` | `3. PLATFORM GATEWAY VIEW`
3. **Deployment Mode Switcher Dropdown (Right):**
   - **Advisory Mode (Phase 1):** Human Dispatcher must approve all AI recommendations (`bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]`).
   - **Autonomous Mode (Post-RDSO Cert):** Direct automatic execution (`bg-[#ECFDF5] text-[#065F46] border-[#6EE7B7]`).
4. **Telemetry Indicators:** Live IST Clock (`08:45:12 IST`), `AI ONLINE 99.8%`, Operator ID (`OP-402 / Controller`).

---

# 5. PAGE 1 — OVERVIEW ("Railway Signaling & Interlocking Overview")

**Goal:** High-level tactical view displaying a single, detailed **Railway Track Interlocking Diagram Map**, active incident queue, and AI Triage Agent output.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ RAILWAY SIGNALING & INTERLOCKING OVERVIEW — Real-time track block & signal status                               │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP: [ACTIVE TRAINS: 1,284]  [TRACK CIRCUITS: 4,820]  [SIGNALS: 1,240]  [INCIDENTS: 02]  [HOLDS ACTIVE: 01]   │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│ 🚦 RAILWAY SIGNALING & TRACK INTERLOCKING DIAGRAM (Centerpiece) │ 🤖 AI TRIAGE AGENT & INCIDENT QUEUE           │
│ ┌──────────────────────────────────────────────────────────────┐ │ ┌───────────────────────────────────────────┐ │
│ │  Track 1A: [BLK-101] ══(🔴 S-12)══ [Train 12345] ══(🟢 S-14) │ │ │ INCIDENT #RS-2048                           │ │
│ │               ║ Point Switch P-4A [LOCKED]                   │ │ │ Triage Score: SEVERITY CRITICAL (98.2%)   │ │
│ │  Track 1B: [BLK-102] ══(🟡 S-16)═════════════════════════════ │ │ │ Handler: Kavach Braking Agent             │ │
│ │                                                              │ │ │ Mode: Advisory Mode (Requires Approval)   │ │
│ │ Signal Aspects: 🟢 Clear  🟡 Caution  🔴 Stop  🔵 Hold Active│ │ │ [APPROVE BRAKING ACTION]  [REJECT]        │ │
│ └──────────────────────────────────────────────────────────────┘ │ └───────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┴───────────────────────────────────────────────┘
```

---

# 6. PAGE 2 — LOCO-CAB FORWARD VIEW ("Loco Camera & Emergency Braking Engine")

**Goal:** Loco-cab camera feed with YOLOv11 hazard detection, paired with the **Interactive 4-Agent Pipeline Canvas Visualizer** for Kavach auto-braking calculations.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ LOCO-CAB FORWARD VISION & EMERGENCY BRAKING ENGINE                                                              │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│ 🎥 LOCO-CAB FORWARD CAMERA FEED (Front View Down Rail Tracks)     │ ⚡ INTERACTIVE 4-AGENT PIPELINE CANVAS CANVAS │
│ ┌──────────────────────────────────────────────────────────────┐ │ ┌───────────────────────────────────────────┐ │
│ │  [ YOLOV11 DETECTED: BOULDER ON TRACK ]                      │ │ │  [AG1: VISION] ──> [AG2: TELEMETRY]       │ │
│ │  Confidence: 98.2% | Distance: 340m                          │ │ │         │                     │             │ │
│ │  Camera: LOCO-CAB-FRONT-VANDB-204                            │ │ │  [AG3: PHYSICS] ──> [AG4: ACTUATION]      │ │
│ └──────────────────────────────────────────────────────────────┘ │ │ Calculated D_stop: 410m | Obstacle: 340m  │ │
│                                                                  │ ├───────────────────────────────────────────┤ │
│ 🚨 BRAKE STATUS: EMERGENCY AUTOMATIC BRAKE ACTUATED              │ │ 🔘 [APPLY BRAKING FORMULA] (Run Canvas)   │ │
└──────────────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```

#### Workflow Pipeline Alignment:
- **Agent 1 (Vision Hazard Detector):** Parses YOLOv11 bounding box (`Boulder on Track`, `340m`).
- **Agent 2 (Telemetry Aggregator):** Queries velocity $V=110\text{ km/h}$, mass $M=1400\text{t}$, friction $\mu=0.35$.
- **Agent 3 (Kavach Braking Agent):** Calculates RDSO safe stopping distance $D_{\text{stop}} = 410\text{m}$.
- **Agent 4 (Auto-Brake Actuator):** Dispatches auto-brake command to loco cab.

---

# 7. PAGE 3 — PLATFORM GATEWAY VIEW ("Platform Entrance CCTV & Section Dispatch Engine")

**Goal:** Monitor the **single Platform Gateway CCTV Camera** (Pillar #1) and execute the **Section Dispatch Agent** rerouting/hold timer logic to prevent stampedes.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PLATFORM GATEWAY CCTV & SECTION DISPATCH ENGINE                                                                 │
├──────────────────────────────────────────────────────────────────┬───────────────────────────────────────────────┤
│ 🎥 PLATFORM GATEWAY CCTV FEED (Pillar #1 Entrance Camera)        │ ⏱️ ADJACENT PLATFORM HOLD & CLEARANCE TIMER  │
│ ┌──────────────────────────────────────────────────────────────┐ │ ┌───────────────────────────────────────────┐ │
│ │  [ YOLOV11 + OPTICAL FLOW GATEWAY CROWD COUNT: 482 ]        │ │ │ ⏳ REMAINING HOLD TIMER: 04:12            │ │
│ │  Gateway Occupancy Index (ρ): 88% (STAMPEDE RISK)            │ │ │ Platform Held: PLATFORM 18                │ │
│ └──────────────────────────────────────────────────────────────┘ │ │ Handler: Section Dispatch Agent           │ │
│                                                                  │ ├───────────────────────────────────────────┤ │
│ 📊 GATEWAY CROWD FLOW METRICS                                    │ │ 🎛️ CONTROLLER OVERRIDE CONTROLS           │ │
│ Deboarding Rate: 45 p/min | Staircase Bottleneck: ACTIVE         │ │ [RELEASE HOLD NOW]  [EXTEND HOLD +3M]     │ │
└──────────────────────────────────────────────────────────────────┴───────────────────────────────────────────┘
```

---

# 8. AUDITOR WORKSPACE — EXPLAINABLE DECISION LOG & COMPLIANCE REPORTING

Every incident resolution generates an immutable explainable log for Auditors and Maintenance Engineers.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📑 EXPLAINABLE DECISION LOG & AUDIT WORKSPACE                                                                    │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ INCIDENT #RS-2048 | Track Section 14B | Train 12345 | Status: ACTION CONFIRMED                                  │
│                                                                                                                  │
│ 1. 🔍 Anomaly Detection: Loco-Cab Camera #204 flagged obstacle at 08:42:11 IST.                                  │
│ 2. 🤖 Triage Agent: Scored Severity as CRITICAL (Confidence 98.2%).                                              │
│ 3. 🛡️ Kavach Braking Agent: Calculated D_stop = 410m (Obstacle at 340m). EBD Formula Executed.                   │
│ 4. 👤 Dispatcher Review: Action approved by Controller OP-402 at 08:42:15 IST (Advisory Mode).                  │
│ 5. 🛑 Execution Result: Auto-Brake Engaged. Train stopped 30m prior to hazard. Zero casualties.                  │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ AUDITOR ACTIONS: [REVIEW COMPLIANCE LOGS]   [CLOSE INCIDENT & FILE REPORT]                                       │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

# 9. COMPLETE FRONTEND IMPLEMENTATION FILE MAP

```text
src/
├── app/
│   ├── layout.tsx                # Root Layout (Inter font, #F0F6FC background)
│   ├── page.tsx                  # Dashboard Router (Overview / Loco-Cab / Platform Gateway / Audit views)
│   └── globals.css               # Light-Blue theme spatial CSS tokens & Tailwind v4
├── components/
│   ├── Navbar.tsx                # Navigation Bar + Deployment Mode Switcher (Advisory vs Autonomous)
│   ├── Overview/
│   │   ├── KpiStrip.tsx          # 6 Operational KPI metrics cards (#FFFFFF background)
│   │   ├── InterlockingMap.tsx   # Single detailed Railway Track Interlocking Diagram
│   │   ├── TriagePanel.tsx       # Triage Agent severity classifier & incident queue
│   │   └── AiIntelligence.tsx    # AI safety model detection metrics
│   ├── LocoCab/
│   │   ├── LocoCameraFeed.tsx    # Front-facing locomotive camera feed with YOLOv11 bounding boxes
│   │   └── AgentPipelineCanvas.tsx # Interactive 4-Agent Pipeline Canvas Animation Visualizer
│   ├── PlatformGateway/
│   │   ├── GatewayCctvFeed.tsx   # Single Platform Gateway CCTV feed (Pillar #1 Entrance View)
│   │   ├── HoldCountdown.tsx     # 5-Min Hold + Dynamic ML Extension timer countdown ring
│   │   └── StationController.tsx # Station master override controls & platform schedule matrix
│   └── Audit/
│       └── DecisionLogModal.tsx  # Explainable Decision Log viewer & incident closure report
└── lib/
    ├── triageAgent.ts            # Triage Agent classification & scoring logic
    ├── kavachBrakingAgent.ts     # Kavach Braking Agent EBD physics calculation
    ├── sectionDispatchAgent.ts   # Section Dispatch Agent rerouting & platform hold logic
    ├── riskAuditAgent.ts         # Risk Audit Agent crew duty check & incident logging
    └── mockData.ts               # Track interlocking data, signals, and camera streams
```

---

# 10. MASTER PROMPT FOR GEMINI 3.1 FLASH CREATE MODE / ANTIGRAVITY

Copy and paste this exact prompt directly into **Gemini 3.1 Flash Create Mode** (or Antigravity / Next.js app builders) to implement the web application aligned with your official workflow:

```text
Build a high-fidelity Next.js 16 web application UI for "RailSuraksha AI" based on the official multi-agent safety workflow.

DESIGN SYSTEM & LIGHT-BLUE THEME:
- Canvas Base Surface 0: #F0F6FC (light ice-blue background canvas)
- Panel/Card Surface 1: #FFFFFF (pure white card background with 1px border #D0DFEE)
- Surface 2 Elevated Tabs/Inputs: #E6F0FA (soft light blue tab fills & inputs)
- Primary Accent: #2B7FFF (signal-blue) for active nav tabs, primary CTAs, telemetry highlights, active rings
- Atmospheric Accent: #426188 (twilight-blue) for section headers and railway track lines
- Text Primary: #0F172A (ink-slate) for high-contrast readable titles and body text
- Component Geometry: Mintlify spatial discipline — 4px radius for buttons/inputs/tags, 16px radius for cards, 24px for containers (ZERO pill buttons)
- Typography: Inter universal font family with JetBrains Mono for monospaced train numbers, signal IDs (S-12), timestamps, speeds, and distances.

WORKFLOW & CORE OPERATIONAL VIEWS:
1. GLOBAL NAVBAR & DEPLOYMENT MODE SWITCHER:
   - Persistent top bar with 3 view links + Deployment Mode Switcher dropdown: "Advisory Mode (Phase 1)" [Requires Dispatcher Approval] vs "Autonomous Mode (Post-RDSO Cert)" [Auto-Executed].

2. VIEW 1 — OVERVIEW (Signaling Map & Triage Agent):
   - Top 6 KPI strip (#FFFFFF cards).
   - Single, detailed Railway Track Interlocking Diagram (track circuits BLK-101, signals S-12/S-14 with Red/Yellow/Green aspects, point switches).
   - AI Triage Agent Incident Queue panel showing severity scores (CRITICAL / MODERATE / LOW) and Dispatcher approval buttons.

3. VIEW 2 — LOCO-CAB VIEW (Kavach Braking Agent):
   - Front-facing locomotive camera feed with YOLOv11 bounding boxes for track hazards (boulders, surface cracks).
   - Interactive 4-Agent Pipeline Canvas Animation triggered by clicking [APPLY BRAKING FORMULA] spawning 4 subagents sequentially (Vision -> Telemetry -> Kavach Physics Engine D_stop=410m -> Auto-Brake Actuator).

4. VIEW 3 — PLATFORM GATEWAY VIEW (Section Dispatch Agent):
   - Platform Gateway CCTV feed (Camera on Pillar #1 at platform entrance) with YOLOv11 crowd count & Optical Flow velocity.
   - 5-Minute Deterministic Hold + Dynamic ML Clearance Extension countdown timer (04:12 remaining) with Station Master manual override controls.

5. AUDITOR WORKSPACE — EXPLAINABLE DECISION LOG & REPORTING:
   - Incident summary modal/drawer displaying the step-by-step explainable AI decision log (Triage -> Kavach Braking -> Dispatcher Review -> Execution Handoff -> Outcome) with [CLOSE INCIDENT & FILE REPORT] button.

EXCLUSIONS: Do NOT build any coach interior seat plans or individual passenger tracking. Keep design crisp, operational, and focused on multi-agent railway safety.
```
