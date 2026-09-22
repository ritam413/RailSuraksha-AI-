# IRIS AI — MoSCoW Feature Matrix & Requirements Prioritization

**System Name:** IRIS AI (Intelligent Railway Inspection and Restoration AI): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.1.0 (Grounded Multi-Horizon & Decoupled Architecture Specification)  
**Governing Standards Reference:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0, and Google OR-Tools CP-SAT.

---

## 📊 1. Executive MoSCoW Prioritization Summary

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MOSCOW FEATURE MATRIX                                  │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 🟢 MUST HAVE (P0)          │ 🔵 SHOULD HAVE (P1)        │ 🟡 COULD HAVE (P2)           │
│ Core Operational Baseline  │ Advanced Capabilities      │ Predictive & Extended        │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • Grounded Multi-Horizon   │ • Interactive String Chart │ • Weather Disruption Sim     │
│ • CP-SAT Shadow Solver     │ • Machine Routing Solver   │ • Gang Duty Hours Tracker    │
│ • Pluggable CRIS Adapters  │ • WebSocket Live Sync Hub  │ • Depot Fleet Balancing      │
│ • Policy & Rules Engine    │ • Downloadable Form 14B    │ • Micro-Topological Gradients│
│ • String Chart Visualizer  │ • Form T/409 Export        │                              │
│ • Department Demand Queue  │ • Audio Chime Synthesizer  │                              │
│ • One-Click Sanction Gate  │ • Dynamic Policy UI Tuner  │ 🔴 WON'T HAVE (OUT OF SCOPE) │
│ • Kavach TSR Wireless Push │                            │ • Passenger Ticket Booking   │
│ • Form S&T/T-351 Lockout   │                            │ • Unbounded Manual Memos     │
│ • SHA-256 Decision Dossier │                            │ • Hardcoded Business Rules   │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

---

## 🟢 2. MUST HAVE (P0 — Mandatory for Prototype & Pilot Deployment)

These features represent the non-negotiable core required to solve SIH 26027 and demonstrate full operational compliance:

### 2.1 Multi-Horizon Rolling Framework Switcher `[Grounded Core Paradigm]`
* **24-Hour Tactical Horizon:** Real-time conflict resolution, nocturnal white corridor allocation ($01:30\text{--}04:30\text{ AM}$), and emergency P1 defect patching.
* **7-Day Operational Horizon:** Weekly rolling corridor maintenance bundling multi-department blocks and coordinating machine gangs.
* **30-Day Strategic Horizon:** Long-term Track Geometry Index (TGI) corridor recovery planning and machine fleet overhaul routing.

### 2.2 Pluggable Multi-Source Ingestion & Spatial Adapters `[Decoupled Layer]`
* **Abstract Ingestion Port (`IIngestionAdapter`):** Swappable implementations for Simulation Mock Feeds, Configurable CSV/JSON parsers, and live CRIS enterprise APIs.
* **TMS Ingestion Adapter (IRPWM 2020 Reference):** Ingests rail flaw alerts (USFD classifications IMR/OBS/REM), TRC runs, and TGI scores.
* **TDMS Ingestion Adapter (ACTM Vol II Reference):** Ingests 25kV OHE catenary/contact wire wear logs and neutral section overhaul requisitions.
* **SMMS Ingestion Adapter (IRSEM 2021 Reference):** Ingests point machine stroke/current logs and statutory Form S&T/T-351 Disconnection Notices.
* **COA Timetable Ingestion Adapter:** Ingests Working Time Tables (WTT), live train tracking, running delays, and freight rake path forecasts.
* **Configurable Spatial Chainage Normalizer:** Decoupled lookup service converting linear railway kilometer markers (e.g. `KM 108/4 - 114/2`) into discrete logical track circuit IDs (`TC-01..06`).

### 2.3 Configurable Priority Scoring & Rules Engine `[Pluggable Layer]`
* **Dynamic Urgency Scoring:** Configurable weighting formula ($S_i = w_s \cdot \text{SafetyRisk} + w_d \cdot \text{DaysOverdue} + w_c \cdot \text{TrafficDensity}$) with parameters loaded from `DivisionalPolicyProfile`.
* **Standardized Operational Tiers:**
  * **P1 Critical (Provisional Default: Score 0.80–1.00):** Immediate safety flaws slated into immediate 24h night lulls.
  * **P2 Scheduled (Provisional Default: Score 0.50–0.79):** Periodic maintenance bundled into 7-day rolling corridor.
  * **P3 Routine (Provisional Default: Score 0.00–0.49):** Preventive tasks bundled into 30-day cyclical maintenance.

