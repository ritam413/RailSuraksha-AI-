# RailSuraksha AI — Product Requirements Document (PRD)

**Project Name:** RailSuraksha AI (रेल-सुरक्षा)  
**Document Version:** 1.0.0  
**Target Platform:** National Railway Safety & Incident Intelligence Platform  
**Target Framework:** Next.js 16, React 19, Tailwind CSS v4, HTML5 Canvas / SVG  

---

## 1. Executive Summary & Problem Statement

### Problem Statement
Indian Railways handles over 23 million passengers daily across 68,000 km of track. Despite modern signaling systems, operations face critical safety challenges:
1. **Adjacent-Platform Overcrowding & Stampedes:** High-density junction stations experience dangerous bottlenecks when trains arrive simultaneously at adjacent platforms sharing a foot-over-bridge (FOB) or staircase.
2. **Continuous Visual Track Hazards:** Track flaws, rail fractures, boulders, and cattle incursions occur unpredictably between periodic Ultrasonic Flaw Detection (USFD) testing cycles.
3. **Emergency Braking Calculation Gaps:** Standard manual reaction time and generic braking estimates fail to account for real-time physics (speed, tonnage, track gradient, friction), leading to overshoot risks.
4. **Black-Box AI Compliance Issues:** Railway safety regulators (RDSO / Railway Board) require strict explainable decision traces for every automated intervention.

### Solution Vision
**RailSuraksha AI** is a national-grade railway operations command center paired with an AI safety multi-agent ecosystem. It integrates real-time edge computer vision (loco-cab cameras, station CCTV), an AI Triage classifier, RDSO certified physics braking calculations (Kavach EBD), deterministic platform hold timers, and transparent auditor compliance logging.

---

## 2. User Personas & Roles

| Persona | Role & Platform Access | Key Needs & Behaviors |
| :--- | :--- | :--- |
| **Chief Controller / Dispatcher** | Command Center Dashboard (Overview & Platform View) | High-level situational awareness across track circuits and signals. Operates in **Advisory Mode (Phase 1)** to review and approve AI recommendations (`[APPROVE ACTION]`). |
| **Locomotive Pilot (Loco Cab)** | Loco-Cab Forward Vision View | Real-time hazard notifications, obstacle distance telemetry, and automated Kavach braking status alerts during emergency stopping scenarios. |
| **Station Master** | Platform Gateway Control View | Manages platform crowd flow, monitors 5-minute hold countdown timers, and executes manual release/extension overrides (`[RELEASE HOLD NOW]`). |
| **Safety Auditor / Compliance Engineer** | Auditor Workspace & Decision Logs | Inspects immutable step-by-step AI decision logs (Triage $\to$ Telemetry $\to$ EBD $\to$ Execution) and files compliance reports (`[CLOSE INCIDENT & FILE REPORT]`). |

---

## 3. Core Functional Requirements

### 3.1 Global Persistent Header & Deployment Switcher
- **Navbar Layout:** Fixed top header with brand title (`RailSuraksha AI PROD-v2.4`), view switcher links, live IST clock, AI status indicator (`99.8% ONLINE`), and Operator ID.
- **Deployment Mode Switcher:**
  - `Advisory Mode (Phase 1)` (Default): All AI actions require manual dispatcher approval (`[APPROVE ACTION]`).
  - `Autonomous Mode (Post-RDSO Cert)`: Direct automated execution with instant log dispatch.

### 3.2 View 1 — Railway Signaling & Interlocking Overview
- **KPI Strip:** 6 operational cards displaying Active Trains (`1,284`), Track Circuits (`4,820`), Signals (`1,240`), Incidents (`02`), and Active Holds (`01`).
- **Interlocking Diagram Map:** Canvas/SVG visualization of track circuits (`BLK-101`, `BLK-102`), signals (`S-12`, `S-14`, `S-16` with Red/Yellow/Green aspects), and point switches (`P-4A`).
- **AI Triage Agent Queue:** Priority incident list displaying severity score (`CRITICAL`, `MODERATE`, `LOW`), confidence %, handling agent, and approval controls.

