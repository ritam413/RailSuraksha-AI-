# RailSuraksha AI — Product Requirements Document (PRD)

**Project Name:** RailSuraksha AI (रेल-सुरक्षा): Automated Block Planning & Corridor Optimization System (Auto-BDMS)  
**SIH Problem Statement:** 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 2.0.0 (SIH 26027 Refactored Architecture)  
**Target Platform:** National Railway Corridor Operations & Divisional Control Centers  
**Target Framework:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, FastAPI / Python MILP Solver (OR-Tools)

---

## 1. Executive Summary & Problem Understanding

### 1.1 The Challenge in Indian Railways Today
Indian Railways fixed railway infrastructure (track permanent way, 25kV traction distribution, signaling & telecommunication) is maintained by three separate engineering directorates:
* **Civil / P-Way Engineering (Track Management System - TMS)**
* **Electrical / TRD (Traction Distribution Management System - TDMS)**
* **Signal & Telecom / S&T (Signalling Maintenance & Management System - SMMS)**

Currently, each department requests line disconnections independently through the **Block Demand Management System (BDMS / e-BDMS)**. This process is decentralized, uncoordinated, and manual:
1. **Departmental Silos & Disconnected Maintenance:** A section of track is often blocked 3 separate times in a single week for civil, electrical, and signal work, multiplying corridor downtime.
2. **Controller Cognitive Overload:** Section Controllers in Divisional Control Offices manage traffic via the **Control Office Application (COA)**. They lack automated decision-support tools to identify traffic gaps, evaluate network impact, or co-schedule multiple maintenance tasks.
3. **Severe Asset Downtime & Throughput Loss:** Suboptimal block allocation results in cancelled freight paths, passenger punctuality loss, or deferred maintenance leading to emergency Temporary Speed Restrictions (TSRs).

### 1.2 The Solution Vision: Auto-BDMS
**RailSuraksha AI** is an AI-driven, constraint-optimized Automatic Block Planning System that:
* Ingests and normalizes maintenance requests across TMS, SMMS, TDMS, and train paths from COA.
* Clusters co-located demands into **Automated Multi-Department Joint Shadow Blocks**.
* Solves corridor time-distance scheduling using Mixed-Integer Linear Programming (MILP) to minimize downtime and avoid passenger delays.
* Operates across **Multi-Horizon Planning** (24h Tactical, 7-Day Operational, 30-Day Strategic).
* Protects field crews by disseminating digital Temporary Speed Restrictions (TSR) directly to locomotive **Kavach TCAS** units and interlocking relays upon block sanction.

---

## 2. User Personas & Roles

| Persona | Role & Platform Access | Key Needs & Behaviors |
| :--- | :--- | :--- |
| **Divisional Section Controller (DOM/Sr. DOM)** | Command Center Dashboard & Corridor String Chart | Evaluates corridor capacity, reviews AI-optimized joint block recommendations, and executes one-click block sanctions (`[SANCTION BLOCK]`). |
| **Departmental Maintenance Planners (P-Way, TRD, S&T)** | Department Demand Queue & Machine Planning View | Enters and tracks maintenance work orders, reviews joint bundling proposals, and coordinates machine (CSM, BCM, Tower Wagon) and manpower gang deployment. |
| **Safety Compliance Auditor / RDSO Inspector** | Auditor Workspace & Decision Dossier | Audits immutable 4-step AI scheduling logs (Ingestion $\to$ Conflict Check $\to$ Shadow Bundling $\to$ Sanction & Safety TSR) and exports RDSO compliance certificates. |
| **Locomotive Pilot & Field Station Master** | Cab Display & Station Control Console | Receives automated Kavach Temporary Speed Restrictions (TSR), signal lockout alerts, and digital line clearance tokens for active maintenance sections. |

---

## 3. System Architecture & Core Functional Modules

