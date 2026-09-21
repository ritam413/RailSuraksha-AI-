# RailSuraksha AI — User Personas & Role-Based Access Control (RBAC)

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Governing Standards:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 👥 1. Target User Personas

RailSuraksha AI serves four key operational personas operating across Divisional Headquarters, Maintenance Depots, Control Rooms, and Locomotive Cabs:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               OPERATIONAL PERSONA MATRIX                               │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 1. SECTION CONTROLLER      │ 2. DEPARTMENT PLANNERS     │ 3. SAFETY COMPLIANCE AUDITOR │
│ (Sr. DOM / Section Desk)   │ (Civil, Electrical, S&T)   │ (RDSO / CRS Inspector)       │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • Command Center Cockpit   │ • Department Work Queue    │ • Decision Dossier Drawer    │
│ • String Chart Review      │ • Machine Gang Rosters     │ • SHA-256 Audit Seal Verify  │
│ • One-Click Block Sanction │ • Joint Bundling Proposal  │ • RDSO Form 14B Certificate  │
├────────────────────────────┴────────────────────────────┴──────────────────────────────┤
│ 4. FIELD OPERATORS & LOCOMOTIVE PILOTS (Loco Cab & Station Master Console)             │
│ • Kavach Wireless TSR Display (30 km/h) • Form S&T/T-351 Signal Clamping Verification  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Persona 1: Divisional Section Controller (Sr. DOM / Section Dispatcher)
* **Title:** Senior Divisional Operations Manager (Sr. DOM) / Section Controller
* **Operational Setting:** Divisional Railway Control Office (Operating Directorate)
* **Core Responsibilities:**
  * Supervises real-time corridor throughput across 100+ route kilometers.
  * Resolves train precedence (Rajdhani/Vande Bharat > Express > Freight).
  * Evaluates and sanctions track possessions (Traffic & Power Blocks) via COA and e-BDMS.
* **Pain Points with Legacy System:**
  * Overwhelmed by fragmented, uncoordinated block memos from three separate departments.
  * Fear of causing train punctuality losses leads to rejecting critical maintenance blocks.
  * Lacks visual decision-support tools to identify natural traffic gaps in train charts.
* **Key RailSuraksha AI Features Used:**
  * **Corridor Time-Distance String Chart (`CorridorStringChart.tsx`):** Real-time visual comparison of train paths vs bundled block windows.
  * **One-Click Sanction Gate:** Approves AI-optimized joint shadow blocks with automatic safety dispatch.
  * **Advisory vs. Autonomous Mode Toggle:** Switches between human-in-the-loop sanctioning and automated rule-based approval.

---

### Persona 2: Departmental Maintenance Planners (P-Way, TRD, S&T SSEs)
* **Titles:** 
  * Senior Section Engineer (P-Way / Civil) — TMS
  * Senior Section Engineer (TRD / Electrical) — TDMS
  * Senior Section Engineer (Signal / S&T) — SMMS
* **Operational Setting:** Divisional Engineering Maintenance Depots
* **Core Responsibilities:**
  * Enters track flaw tickets (USFD IMR/OBS/REM), 25kV OHE catenary wear logs, and point machine overhauls.
  * Schedules heavy machinery (Continuous Action Tampers - CSM, Ballast Cleaners - BCM, Tower Wagons) and manpower gangs.
* **Pain Points with Legacy System:**
  * Sits through contentious divisional daily block meetings where requisitions are routinely curtailed or rejected.
  * Civil gangs and Tower Wagons sit idle waiting for separate block possessions on the same track.
* **Key RailSuraksha AI Features Used:**
  * **Department Demand Queue (`IncidentQueue.tsx`):** Tracks demand status (`PENDING_TRIAGE`, `SLOTTED`, `SANCTIONED`).
  * **Shadow-Block Bundling View:** Reviews co-location proposals where Civil and S&T share an electrical power cut window.
  * **Machine Transit Coordinator:** Verifies track machine transit times and siding reachability.

---

### Persona 3: Safety Compliance Auditor / RDSO Inspector
* **Title:** Commissioner of Railway Safety (CRS) Inspector / RDSO Safety Auditor
* **Operational Setting:** Zonal Headquarters / RDSO Directorate
* **Core Responsibilities:**
  * Audits block execution logs, safety clearance headways ($\ge 15\text{ min}$), and interlocking lockouts.
  * Investigates safety anomalies, signal passing at danger (SPAD), and track maintenance compliance.