### 3.3 View 2 — Loco-Cab Forward Vision & Kavach Braking Engine
- **Loco Camera Feed:** Live forward-facing camera video with YOLOv11 bounding box annotations (e.g., `Boulder on Track`, confidence `98.2%`, distance `340m`).
- **Interactive 4-Agent Pipeline Canvas:** Animated 4-stage pipeline triggered by clicking `[APPLY BRAKING FORMULA]`:
  1. *Vision Hazard Detector:* Identifies obstacle distance $D_{\text{obstacle}} = 340\text{m}$.
  2. *Telemetry Aggregator:* Queries train speed $V = 110\text{ km/h}$, mass $M = 1400\text{t}$, friction $\mu = 0.35$.
  3. *Kavach Braking Agent:* Evaluates RDSO stopping distance formula $D_{\text{stop}} = 410\text{m}$.
  4. *Auto-Brake Actuator:* Transmits solenoid braking command and updates cab state.

### 3.4 View 3 — Platform Gateway CCTV & Section Dispatch Engine
- **Platform Entrance CCTV:** Video stream from Pillar #1 entrance camera displaying YOLOv11 crowd count and Optical Flow density ($\rho = 88\%$).
- **5-Minute Deterministic Hold Timer:** Interactive countdown ring (`04:12` remaining) holding adjacent platform arrival to clear staircase bottlenecks. Dynamic ML extension adds +3 minutes if density remains high.
- **Station Controller Overrides:** Action buttons for `[RELEASE HOLD NOW]` and `[EXTEND HOLD +3M]`.

### 3.5 Auditor Workspace & Explainable Decision Logs
- **Decision Log Drawer/Modal:** Step-by-step chronological audit trail detailing detection time, Triage score, Kavach EBD formula inputs, dispatcher approval timestamp, and stopping outcome.
- **Report Generation:** `[CLOSE INCIDENT & FILE COMPLIANCE REPORT]` button generating downloadable compliance documentation.

---

## 4. MoSCoW Prioritization Matrix

### ✅ Must Have (Hackathon Scope)
- 3 Core Operational Views (Overview Signaling Map, Loco Cab, Platform Gateway).
- Global Navbar with Advisory Mode vs Autonomous Mode toggle.
- 4-Agent Pipeline Canvas animation for Kavach emergency braking calculation.
- Single detailed Railway Track Interlocking Diagram with signal aspect toggles.
- 5-Minute Deterministic Hold countdown timer with Station Master override buttons.
- Explainable AI decision log modal.

### 🟡 Should Have
- Real-time WebSocket telemetry push for track circuit updates.
- Simulated audio warning pulse on Critical Triage alert.
- Multi-camera feed selector (Loco front, Station Gateway, OHE Pantograph camera).

### 🔵 Could Have
- Historical incident playback replay controls.
- Synthetic noise slider for camera video quality degradation testing.

### ❌ Won't Have (Explicitly Out of Scope)
- ❌ No passenger coach interior seat diagrams or individual passenger identity tracking.
- ❌ No unbounded LLM hardware actuation (all commands bound by RDSO physics formulas).
- ❌ No generic SaaS financial/marketing KPI widgets.

---

## 5. Non-Functional Requirements & Design System

### Mintlify Spatial Layout Discipline & Light-Blue Theme
- **Base Canvas (Surface 0):** `#F0F6FC` (Ice Blue Canvas)
- **Panel/Card Surface (Surface 1):** `#FFFFFF` with `#D0DFEE` 1px border
- **Elevated Controls (Surface 2):** `#E6F0FA`
- **Primary Accent:** `#2B7FFF` (Signal Blue)
- **Primary Text:** `#0F172A` (Ink Slate)
- **Component Geometry:** 4px radius for buttons/inputs/tags, 16px radius for cards, 24px radius for containers. **STRICTLY ZERO PILL BUTTONS.**
- **Typography:** `Inter` for general interface text; `JetBrains Mono` for monospaced train numbers (`12345`), signal IDs (`S-12`), speed (`110 km/h`), and stopping distance (`410m`).

---

## 6. Success Metrics & Performance Criteria

- **Telemetry Latency:** Telemetry payload updates delivered to UI in $<100\text{ms}$.
- **Decision Transparency:** 100% of auto-braking and hold actions accompanied by an immutable 4-step decision log.
- **Safety Compliance:** Zero signal overruns (SPAD) in simulated track interlocking scenarios.