```mermaid
graph TD
    subgraph "1. Multi-Source Ingestion"
        TMS["TMS (Track Flaws, USFD, TGI)"] --> Ingest["Unified Ingestion Adapter"]
        SMMS["SMMS (Signals, Points, Interlocking)"] --> Ingest
        TDMS["TDMS (OHE Catenary, Power Cuts)"] --> Ingest
        COA["COA (Train Timetables & Freight Forecasts)"] --> Ingest
    end

    subgraph "2. Core Optimization Engine"
        Ingest --> Triage["ML Urgency Triage (P1 / P2 / P3)"]
        Triage --> Solver["MILP Shadow-Block Solver (Google OR-Tools)"]
        Solver --> Bundler["Multi-Department Co-Location Bundler"]
    end

    subgraph "3. Operator Cockpit & UI Surfaces"
        Bundler --> Gantt["Corridor Time-Distance String Chart"]
        Bundler --> Queue["Department Demand Triage Queue"]
        Bundler --> Switcher["Multi-Horizon Switcher (24h / 7D / 30D)"]
        Bundler --> Interlocking["Track Interlocking & Circuit Map"]
    end

    subgraph "4. Safety & Compliance Dispatch"
        Gantt --> Sanction{"Controller Sanction Gate"}
        Sanction -->|Approved| Kavach["Kavach TSR & Radio Balise Broadcast"]
        Sanction -->|Approved| InterlockLock["Interlocking Signal Lockout"]
        Sanction -->|Approved| Dossier["4-Step Explainable Decision Dossier"]
    end
```

---

## 4. Detailed Functional Requirements

### 4.1 Module 1: Multi-System Data Ingestion & Spatial Normalization
* **TMS Ingestion:** Ingests rail flaw alerts, ultrasonic flaw detection (USFD) records, track tamping requirements, and Track Geometry Index (TGI) deficit sections.
* **TDMS Ingestion:** Ingests 25kV OHE catenary/contact wire wear logs, neutral section overhaul schedules, insulator wash demands, and power block requests.
* **SMMS Ingestion:** Ingests point machine operating cycle thresholds, track circuit relay health, electronic interlocking maintenance logs, and disconnection demands.
* **COA Ingestion:** Real-time train tracking, scheduled passenger timetables, dynamic running delays, and goods freight rake path forecasts.
* **Spatial Chainage Normalizer:** Converts railway kilometer markers (e.g. `KM 108/4 - 114/2`) into discrete track circuit identifiers (`TC-01` through `TC-06`).

### 4.2 Module 2: ML Urgency Triage & Priority Scoring
* Calculates a dynamic urgency score for every maintenance requisition:
  $$\text{Priority Score} = w_1 \cdot \text{SafetyCriticality} + w_2 \cdot \text{DegradationRate} + w_3 \cdot \text{OverdueDays}$$
* Categorizes tasks into:
  * **P1 (Immediate / Safety Threat):** Requires urgent block allocation within next 12–24 hours (e.g., severe rail fracture, acute catenary drop).
  * **P2 (Scheduled / Periodicity Bound):** Mandatory regulatory maintenance with scheduled deadline (e.g., track tamping, point overhaul).
  * **P3 (Preventive / Routine):** Maintenance that can be deferred or fitted into available opportunist windows.

### 4.3 Module 3: Joint Shadow-Block Optimization Engine
* **Mathematical Formulation:** Mixed-Integer Linear Programming (MILP) formulated using Google OR-Tools.
* **Objective Function:**
  $$\min \quad \alpha \cdot \text{CorridorDowntime} + \beta \cdot \text{FreightDelayCost} + \gamma \cdot \text{DeferredMaintenancePenalty}$$
* **Hard Operational Constraints:**
  * **Zero Passenger Cancellation:** No scheduled passenger trains may be cancelled or delayed beyond regulatory buffer.
  * **Headway Adherence:** Minimum safety headways (15 minutes) enforced between train clears and block start.
  * **Co-Location Shadow Blocking:** All eligible demands on overlapping spatial chainage are bundled into a single unified track closure window.
  * **Resource Feasibility:** Maintenance gang, Tower Wagon, and track machine availability constraints must be satisfied.

