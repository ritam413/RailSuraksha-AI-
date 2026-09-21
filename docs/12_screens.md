# RailSuraksha AI — Screen Specifications & RBAC Layouts

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Design System:** Light-Blue Mintlify Theme (Canvas `#F0F6FC`, Card `#FFFFFF`, Border `#D0DFEE`, Accent `#2B7FFF`, 4px radii)  
**Governing Standards:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 🖥️ Screen 1: Master Corridor Block Command Cockpit (`/`)

### 1.1 Purpose & Primary Persona
* **Primary Persona:** Divisional Section Controller (`Sr. DOM` / Section Dispatcher).
* **RBAC Role Permissions:**
  * `SECTION_CONTROLLER`: Full access (interact with chart, execute `[SANCTION BLOCK]`, toggle Advisory/Autonomous).
  * `DEPARTMENT_PLANNER`: View string chart and demand status.
  * `SAFETY_AUDITOR` & `FIELD_OPERATOR`: Read-only view.

### 1.2 Layout & UI Components
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR: [RailSuraksha AI Auto-BDMS] | [24h Tactical | 7D | 30D] | [Mode: Advisory]     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP: [38.4% Downtime Saved] [96.2% Availability] [03 Active Blocks] [08 Demands] │
├──────────────────────────────────────────────────────────┬─────────────────────────────┤
│ CORRIDOR TIME-DISTANCE STRING CHART (SVG Canvas)         │ DEPARTMENT DEMAND QUEUE     │
│                                                          │ Filter: [All] [P1] [P2] [P3]│
│ Y: Distance (CSMT -> Dadar -> Thane -> Kalyan)           ├─────────────────────────────┤
│ X: Time (00:00 to 24:00 IST)                             │ [P1] TMS-804: Rail Fracture │
│                                                          │   TC-03 | 180m | [SANCTION] │
│ • Diagonal Slanted Lines: Active Train Paths (12127...)  ├─────────────────────────────┤
│ • Shaded Rectangular Zones: Bundled Shadow Blocks (01:30)│ [P2] TDMS-312: 25kV OHE     │
│ • White Corridor Highlight: Natural off-peak gaps        │   TC-03 | 150m | [SANCTION] │
└──────────────────────────────────────────────────────────┴─────────────────────────────┘
```

### 1.3 Key Interactions & Behavioral Logic
* **Horizon Switcher:** Clicking `[24h Tactical]`, `[7D Operational]`, or `[30D Strategic]` updates the String Chart time scale, aggregating demands across the selected rolling horizon.
* **String Chart Hover & Click:** Hovering over a shaded block window displays bundled tasks (Civil + Electrical + S&T) and downtime savings ($38.4\%$). Clicking opens the **Explainable Decision Dossier Modal**.
* **Demand Item Action:** Clicking `[APPROVE & SANCTION BLOCK]` invokes the sanction gate, updating interlocking states and broadcasting Kavach TSRs.

---

## 🚦 Screen 2: Section Interlocking & Track Circuit Map (`/interlocking`)

### 2.1 Purpose & Primary Persona
* **Primary Persona:** Section Controller, Station Master, Signal Engineer (S&T).
* **RBAC Role Permissions:**
  * `SECTION_CONTROLLER` & `FIELD_OPERATOR`: Full view of track occupancy and signal lockouts.
  * `DEPARTMENT_PLANNER` & `SAFETY_AUDITOR`: Read-only monitoring.

### 2.2 Layout & UI Components
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SECTION: CSMT - KALYAN MAIN LINE (UP FAST CORRIDOR)                                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TRACK CIRCUITS TOPOLOGY:                                                               │
│                                                                                        │
│   [TC-01: CSMT] === [TC-02: Byculla] === [TC-03: Dadar] === [TC-04: Kurla] === ...    │
│      🟢 CLEAR          🟢 CLEAR          🔴 BLOCKED (TSR)     🟡 OCCUPIED              │
│      Aspect: GREEN     Aspect: YELLOW    Aspect: RED (S-12)  Aspect: D-YELLOW         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ INTERLOCKING STATUS PANEL:                                                             │
│ • Block ID: BLK-JOINT-0906-01 | Sanction Status: SANCTIONED                            │
│ • Statutory Notice: Form S&T/T-351 Lockout ACTIVE on Point SW-04                       │
│ • Signal Clamping: Signal S-12 held at RED (Relay Interlocking Clamped)                │
│ • Kavach TSR Active: 30 km/h speed supervision enforced on TC-03 & TC-04              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Key Interactions
* Clicking a track circuit card (`TC-03`) displays active maintenance crews, machine locations (CSM Tamper #98), and catenary de-energization telemetry.

---

## 📹 Screen 3: Defect Vision & Cab Telemetry Console (`/vision-telemetry`)

### 3.1 Purpose & Primary Persona
* **Primary Persona:** Locomotive Pilot, Safety Inspector, Maintenance Crew.
* **RBAC Role Permissions:**
  * `FIELD_OPERATOR` (Loco Pilot): Full HUD telemetry and active speed curve.
  * `DEPARTMENT_PLANNER`: Detailed defect imagery and bounding boxes.
  * `SAFETY_AUDITOR`: Read-only telemetry audit.

### 3.2 Layout & UI Components
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LOCOMOTIVE CAB TELEMETRY & KAVACH TCAS HUD                                              │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│ 1. TMS CIVIL TRACK CAM (USFD Vision)     │ 2. KAVACH CAB SPEEDOMETER & HUD             │
│    [Live Feed: Rail Transverse Fissure]  │    Speed: 88 km/h | Speed Limit: 30 km/h    │
│    Confidence: 98.2% | Bounding Box     │    Target Distance to Block: 420m           │
│    Defect: IMR Flaw (IRPWM Ch 5)         │    Deceleration Mode: SERVICE BRAKE ACTIVE  │
├──────────────────────────────────────────┼─────────────────────────────────────────────┤
│ 3. TDMS PANTOGRAPH CAM (25kV OHE)        │ 4. CAB ALARM & AUDIO SYNTHESIZER            │
│    [Live Feed: Contact Wire Area 71.5mm²]│    Tone: 1200 Hz RDSO Caution Chime        │
│    Status: De-Energized / Earthed        │    Audio Status: SYNTHESIZING ACTIVE        │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 📜 Screen 4: Auditor Workspace & Explainable Decision Dossier Modal (`/auditor-workspace`)

### 4.1 Purpose & Primary Persona
* **Primary Persona:** Commissioner of Railway Safety (CRS), RDSO Safety Compliance Auditor.
* **RBAC Role Permissions:**
  * `SAFETY_AUDITOR` & `SECTION_CONTROLLER`: Full access to 4-step logs, hash verification, and certificate export.
  * `DEPARTMENT_PLANNER` & `FIELD_OPERATOR`: Read-only summary.

### 4.2 Layout & UI Components
```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ EXPLAINABLE AI DECISION DOSSIER — BLOCK #BLK-JOINT-0906-01                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SHA-256 DIGITAL AUDIT SEAL: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b78 │
│ Sanctioned By: CTRL-MUM-402 (Sr. DOM) | Timestamp: 2026-09-06 01:28:14 IST            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ CHRONOLOGICAL 4-STEP AI AUDIT TIMELINE:                                                │
│                                                                                        │
│ [1. MULTI-SOURCE INGESTION]                                                            │
│     Normalized 3 TMS defect markers, 1 TDMS 25kV power cut demand, and COA timetables. │
│                                                                                        │
│ [2. TRAFFIC CONFLICT & HEADWAY ANALYSIS]                                               │
│     Avoided 14:00 freight path bottleneck. Identified natural 3h 15m nocturnal lull.   │
│                                                                                        │
│ [3. JOINT SHADOW-BLOCK BUNDLING]                                                       │
│     Bundled OHE catenary wash with track tamping under single window; saved 85 mins.   │
│                                                                                        │
│ [4. SAFETY DISSEMINATION & SANCTION]                                                   │
│     Generated Kavach TSR 30 km/h, clamped Signal S-12 RED, and issued Form T/409.     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ACTIONS: [VERIFY SHA-256 HASH]  [EXPORT RDSO FORM 14B (PDF)]  [COPY AUDIT TOKEN]       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
