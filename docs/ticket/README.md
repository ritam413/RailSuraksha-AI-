# 🎫 IRIS AI — Master Ticket Backlog & Graphified Topology

> **System:** IRIS AI (Automatic Block Planning & Corridor Optimization — SIH 26027)  
> **Topology Engine:** `/graphify` AST-Driven Subsystem & Dependency Cartography  
> **Status:** Stage 1 Frontier Active (`TICKET-DEV1-01` Unblocked)

---

## 👥 Ticket Backlog & Ownership Matrix

| Ticket ID | File / Feature | Assignee | Priority | Subsystem Domain |
| :--- | :--- | :--- | :--- | :--- |
| **`TICKET-DEV1-01`** | [`TICKET-DEV1-01-contracts-and-mock-data.md`](./TICKET-DEV1-01-contracts-and-mock-data.md) | **Dev 1 (Core)** | **P0 (Root)** | Core Contracts, Data Seams & CSMT–Kalyan Datasets |
| **`TICKET-DEV1-02`** | [`TICKET-DEV1-02-cpsat-optimizer-backend.md`](./TICKET-DEV1-02-cpsat-optimizer-backend.md) | **Dev 1 (Core)** | **P0** | Google OR-Tools CP-SAT Solver & Emergency TSR Squeeze |
| **`TICKET-DEV1-03`** | [`TICKET-DEV1-03-svg-marey-string-chart.md`](./TICKET-DEV1-03-svg-marey-string-chart.md) | **Dev 1 (Core)** | **P0** | Dual-Layer SVG Marey Time-Distance String Chart (Core Visualizer) |
| **`TICKET-DEV1-04`** | [`TICKET-DEV1-04-interlocking-track-map.md`](./TICKET-DEV1-04-interlocking-track-map.md) | **Dev 1 (Core)** | **P0** | Section Interlocking State Machine, Circuits & Signal Clamping |
| **`TICKET-DEV1-05`** | [`TICKET-DEV1-05-decision-dossier-modal.md`](./TICKET-DEV1-05-decision-dossier-modal.md) | **Dev 1 (Core)** | **P0** | 4-Step Decision Dossier, Canonical SHA-256 Seal & RDSO Form 14B |
| **`TICKET-DEV1-06`** | [`TICKET-DEV1-06-dual-mode-api-client.md`](./TICKET-DEV1-06-dual-mode-api-client.md) | **Dev 1 (Core)** | **P1** | Dual-Mode Data Client & Zero-Fail Offline Fallback Architecture |
| **`TICKET-DEV1-07`** | [`TICKET-DEV1-07-master-cockpit-assembly.md`](./TICKET-DEV1-07-master-cockpit-assembly.md) | **Dev 1 (Core)** | **P0 (Terminal)**| Master 3-View Command Cockpit, Horizon Switcher & Sanction Event Bus |
| **`TICKET-DEV2-01`** | [`TICKET-DEV2-01-kpi-strip-metrics.md`](./TICKET-DEV2-01-kpi-strip-metrics.md) | **Dev 2 (UI)** | P1 | 6-Metric Block Planning KPI Strip & Summary Cards |
| **`TICKET-DEV2-02`** | [`TICKET-DEV2-02-demand-triage-queue.md`](./TICKET-DEV2-02-demand-triage-queue.md) | **Dev 2 (UI)** | P1 | Multi-Department Demand Queue List, Filter Tabs & Badges |
| **`TICKET-DEV2-03`** | [`TICKET-DEV2-03-recharts-analytics-suite.md`](./TICKET-DEV2-03-recharts-analytics-suite.md) | **Dev 2 (UI)** | P2 | Recharts Analytics Suite (Kavach Deceleration Curve & Triage Donut) |

---

## 🏛️ Subsystem Architecture & Boundary Topology

