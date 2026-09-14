# Use-Case Specification: MILP Solver & Joint Shadow-Block Optimizer Engine

> **System:** RailSuraksha AI (Auto-BDMS)  
> **Component:** Core Mathematical Optimization Engine (Mixed-Integer Linear Programming / CP-SAT Solver)  
> **Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*

---

## 📐 1. UML Use-Case Diagram (Mermaid)

```mermaid
graph LR
    %% Actors
    subgraph Actors ["👥 System Actors"]
        Controller["👤 Divisional Section Controller<br/>(Sr. DOM / Section Dispatcher)"]
        Planners["👷 Department Maintenance Planners<br/>(Civil P-Way / Electrical TRD / S&T)"]
        CRIS["🖥️ CRIS Data Systems<br/>(TMS, SMMS, TDMS, COA)"]
        Kavach["📡 Kavach TCAS & Interlocking<br/>(Loco Cab Radio & EI Relays)"]
        Auditor["📋 Safety & RDSO Auditor<br/>(Compliance Officer)"]
    end

    %% System Boundary
    subgraph SolverBoundary ["⚙️ SYSTEM BOUNDARY: MILP Optimizer & Multi-Horizon Scheduler Engine"]
        UC1(["UC-01: Ingest & Normalize Asset Demands<br/><i>(Convert Chainage KMs to Track Circuits)</i>"])
        UC2(["UC-02: Triage Demand Urgency & Safety Score<br/><i>(Rank P1 Critical / P2 Periodic / P3 Routine)</i>"])
        UC3(["UC-03: Analyze COA Headways & Traffic Gaps<br/><i>(Identify Natural Nocturnal Lulls)</i>"])
        
        UC4(["UC-04: Execute MILP Corridor Optimization<br/><i>(OR-Tools Multi-Objective Solver)</i>"])
        UC4_1(["UC-04.1: Minimize Total Corridor Downtime"]):::sub
        UC4_2(["UC-04.2: Enforce Zero-Passenger Cancellation"]):::sub
        UC4_3(["UC-04.3: Cluster Co-Located Shadow Blocks<br/><i>(Civil + TRD OHE + S&T Signals)</i>"]):::sub
        UC4_4(["UC-04.4: Enforce Track Machine & Crew Feasibility"]):::sub

        UC5(["UC-05: Generate Multi-Horizon Schedules"])
        UC5_1(["UC-05.1: 24h Daily Tactical Horizon<br/><i>(Night Lulls & Emergency P1 Flaws)</i>"]):::horizon
        UC5_2(["UC-05.2: 7-Day Weekly Operational Matrix<br/><i>(Rolling Joint Corridor Maintenance)</i>"]):::horizon
        UC5_3(["UC-05.3: 30-Day Monthly Strategic Master Plan<br/><i>(Heavy Tamping & TGI Recovery)</i>"]):::horizon

        UC6(["UC-06: Simulate 'What-If' Disruption Scenarios<br/><i>(Weather / Freight Diversion)</i>"])
        UC7(["UC-07: Sanction & Dispatch Corridor Block"])
        UC8(["UC-08: Broadcast Kavach TSR & Signal Lockout"])
        UC9(["UC-09: Compile Explainable Decision Dossier<br/><i>(SHA-256 Digital Verification)</i>"])
    end

    %% Actor Relationships
    CRIS --> UC1
    Planners --> UC1
    Planners --> UC2

    UC1 -->|<<include>>| UC2
    UC2 -->|<<include>>| UC4
    CRIS --> UC3
    UC3 -->|<<include>>| UC4

    UC4 -.->|<<include>>| UC4_1
    UC4 -.->|<<include>>| UC4_2
    UC4 -.->|<<include>>| UC4_3
    UC4 -.->|<<include>>| UC4_4

    UC4 -->|<<include>>| UC5
    UC5 -.->|<<include>>| UC5_1
    UC5 -.->|<<include>>| UC5_2
    UC5 -.->|<<include>>| UC5_3

    Controller --> UC6
    UC6 -.->|<<extend>>| UC4
    Controller --> UC7
    UC5 --> UC7

    UC7 -->|<<include>>| UC8
    UC8 --> Kavach
    UC7 -->|<<include>>| UC9
    UC9 --> Auditor

    classDef sub fill:#E6F0FA,stroke:#2B7FFF,stroke-width:1px,color:#0F172A;
    classDef horizon fill:#EFF6FF,stroke:#3B82F6,stroke-dasharray: 5 5,color:#0F172A;
```

---

## 🔍 2. Detailed Elaboration of Core Solver Use Cases

### UC-01: Ingest & Normalize Asset Demands
* **Primary Actors:** Departmental Planners (P-Way, TRD, S&T), CRIS Systems.
* **Trigger:** Daily/hourly synchronization from TMS, SMMS, TDMS.
* **Description:** Ingests unstructured defect logs, overdue maintenance work orders, and Track Geometry Index (TGI) deficits. Normalizes engineering chainage markers (e.g., `KM 108/4 to 112/2`) into discrete electrical track circuit nodes (`TC-01` to `TC-06`).
* **Output:** Normalized stream of `MaintenanceDemandRecord` objects ready for solver indexing.

---

### UC-02: Triage Demand Urgency & Safety Score
* **Primary Actor:** ML Urgency Triage Classifier.
* **Precondition:** Ingestion and normalization complete.
* **Formulation:** Evaluates urgency score $S_i \in [0, 1]$:
  $$S_i = 0.45 \cdot \text{SafetyRisk} + 0.35 \cdot \text{DegradationRate} + 0.20 \cdot \text{OverdueDays}$$
