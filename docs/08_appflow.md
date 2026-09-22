# IRIS AI — Application Flows & State Transition Diagrams

**System Name:** IRIS AI (Intelligent Railway Inspection and Restoration AI): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.1.0 (Grounded Multi-Horizon & Decoupled Architecture Specification)  
**Governing Standards Reference:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 🔄 1. Continuous 4-Step Operational Loop Flowchart

```mermaid
flowchart TD
    subgraph S1 ["Step 1: Pluggable Multi-System Data Ingestion"]
        TMS["TMS Feed / Simulator"] --> TMSAdapter["TMS Adapter"]
        TDMS["TDMS Feed / Simulator"] --> TDMSAdapter["TDMS Adapter"]
        SMMS["SMMS Feed / Simulator"] --> SMMSAdapter["SMMS Adapter"]
        COA["COA Feed / Simulator"] --> COAAdapter["COA Adapter"]
        
        TMSAdapter & TDMSAdapter & SMMSAdapter & COAAdapter --> IngestAdapter["Spatial Normalizer Port<br/>(KM Chainage ──► Track Circuit TC-01..06)"]
    end

    subgraph Policy ["Decoupled Policy & Rules Engine"]
        PolicyConfig["Divisional Policy Profile<br/>(Buffers, Weights, Headways)"]
    end

    subgraph S2 ["Step 2: Configurable Urgency Triage & Scoring"]
        IngestAdapter --> TriageScore["Compute Urgency Score<br/>S_i = w_s*Risk + w_d*Degradation + w_c*Density"]
        PolicyConfig -.->|Injects Weights| TriageScore
        TriageScore --> Classify{"Score Threshold"}
        Classify -->|Score >= 0.80| P1["P1 Critical (Immediate 24h Lull)"]
        Classify -->|0.50 <= Score < 0.80| P2["P2 Scheduled (7-Day Rolling)"]
        Classify -->|Score < 0.50| P3["P3 Routine (30-Day Cyclical)"]
    end

    subgraph S3 ["Step 3: Grounded Joint Shadow-Block Optimization"]
        P1 & P2 & P3 --> Solver["Google OR-Tools CP-SAT Disjunctive Solver"]
        PolicyConfig -.->|Injects Headways & Buffers| Solver
        Solver --> Cluster["Co-Location Bundling Engine<br/>(Civil + S&T under de-energized OHE)"]
        Cluster --> CheckHeadway{"Zero Passenger Delay &<br/>Headway >= Delta_clear?"}
        CheckHeadway -->|Yes| OutputPlan["Generate Bundled Block Plan<br/>(Downtime Saved: 38.4%)"]
        CheckHeadway -->|No| ShiftSlot["Shift Slot / Reroute Freight"]
        ShiftSlot --> Solver
    end

    subgraph S4 ["Step 4: Pluggable Safety & Sanction Dispatch Gate"]
        OutputPlan --> CockpitView["Render on Corridor String Chart"]
        CockpitView --> ControllerAction{"Section Controller Action"}
        ControllerAction -->|Reject| ReOptimize["Input Rejection Reason ──► Re-Solve"]
        ReOptimize --> Solver
        ControllerAction -->|Sanction| SanctionActuation["Execute Block Sanction"]
        
        SanctionActuation --> KAVACH["Wireless Kavach TSR Adapter Direct to Cabs"]
        SanctionActuation --> INTERLOCK["Form S&T/T-351 Interlocking Lockout Adapter"]
        SanctionActuation --> CAUTION["Form T/409 Caution Order Adapter"]
        SanctionActuation --> SEAL["Seal Immutable SHA-256 Decision Dossier"]
    end
```

---

## 🚦 2. Track Circuit & Interlocking State Machine

```mermaid
stateDiagram-v2
    [*] --> CLEAR : Track Clear of Rolling Stock

    CLEAR --> OCCUPIED : Train Enters Circuit (Axle Counter Trigger)
    OCCUPIED --> CLEAR : Train Clears Circuit (Axle Counter Match)

    CLEAR --> MAINTENANCE_SLOTTED : AI Plans Block Window
    MAINTENANCE_SLOTTED --> BLOCK_SANCTIONED : Controller Clicks [SANCTION BLOCK]
    
    state BLOCK_SANCTIONED {
        [*] --> OHE_DE_ENERGIZING : Send SCADA Power Cut
        OHE_DE_ENERGIZING --> EARTHING_APPLIED : Apply Double-Discharge Earthing (Configurable Buffer)
        EARTHING_APPLIED --> WORK_IN_PROGRESS : Civil & S&T Gangs Enter
        WORK_IN_PROGRESS --> RESTORATION_PHASE : Work Completed, Crews Clear
        RESTORATION_PHASE --> OHE_RE_ENERGIZED : Remove Earth, Power Restored (Configurable Buffer)
    }

    BLOCK_SANCTIONED --> SIGNAL_CLAMPED_RED : Relay Interlocking Locked (Form S&T/T-351)
    BLOCK_SANCTIONED --> KAVACH_TSR_ACTIVE : Speed Cap Broadcast to Approaching Locos

    OHE_RE_ENERGIZED --> CLEAR : Block Reconnected & Track Verified
```

---

## 📅 3. Multi-Horizon Rolling State Transition Flow `[Grounded Core]`

```mermaid
stateDiagram-v2
    [*] --> STRATEGIC_30D : 30-Day Master Maintenance Programme (TGI Recovery)
    
    STRATEGIC_30D --> OPERATIONAL_7D : Advance Time (Rolling Step = 1 Week)
    state OPERATIONAL_7D {
        [*] --> BUNDLE_SHADOW_BLOCKS : Pool Multi-Department Demands
        BUNDLE_SHADOW_BLOCKS --> ALLOCATE_MACHINES : Route CSM Tampers & Tower Wagons
        ALLOCATE_MACHINES --> FREEZE_48H_WINDOW : Freeze Tactical Horizon
    }

    OPERATIONAL_7D --> TACTICAL_24H : Advance Time (Rolling Step = 24 Hours)
    state TACTICAL_24H {
        [*] --> SLOT_NIGHT_LULL : 01:30 - 04:30 AM Execution
        SLOT_NIGHT_LULL --> RESOLVE_COA_CONFLICTS : Avoid Dynamic Train Delays
        RESOLVE_COA_CONFLICTS --> EXECUTE_SANCTION : Controller One-Click Sanction
    }

    TACTICAL_24H --> OPERATIONAL_7D : Ingest Feedback & Re-Optimize
```