### 4.4 Module 4: Multi-Horizon Planning
* **24-Hour Tactical Horizon:** 
  * Real-time slotting for upcoming night lull (01:30–04:30 AM).
  * Emergency P1 defect insertions and dynamic freight path re-routing.
* **7-Day Operational Horizon:**
  * Rolling corridor maintenance schedule.
  * Multi-department joint block coordination across divisional sections.
* **30-Day Strategic Horizon:**
  * Heavy track machine (CSM tamping machine, BCM ballast cleaner) routing optimization.
  * Track Geometry Index (TGI) corridor health recovery planning.

### 4.5 Module 5: Modern Web Dispatcher Cockpit (Mintlify Light-Blue System)
* **Corridor Time-Distance String Chart (`CorridorStringChart.tsx`):**
  * X-axis: Time (00:00 to 24:00 hours).
  * Y-axis: Distance / Stations (e.g. CSMT $\to$ Dadar $\to$ Thane $\to$ Kalyan).
  * Diagonal lines represent train trajectories; colored shaded rectangular zones represent joint maintenance blocks.
* **Department Demand Queue (`IncidentQueue.tsx`):**
  * Displays pending TMS, SMMS, and TDMS demands with urgency badges, duration, and AI bundling recommendations.
  * One-click `[APPROVE & SANCTION BLOCK]` action.
* **KPI Strip (`KpiStrip.tsx`):**
  * 6 operational metrics: Active Corridor Blocks, Corridor Downtime Saved (38.4%), Track Asset Availability Index (96.2%), Pending Demands, White Corridor Headway Gap, Kavach TSRs Active.
* **Interlocking & Block Map (`InterlockingMap.tsx`):**
  * Real-time visual tracking of active blocks, occupied circuits, signal aspects ($S\text{-}12$, $S\text{-}14$), and temporary speed restrictions (TSR).
* **Explainable Decision Dossier Modal (`DecisionLogModal.tsx`):**
  * 4-step chronological audit timeline with SHA-256 seal and official RDSO Section 14B Safety Compliance certificate generation.

---

## 5. MoSCoW Feature Matrix

| Category | Features |
| :--- | :--- |
| **Must Have** | • Multi-Department Ingestion Normalizer (TMS, SMMS, TDMS, COA).<br/>• Joint Shadow-Block Optimization Engine.<br/>• Corridor Time-Distance String Chart UI.<br/>• Department Demand Queue with P1/P2/P3 Urgency Triage.<br/>• Multi-Horizon Planning Switcher (24h Tactical, 7D Operational, 30D Strategic).<br/>• Controller One-Click Sanction Gate with Kavach TSR generation. |
| **Should Have** | • Interactive Gantt string-chart zoom and pan.<br/>• Machine (CSM/Tower Wagon) roster constraint solver.<br/>• Real-time WebSocket updates for train path shifts.<br/>• Downloadable RDSO Section 14B Block Sanction Dossier PDF/JSON. |
| **Could Have** | • What-if scenario simulator (weather disruption impact on corridor availability).<br/>• Crew duty hours tracking for maintenance gangs. |
| **Won't Have** | • ❌ Passenger coach interior tracking or ticket booking integration.<br/>• ❌ Unbounded manual text block requests (everything is digital & constraint-checked). |

---

## 6. Success Metrics & Operational Impact

* **Corridor Downtime:** **35% to 40% reduction** in total blocked line hours.
* **Asset Availability:** **+18% increase** in available network capacity.
* **Punctuality:** **Zero** passenger train cancellations and **<1.2%** secondary delay propagation.
* **Solver Performance:** Corridor schedules solved in **<30 seconds** for 100+ km sections.
* **Safety:** **100% digital dissemination** of Kavach TSRs with zero track gang collision incidents.