### 2.4 Google OR-Tools CP-SAT Joint Shadow-Block Optimizer Core `[Grounded Core]`
* **Disjunctive Interval Scheduling:** Uses `NewIntervalVar`, `AddNoOverlap`, and `AddCumulative` constraints.
* **Objective Formulation:** Minimizes total corridor downtime and secondary train delays while maximizing multi-department co-location savings.
* **Operational Invariants (Policy-Configured):**
  * Enforces **Zero Passenger Cancellations** and configurable safety clearance headway ($\Delta_{\text{clear}}$, default reference $\ge 15\text{ min}$).
  * Enforces **Co-Location Shadow Blocking** where Civil and S&T work underneath de-energized OHE windows with configurable earthing buffers ($\Delta_{\text{earth}}, \Delta_{\text{restore}}$, default reference $\ge 10\text{ min}$).

### 2.5 Modern Dispatcher Cockpit UI `[Extensible Design System]`
* **Corridor Time-Distance String Chart (`CorridorStringChart.tsx`):** High-performance SVG time-space graph with slanted train paths and shaded joint maintenance blocks.
* **Department Demand Queue (`IncidentQueue.tsx`):** Filterable list of pending work orders across TMS, TDMS, and SMMS with urgency badges and one-click `[SANCTION BLOCK]` action.
* **6-Card KPI Strip (`KpiStrip.tsx`):** Real-time display of Corridor Downtime Saved, Track Availability, Active Blocks, Pending Demands, White Corridor Headway Gap, and Active Kavach TSRs.
* **Section Interlocking Map (`InterlockingMap.tsx`):** Real-time visual tracking of track circuits (`TC-01..06`), signal aspects (`S-12..16`), and temporary speed restrictions.

### 2.6 Decoupled Safety Dispatch & Compliance Gate `[Pluggable Actuation]`
* **Kavach TCAS Wireless TSR Adapter:** Emits speed caps ($30\text{ km/h}$) to locomotive cab units per *RDSO/SPN/196/2020*.
* **Electronic Interlocking Lockout Adapter:** Clamps conflicting signal aspects to danger (`RED`) in relay logic upon block sanction.
* **Digital Caution Order Adapter (Form T/409):** Automated emission of digital caution notices for train crew.
* **Explainable AI Decision Dossier (`DecisionLogModal.tsx`):** 4-step chronological audit timeline signed with immutable **SHA-256** cryptographic hash complying with RDSO Form 14B.

---

## 🔵 3. SHOULD HAVE (P1 — High Value Operational Enhancements)

* **Interactive String-Chart Controls:** Pan, zoom, and time-scrubbing on the SVG corridor time-distance chart.
* **Dynamic Policy & Rule Tuner:** Operator surface allowing division controllers to calibrate safety headways, earthing buffers, and penalty weights at runtime without code changes.
* **Heavy Track Machine Roster & Routing Solver:** Transit velocity modeling for Continuous Action Tampers (CSM) and Tower Wagons between stations.
* **Real-Time WebSocket Sync Hub:** Live bi-directional streaming of train position updates, block sanction states, and circuit occupancies.
* **Downloadable RDSO Form 14B Safety Certificate:** One-click generation and PDF/JSON export of official safety compliance documents.
* **RDSO Locomotive Cab Audio Synthesizer:** Pure Web Audio API synthesizing authentic 800Hz and 1200Hz cab warning tones on hazard detection.

---

## 🟡 4. COULD HAVE (P2 — Extended & Predictive Features)

* **What-If Disruption & Weather Simulator:** Dynamic scenario modeling for monsoon rain, winter fog, and upstream freight diversions.
* **Maintenance Gang Duty Hours & Rest Tracker:** Fatigue monitoring ensuring field gangs comply with railway statutory rest rules.
* **Inter-Divisional Machine Depot Balancing:** Automated scheduling of machine handovers across adjacent railway divisions.
* **Micro-Topological Track Gradient Modeling:** Dynamic Emergency Braking Distance adjustment factoring in track gradients ($G_s$).

---

## 🔴 5. WON'T HAVE (Out of Scope for System Core)

* ❌ **Passenger Ticket Booking & Commercial PNR Management:** IRIS AI is strictly an infrastructure asset optimization and railway operations platform.
* ❌ **Coach Interior & Onboard Passenger Amenities Monitoring:** Excluded from scope.
* ❌ **Unbounded Free-Text Manual Block Memos:** All maintenance requisitions must be digitally structured, normalized, and constraint-checked.
* ❌ **Hardcoded Business Logic & Tightly Coupled Schemas:** System must avoid rigid coupling to unverified third-party assumptions.