```mermaid
graph TB
    %% Styling tokens (Light-Blue Mintlify palette)
    classDef contract fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1E3A8A;
    classDef solver fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F;
    classDef coreUI fill:#ECFDF5,stroke:#059669,stroke-width:2px,color:#064E3B;
    classDef audit fill:#EDE9FE,stroke:#7C3AED,stroke-width:2px,color:#4C1D95;
    classDef auxUI fill:#F1F5F9,stroke:#64748B,stroke-width:2px,color:#0F172A;
    classDef shell fill:#DBEAFE,stroke:#2563EB,stroke-width:3px,color:#1E3A8A;

    subgraph SUB_CONTRACTS["📦 Subsystem 1: Shared Data Contracts & Grounding (Dev 1)"]
        D01["[TICKET-DEV1-01]<br/><b>apiContracts.ts & mockData.ts</b><br/>• MaintenanceDemand / JointBlockSchedule<br/>• CSMT-Kalyan Nocturnal Paths"]:::contract
    end

    subgraph SUB_SOLVER["⚙️ Subsystem 2: Mathematical Optimization Engine (Dev 1)"]
        D02["[TICKET-DEV1-02]<br/><b>FastAPI + CP-SAT Solver</b><br/>• Disjunctive Interval Scheduling<br/>• Emergency TSR Fallback Squeeze"]:::solver
        D06["[TICKET-DEV1-06]<br/><b>Dual-Mode API Client</b><br/>• Live HTTP + Local Heuristic Fallback"]:::solver
    end

    subgraph SUB_TACTICAL["🚦 Subsystem 3: Core Tactical & Safety Visualizers (Dev 1)"]
        D03["[TICKET-DEV1-03]<br/><b>CorridorStringChart.tsx</b><br/>• Dual-Layer SVG Marey Train Graph<br/>• Shadow-Block Co-location Shading"]:::coreUI
        D04["[TICKET-DEV1-04]<br/><b>InterlockingMap.tsx & SignalHead.tsx</b><br/>• TC-01..TC-06 Circuit Schematic<br/>• Form S&T/T-351 Signal Clamping"]:::coreUI
    end

    subgraph SUB_AUDIT["🛡️ Subsystem 4: Compliance & Cryptographic Auditing (Dev 1)"]
        D05["[TICKET-DEV1-05]<br/><b>DecisionLogModal.tsx & explainableLogger.ts</b><br/>• 4-Step Chronological AI Timeline<br/>• Canonical RFC 8785 SHA-256 Seal"]:::audit
    end

    subgraph SUB_AUX["📊 Subsystem 5: Operational UI Widgets & Analytics (Dev 2)"]
        D21["[TICKET-DEV2-01]<br/><b>KpiStrip.tsx</b><br/>• 38.4% Downtime Saved & Headway Cards"]:::auxUI
        D22["[TICKET-DEV2-02]<br/><b>IncidentQueue.tsx</b><br/>• TMS/TDMS/SMMS Demand Triage List<br/>• [SANCTION BLOCK] Trigger"]:::auxUI
        D23["[TICKET-DEV2-03]<br/><b>Recharts Analytics Suite</b><br/>• Kavach EBD Curve & Triage Donut"]:::auxUI
    end

    subgraph SUB_SHELL["🖥️ Subsystem 6: Master Cockpit Shell (Dev 1 Terminal)"]
        D07["[TICKET-DEV1-07]<br/><b>Master Cockpit Assembly (page.tsx)</b><br/>• 3 Tactical Views + Horizon Switcher<br/>• Reactive Sanction Event Bus"]:::shell
    end

    %% Seam bindings
    D01 ==> D02
    D01 ==> D06
    D01 ==> D03
    D01 ==> D04
    D01 ==> D05
    D01 ==> D21
    D01 ==> D22
    D01 ==> D23

    D02 --> D06
    D06 --> D07
    D03 --> D07
    D04 --> D07
    D05 --> D07
    D21 --> D07
    D22 --> D07
    D23 --> D07
```

---

## 🌲 Multi-Stage Execution & Dependency DAG