* **Tier Categorization:**
  * **P1 (Immediate Threat):** Transverse rail fractures, sudden OHE sagging, track circuit fail-safes. Must be slated into the **24-Hour Tactical Horizon**.
  * **P2 (Scheduled Maintenance):** Track tamping cycles, point machine motor overhauls. Slated into **7-Day Operational Matrix**.
  * **P3 (Preventive / Opportunistic):** Drain cleaning, ballast dressing, insulator washing. Scheduled during shadow blocks.

---

### UC-03: Analyze COA Headways & Traffic Gaps
* **Primary Actor:** CRIS COA (Control Office Application).
* **Description:** Reads dynamic train charts, passenger express schedules, suburban EMU frequencies, and goods freight forecasts. Calculates natural time-distance headways ($\ge 15\text{ min}$) and isolates white-corridor windows (predominantly 01:30 to 04:30 AM nocturnal lulls).

---

### UC-04: Execute MILP Corridor Optimization (The Solver Core)
* **Mathematical Solver:** Google OR-Tools (`ortools.sat.python.cp_model.CpModel`) or Mixed-Integer Linear Programming.
* **Objective Function:**
  $$\min \quad \sum_{s,t} \Big( C_{\text{downtime}} \cdot y_{s,t} \Big) + \sum_{j} \Big( C_{\text{delay}, j} \cdot d_j \Big) + \sum_{i} \Big( P_{\text{defer}, i} \cdot (1 - \sum_t x_{i,t}) \Big)$$
* **Sub-Use Cases & Constraints:**
  * **UC-04.1 (Minimize Corridor Downtime):** Minimizes total minutes track sections $s$ are blocked from active train movements.
  * **UC-04.2 (Zero-Passenger Cancellation):** Hard constraint: $d_j = 0$ for all mail/express passenger trains $j \in \mathcal{P}_{\text{sched}}$.
  * **UC-04.3 (Co-Located Shadow Blocking):** If demand $i_1 \in \text{TDMS}$ (OHE power cut) and demand $i_2 \in \text{TMS}$ (track tamping) overlap along section $s$, enforce identical track closure:
    $$x_{i_1, t} \le y_{s,t} \quad \text{and} \quad x_{i_2, t} \le y_{s,t}$$
    This single constraint eliminates 35%–40% of redundant line closures.
  * **UC-04.4 (Resource Feasibility):** Enforces availability limits for high-capacity machines (CSM tampers, BCM ballast cleaners, Tower Wagons) and field maintenance gangs.

---

### UC-05: Generate Multi-Horizon Schedules
* **Primary Actor:** Multi-Horizon Schedule Generator.
* **Description:** Splits the optimization output into three actionable operational horizons:
  1. **UC-05.1 (Daily Tactical - 24 Hours):** Slotting emergency P1 flaws into tonight's lull window, with micro-headway re-routing for delayed freight rakes.
  2. **UC-05.2 (Weekly Operational - 7 Days):** Rolling corridor schedule bundling civil, electrical, and signal teams into coordinated 3.5-hour joint shadow blocks across divisional sections.
  3. **UC-05.3 (Monthly Strategic - 30 Days):** Cyclic corridor overhaul schedules, machine depot logistics, and Track Geometry Index (TGI) recovery projections.

---

### UC-06: Simulate 'What-If' Disruption Scenarios
* **Primary Actor:** Divisional Section Controller.
* **Trigger:** Controller inputs simulated weather disruptions (e.g., monsoon flooding, winter fog) or emergency freight priority diversions.
* **Outcome:** The solver re-runs in $<15\text{ seconds}$, dynamically shifting block windows and projecting alternative corridor paths.

---

### UC-07: Sanction & Dispatch Corridor Block
* **Primary Actor:** Divisional Section Controller (`Sr. DOM`).
* **Trigger:** Controller reviews proposed bundled block on the **Corridor Time-Distance String Chart** and clicks `[SANCTION BLOCK]`.
* **Outcome:** The system issues digital sanction tokens to station masters, updates the e-BDMS portal, and triggers UC-08 and UC-09.

---

### UC-08: Broadcast Kavach TSR & Signal Lockout
* **Primary Secondary Actors:** Kavach TCAS locomotive units, Electronic Interlocking (EI).
* **Description:** 
  * Automatically transmits **Temporary Speed Restriction (TSR 30 km/h)** packets wirelessly via trackside radio balises to all locomotive cabs operating on adjacent tracks.
  * Clamps signal aspects (`S-12`, `S-14`) to danger (`RED`) in the electronic interlocking relay logic to physically protect track gangs.

---

### UC-09: Compile Explainable Decision Dossier
* **Primary Actor:** Safety Compliance Auditor / RDSO Inspector.
* **Description:** Compiles an immutable 4-step explainable record signed with a SHA-256 cryptographic hash:
  1. *Ingestion Evidence:* Specific TMS, SMMS, TDMS ticket IDs and chainage markers.
  2. *Conflict Resolution:* Avoided train path bottlenecks.
  3. *Co-Location Savings:* Exact hours saved by bundling OHE with tamping.
  4. *Safety Confirmation:* Verified Kavach TSR dissemination and interlocking clamping.
* **Export:** One-click download of official **RDSO Form 14B Safety Compliance Certificate**.
