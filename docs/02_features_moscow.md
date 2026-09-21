# RailSuraksha AI — MoSCoW Feature Matrix & Requirements Prioritization

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Governing Standards:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0, and Google OR-Tools CP-SAT.

---

## 📊 1. Executive MoSCoW Prioritization Summary

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MOSCOW FEATURE MATRIX                                  │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 🟢 MUST HAVE (P0)          │ 🔵 SHOULD HAVE (P1)        │ 🟡 COULD HAVE (P2)           │
│ Core Operational Baseline  │ Advanced Capabilities      │ Predictive & Extended        │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • Multi-CRIS Normalizer    │ • Interactive String Chart │ • Weather Disruption Sim     │
│ • CP-SAT Shadow Solver     │ • Machine Routing Solver   │ • Gang Duty Hours Tracker    │
│ • String Chart Visualizer  │ • WebSocket Live Sync      │ • Depot Fleet Balancing      │
│ • Department Demand Queue  │ • Downloadable Form 14B    │ • Micro-Topological Gradients│
│ • Multi-Horizon Switcher   │ • Form T/409 Export        │                              │
│ • One-Click Sanction Gate  │ • Audio Chime Synthesizer  │                              │
│ • Kavach TSR Wireless Push │                            │ 🔴 WON'T HAVE (OUT OF SCOPE) │
│ • Form S&T/T-351 Lockout   │                            │ • Passenger Ticket Booking   │
│ • SHA-256 Decision Dossier │                            │ • Unbounded Manual Memos     │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

---

## 🟢 2. MUST HAVE (P0 — Mandatory for Prototype & Pilot Deployment)

These features represent the non-negotiable core required to solve SIH 26027 and demonstrate full operational compliance:

### 2.1 Multi-Source CRIS Ingestion & Spatial Chainage Adapter
* **TMS Ingestion (IRPWM 2020):** Ingestion of rail flaw alerts, ultrasonic flaw detection (**USFD**) classifications (**IMR** Immediate Removal, **OBS** Observed, **REM** Removable), Track Recording Car (**TRC**) runs, and **Track Geometry Index (TGI)** scores.
* **TDMS Ingestion (ACTM Vol II):** Ingestion of 25kV OHE catenary/contact wire residual area wear logs ($< 74\text{ mm}^2$), isolator testing, and neutral section overhaul requisitions.
* **SMMS Ingestion (IRSEM 2021):** Ingestion of point machine operating stroke times ($> 4.5\text{s}$) & operating currents ($> 2.5\text{A}$), track circuit relay health, and statutory **Form S&T/T-351** Disconnection Notices.
* **COA Timetable Ingestion:** Ingestion of Working Time Tables (WTT), live train tracking, running delays, and freight rake path forecasts.
* **Spatial Chainage Normalizer:** Converts linear railway kilometer markers (e.g. `KM 108/4 - 114/2`) into discrete logical track circuit IDs (`TC-01` through `TC-06`).

### 2.2 ML Urgency Triage & Priority Scoring Engine
* Computes dynamic urgency score $S_i \in [0.0, 1.0]$:
  $$\text{Urgency Score} = 0.40 \cdot \text{SafetyRisk} + 0.35 \cdot \text{DaysOverdue} + 0.25 \cdot \text{CorridorTrafficDensity}$$
* Categorizes demands into three standardized operational tiers:
  * **P1 Critical (Score 0.80–1.00):** Immediate safety flaws (rail fractures, broken OHE wires, track circuit drops) slated into immediate 24h night lulls.
  * **P2 Scheduled (Score 0.50–0.79):** Periodic maintenance (track tamping, point motor overhaul) bundled into 7-day rolling corridor.
  * **P3 Routine (Score 0.00–0.49):** Preventive tasks (insulator washing, cess cleaning) bundled into 30-day cyclical maintenance.

### 2.3 Google OR-Tools CP-SAT Joint Shadow-Block Optimizer Core
* **Disjunctive Interval Scheduling:** Uses `NewIntervalVar`, `AddNoOverlap`, and `AddCumulative` constraints.
* **Objective Formulation:** Minimizes total corridor downtime and secondary train delays while maximizing multi-department co-location savings.
* **Operational Invariants:**
  * Enforces **Zero Passenger Cancellations** and minimum safety clearance headway ($\Delta_{\text{clear}} \ge 15\text{ min}$).
  * Enforces **Co-Location Shadow Blocking** where Civil and S&T work underneath de-energized OHE windows with $\ge 10\text{ min}$ earthing buffers ($\Delta_{\text{earth}}, \Delta_{\text{restore}}$).