* **Pain Points with Legacy System:**
  * Paper-based registers and fragmented logs make post-incident root cause analysis tedious and error-prone.
  * Inability to verify whether drivers complied with Temporary Speed Restrictions (TSRs).
* **Key RailSuraksha AI Features Used:**
  * **Explainable AI Decision Dossier (`DecisionLogModal.tsx`):** 4-step chronological audit trail (Ingestion $\to$ Conflict Check $\to$ Shadow Bundling $\to$ Safety Sanction).
  * **SHA-256 Digital Verification:** Verifies cryptographic integrity of sanction logs.
  * **RDSO Form 14B Certificate Generator:** One-click PDF/JSON export of certified compliance documents.

---

### Persona 4: Locomotive Pilot & Station Master (Field Operations)
* **Titles:** Loco Pilot (Driver) / Station Master (SM)
* **Operational Setting:** Locomotive Cab / Station Interlocking Control Room
* **Core Responsibilities:**
  * Safely navigates trains through active maintenance zones according to signaling aspects and caution orders.
  * Station Master ensures physical track possession and clamps signals/turnouts per *G&SR Chapter 15*.
* **Pain Points with Legacy System:**
  * Relying on physical paper Caution Orders (**Form T/409**) handed over at preceding stations.
  * Risk of unexpected signal drops in driver face causing false SPAD or emergency braking.
* **Key RailSuraksha AI Features Used:**
  * **Kavach TCAS Wireless TSR Stream:** Receives digital $30\text{ km/h}$ speed caps directly into the locomotive cab onboard unit.
  * **Station Interlocking State View (`InterlockingMap.tsx`):** Verifies electronic interlocking lockout (**Form S&T/T-351**) and signal danger clamps (`S-12/14`).

---

## 🔐 2. Role-Based Access Control (RBAC) Matrix

RailSuraksha AI enforces strict Role-Based Access Control across all UI routes and API actions:

| Functional Capability / UI Action | `SECTION_CONTROLLER` | `DEPARTMENT_PLANNER` | `SAFETY_AUDITOR` | `FIELD_OPERATOR` |
| :--- | :---: | :---: | :---: | :---: |
| **View Master Cockpit & String Chart** | ✅ Full Access | ✅ Full Access | ✅ Read-Only | ✅ View Only |
| **View 6-Card KPI Strip** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Submit Maintenance Work Order (TMS/TDMS/SMMS)** | ❌ Read-Only | ✅ Full Access | ❌ No Access | ❌ No Access |
| **Execute Block Sanction (`[SANCTION BLOCK]`)** | ✅ Full Access | ❌ No Access | ❌ No Access | ❌ No Access |
| **Reject Proposed Block with Justification** | ✅ Full Access | ❌ No Access | ❌ No Access | ❌ No Access |
| **Toggle Advisory vs Autonomous Mode** | ✅ Full Access (Sr. DOM) | ❌ No Access | ❌ No Access | ❌ No Access |
| **Trigger Solver Re-Optimization** | ✅ Full Access | ✅ Trigger Request | ❌ No Access | ❌ No Access |
| **View Track Interlocking & Signal States** | ✅ Full Access | ✅ View Only | ✅ View Only | ✅ Full Access |
| **Receive Kavach TSR Broadcast Packets** | ✅ Telemetry View | ✅ Status View | ✅ Telemetry View | ✅ Cab HUD Stream |
| **Inspect SHA-256 Decision Dossier** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ❌ Summary View |
| **Export RDSO Form 14B Safety Certificate** | ✅ Export Access | ❌ View Only | ✅ Full Export & Sign | ❌ No Access |

---

## 🛡️ 3. Authentication & Authorization Security Invariants

1. **Dual-Factor Sanction Authorization:** Critical block sanctions on trunk routes require cryptographic token validation tied to the active Section Controller session.
2. **Statutory Verbal Fallback Logging (G&SR 15.06):** In case of field mobile supervisor disconnection, the Station Master inputs a verified **Private Number (PN)** into the console, which is immutably stamped with an `OFFLINE_STATUTORY_FALLBACK` audit flag.
3. **Fail-Safe Principle:** If user session or network link terminates unexpectedly, all active interlocking clamps and Kavach Temporary Speed Restrictions remain rigidly enforced at their most restrictive safety state until formally unlocked.