```mermaid
graph TD
    classDef stage1 fill:#DCFCE7,stroke:#16A34A,stroke-width:2px,color:#14532D;
    classDef stage2Dev1 fill:#EFF6FF,stroke:#3B82F6,stroke-width:2px,color:#1E3A8A;
    classDef stage2Dev2 fill:#F8FAFC,stroke:#64748B,stroke-width:2px,color:#334155;
    classDef stage3 fill:#FEF3C7,stroke:#D97706,stroke-width:2px,color:#78350F;
    classDef stage4 fill:#DBEAFE,stroke:#2563EB,stroke-width:3px,color:#1E3A8A;

    subgraph STAGE_1["STAGE 1: ROOT CONTRACT SEAM (Unblocked Frontier)"]
        T_01["<b>[TICKET-DEV1-01]</b><br/>Shared Contracts & Grounded Mock Data<br/><i>Assignee: Dev 1</i>"]:::stage1
    end

    subgraph STAGE_2_DEV1["STAGE 2: CORE SOLVER & VISUALIZERS (Parallel Dev 1)"]
        T_02["<b>[TICKET-DEV1-02]</b><br/>CP-SAT Optimizer Backend"]:::stage2Dev1
        T_03["<b>[TICKET-DEV1-03]</b><br/>Dual-Layer SVG Marey String Chart"]:::stage2Dev1
        T_04["<b>[TICKET-DEV1-04]</b><br/>Interlocking Map & Signal Clamping"]:::stage2Dev1
        T_05["<b>[TICKET-DEV1-05]</b><br/>Decision Dossier & SHA-256 Seal"]:::stage2Dev1
    end

    subgraph STAGE_2_DEV2["STAGE 2: UI WIDGETS & CHARTS (Parallel Dev 2)"]
        T_21["<b>[TICKET-DEV2-01]</b><br/>6-Metric KPI Strip"]:::stage2Dev2
        T_22["<b>[TICKET-DEV2-02]</b><br/>Demand Triage Queue"]:::stage2Dev2
        T_23["<b>[TICKET-DEV2-03]</b><br/>Recharts Analytics Suite"]:::stage2Dev2
    end

    subgraph STAGE_3["STAGE 3: CLIENT-SERVER SYNC"]
        T_06["<b>[TICKET-DEV1-06]</b><br/>Dual-Mode API Client & Offline Fallback"]:::stage3
    end

    subgraph STAGE_4["STAGE 4: TERMINAL INTEGRATION"]
        T_07["<b>[TICKET-DEV1-07]</b><br/>Master 3-View Cockpit & Sanction Bus<br/><i>Assignee: Dev 1</i>"]:::stage4
    end

    %% Dependency Edges
    T_01 --> T_02
    T_01 --> T_03
    T_01 --> T_04
    T_01 --> T_05
    T_01 --> T_21
    T_01 --> T_22
    T_01 --> T_23

    T_02 --> T_06
    T_01 --> T_06

    T_03 --> T_07
    T_04 --> T_07
    T_05 --> T_07
    T_06 --> T_07
    T_21 --> T_07
    T_22 --> T_07
    T_23 --> T_07
```

---

## ⚡ Real-Time Reactive Sanction Event Bus Topology

```mermaid
sequenceDiagram
    autonumber
    actor Controller as Section Controller
    participant Queue as Demand Queue (TICKET-DEV2-02)
    participant Client as API Client (TICKET-DEV1-06)
    participant Solver as CP-SAT Engine (TICKET-DEV1-02)
    participant Marey as Marey String Chart (TICKET-DEV1-03)
    participant Lockout as Interlocking Map (TICKET-DEV1-04)
    participant HUD as Loco-Cab HUD (Kavach TSR)
    participant Dossier as Auditor Dossier (TICKET-DEV1-05)

    Controller->>Queue: Clicks [SANCTION JOINT BLOCK]
    Queue->>Client: triggerSanction(blockId, operatorId)
    Client->>Solver: POST /api/optimize (or fallback)
    Solver-->>Client: JointBlockSchedule + Bundled Demands
    
    par Parallel Subsystem Updates
        Client->>Marey: Paint shaded shadow block (01:30 - 04:45)
        Client->>Lockout: Clamp TC-03 to BLOCK_SANCTIONED & Signal S-12 to RED
        Client->>HUD: Broadcast wireless Kavach TSR 30 km/h packet
        Client->>Dossier: Generate canonical RFC 8785 SHA-256 seal
    end
    
    Dossier-->>Controller: Display verified Explainable Decision Dossier & Form 14B
```