### 2.4 Multi-Horizon Rolling Framework Switcher
* **24-Hour Tactical Horizon:** Real-time conflict resolution, nocturnal white corridor allocation ($01:30\text{--}04:30\text{ AM}$), and emergency P1 defect patching.
* **7-Day Operational Horizon:** Weekly rolling corridor maintenance bundling multi-department blocks and coordinating machine gangs.
* **30-Day Strategic Horizon:** Long-term Track Geometry Index (TGI) corridor recovery planning and machine fleet overhaul routing.

### 2.5 Modern Dispatcher Cockpit UI
* **Corridor Time-Distance String Chart (`CorridorStringChart.tsx`):** High-performance SVG time-space graph with slanted train paths and shaded joint maintenance blocks.
* **Department Demand Queue (`IncidentQueue.tsx`):** Filterable list of pending work orders across TMS, TDMS, and SMMS with urgency badges and one-click `[SANCTION BLOCK]` action.
* **6-Card KPI Strip (`KpiStrip.tsx`):** Real-time display of Corridor Downtime Saved (38.4%), Track Availability (96.2%), Active Blocks, Pending Demands, White Corridor Headway Gap, and Active Kavach TSRs.
* **Section Interlocking Map (`InterlockingMap.tsx`):** Real-time visual tracking of track circuits (`TC-01..06`), signal aspects (`S-12..16`), and temporary speed restrictions.

### 2.6 Safety Dispatch & Regulatory Compliance Gate
* **Kavach TCAS Wireless TSR Broadcast:** Direct injection of $30\text{ km/h}$ speed caps to locomotive cab units per *RDSO/SPN/196/2020*.
* **Electronic Interlocking Lockout (Form S&T/T-351):** Clamps conflicting signal aspects to danger (`RED`) in relay logic upon block sanction.
* **Digital Caution Orders (Form T/409):** Automated emission of digital caution notices for train crew.
* **Explainable AI Decision Dossier (`DecisionLogModal.tsx`):** 4-step chronological audit timeline signed with immutable **SHA-256** cryptographic hash complying with RDSO Form 14B.

---

## 🔵 3. SHOULD HAVE (P1 — High Value Operational Enhancements)

* **Interactive String-Chart Controls:** Pan, zoom, and time-scrubbing on the SVG corridor time-distance chart.
* **Heavy Track Machine Roster & Routing Solver:** Transit velocity modeling for Continuous Action Tampers (CSM) and Tower Wagons between stations.
* **Real-Time WebSocket Sync Hub:** Live bi-directional streaming of train position updates, block sanction states, and circuit occupancies.
* **Downloadable RDSO Form 14B Safety Certificate:** One-click generation and PDF/JSON export of official safety compliance documents.
* **RDSO Locomotive Cab Audio Synthesizer:** Pure Web Audio API synthesizing authentic 800Hz and 1200Hz cab warning tones on hazard detection.

---

## 🟡 4. COULD HAVE (P2 — Extended & Predictive Features)

* **What-If Disruption & Weather Simulator:** Dynamic scenario modeling for monsoon rain ($\mu=0.095$), winter fog ($\mu=0.115$), and upstream freight diversions.
* **Maintenance Gang Duty Hours & Rest Tracker:** Fatigue monitoring ensuring field gangs comply with railway statutory rest rules.
* **Inter-Divisional Machine Depot Balancing:** Automated scheduling of machine handovers across adjacent railway divisions.
* **Micro-Topological Track Gradient Modeling:** Dynamic Emergency Braking Distance adjustment factoring in track gradients ($G_s$).

---

## 🔴 5. WON'T HAVE (Out of Scope for System Core)

* ❌ **Passenger Ticket Booking & Commercial PNR Management:** RailSuraksha AI is strictly an infrastructure asset optimization and railway operations platform.
* ❌ **Coach Interior & Onboard Passenger Amenities Monitoring:** Excluded from scope.
* ❌ **Unbounded Free-Text Manual Block Memos:** All maintenance requisitions must be digitally structured, normalized, and constraint-checked.
