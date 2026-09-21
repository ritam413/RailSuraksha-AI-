# RailSuraksha AI — User Journeys & Operational Workflows

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Governing Standards:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 🗺️ 1. Master Operational Journey Map

```mermaid
journey
    title Section Controller Daily Maintenance & Block Sanction Workflow
    section 1. Ingestion & Triage
      CRIS streams TMS flaws, TDMS wear, SMMS logs: 5: CRIS Systems
      Adapter maps KM chainage to Track Circuits: 5: RailSuraksha AI
      ML engine triages demands into P1, P2, P3 tiers: 5: RailSuraksha AI
    section 2. AI Optimization
      Solver identifies 01:30-04:45 AM white corridor: 5: CP-SAT Engine
      Civil, Electrical & S&T bundled into 1 shadow block: 5: CP-SAT Engine
      Corridor String Chart renders bundled window: 5: RailSuraksha AI
    section 3. Controller Sanction
      Controller reviews 38.4% downtime savings: 4: Section Controller
      Controller clicks [SANCTION BLOCK]: 5: Section Controller
    section 4. Safety & Actuation
      Kavach TSR 30 km/h pushed to approaching trains: 5: Kavach TCAS
      Electronic Interlocking clamps S-12 signal RED: 5: Station Interlocking
      Digital Form T/409 Caution Order generated: 5: RailSuraksha AI
      SHA-256 Decision Dossier sealed & archived: 5: Safety Auditor
```

---

## 🛤️ 2. Detailed End-to-End Operational Journeys

---

### Journey 1: Automated Multi-Department Bundling & Sanction (Happy Path)

* **Primary Persona:** Divisional Section Controller (`Sr. DOM`), Department Planners (Civil, Electrical, S&T).
* **Preconditions:** Daily sync from CRIS databases (TMS, TDMS, SMMS, COA) completed for CSMT–Kalyan corridor.

#### Step-by-Step Flow:
1. **Multi-Source Requisition Ingestion:**
   * Civil Engineering registers a track tamping demand on Section `KM 108/4 to 112/2` (TMS).
   * Electrical TRD registers a 25kV OHE catenary replacement demand on `KM 109/1 to 114/6` (TDMS).
   * S&T registers point machine `SW-04` stroke calibration on `KM 110/2 to 111/0` (SMMS).
2. **Spatial Chainage Normalization:**
   * The Unified Ingestion Adapter maps all three continuous linear chainages to logical track circuit **`TC-03`** (Dadar Section).
3. **ML Urgency Triage:**
   * Dynamic scoring categorizes demands as `P1_CRITICAL` (flaw score 0.94), `P2_SCHEDULED` (wear score 0.78), and `P2_SCHEDULED` (stroke score 0.72).
4. **CP-SAT Corridor Optimization:**
   * Google OR-Tools CP-SAT analyzes the COA train timetable and identifies an off-peak nocturnal white corridor between **01:30 IST and 04:45 IST** (195 minutes).
   * Bundles all three demands into a single **Joint Shadow Block (`BLK-JOINT-0906-01`)**.
   * Computes **85 minutes of saved downtime (38.4% reduction)** compared to 3 isolated blocks.
5. **Controller Review & Sanction:**
   * Section Controller views the proposed shaded rectangular block zone on the **Corridor Time-Distance String Chart**.
   * Clicks `[APPROVE & SANCTION BLOCK]`.
6. **Safety Dissemination & Lockout:**
   * Kavach TCAS broadcasts a digital $30\text{ km/h}$ Temporary Speed Restriction (TSR) to approaching train cabs.
   * Station Master interlocking console locks signal `S-12` to danger (`RED`) per **Form S&T/T-351**.
   * Digital **Form T/409 Caution Order** is distributed to loco pilots.
   * Decision Dossier is signed with **SHA-256 hash** and archived for RDSO Form 14B compliance.

---

### Journey 2: Emergency P1 USFD Rail Defect Interruption (Tactical Exception)

* **Primary Persona:** Section Controller, Locomotive Pilot, P-Way SSE.
* **Preconditions:** Normal daytime traffic running on Up Fast line.

#### Step-by-Step Flow:
1. **Defect Detection:**
   * Ultrasonic Flaw Detection (USFD) car identifies an **IMR** (*Immediate Removal*) transverse rail fracture on `TC-03` (`KM 108/6`).
2. **Instant Emergency Triage:**
   * ML Urgency Triage immediately flags the defect as **P1 Critical (Score 0.98)**.
3. **Automated Safety Protection:**
   * RailSuraksha AI immediately triggers an emergency Kavach TSR broadcast capping section speed to **$15\text{ km/h}$** per *IRPWM 2020*.
   * Approaching Locomotive Cab displays 1200Hz audible warning tone and overlays the safe deceleration braking curve.
4. **Dynamic Rescheduling:**
   * The CP-SAT solver automatically adjusts the tactical 24h schedule, routing freight rakes to loop sidings and allocating an emergency 60-minute clamping window in the nearest 45-minute traffic gap.

---

### Journey 3: Controller Block Rejection & Real-Time Re-Optimization

* **Primary Persona:** Divisional Section Controller.
* **Preconditions:** AI proposes a 02:00 AM joint block on Section B.

#### Step-by-Step Flow:
1. **Operational Conflict Identified:**
   * Controller notes that Premium Express Train #12138 is running 35 minutes behind schedule due to upstream weather delays.
2. **Controller Rejection:**
   * Controller clicks `[REJECT PROPOSED BLOCK]`.
   * Enters rejection reason: *"Express 12138 delayed; cannot clear section before 02:15 AM"*.
   * Sets preferred search constraint: *"Window after 02:45 AM"*.
3. **Automated Re-Optimization:**
   * The CP-SAT solver re-computes the corridor model in **$< 15\text{ seconds}$**.
   * Produces an adjusted 02:50 AM to 05:00 AM joint block window, preserving zero passenger delay while maintaining 100% of planned maintenance tasks.
4. **Sanction:** Controller approves the updated plan.

---

### Journey 4: Safety & Regulatory Compliance Audit Review

* **Primary Persona:** Safety Compliance Auditor / RDSO Inspector.
* **Preconditions:** Previous night's block operations completed.

#### Step-by-Step Flow:
1. **Auditor Log Access:**
   * RDSO Inspector logs into the **Auditor Workspace** and queries Block ID `BLK-JOINT-0906-01`.
2. **4-Step Explainable Audit Inspection:**
   * *Step 1 (Ingestion):* Verifies raw TMS flaw ticket, TDMS catenary log, and SMMS point notice.
   * *Step 2 (Conflict Check):* Verifies 15-minute passenger train clearance headway ($\Delta_{\text{clear}}$).
   * *Step 3 (Shadow Bundling):* Verifies that double-discharge earthing buffers ($\Delta_{\text{earth}} \ge 10\text{m}$) were scheduled.
   * *Step 4 (Safety Actuation):* Verifies that Kavach TSR 30 km/h was acknowledged by approaching train OBUs.
3. **Cryptographic Validation & Export:**
   * System verifies the SHA-256 digital seal matches the original timestamped record.
   * Auditor clicks `[EXPORT RDSO FORM 14B]`, generating an official signed compliance certificate.
