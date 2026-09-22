# IRIS AI — Engineering Rules, Grounded Invariants & Multi-Agent Protocols

**System Name:** IRIS AI (Intelligent Railway Inspection and Restoration AI): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.1.0 (Grounded Multi-Horizon & Decoupled Architecture Specification)  
**Governing Standards Reference:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0, and Google OR-Tools CP-SAT.

---

## 🏛️ 1. Multi-Agent Role Invariants (`wshobson-agents`)

When building or modifying IRIS AI, agents and developers must strictly operate within designated domain boundaries:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 MULTI-AGENT ROLE DIVISION                              │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 1. SYSTEM ARCHITECT        │ 2. DEVELOPER 1 (LEAD)      │ 3. DEVELOPER 2 (UI SURFACES) │
│ (Topology & Invariants)    │ (Core Layouts & Gantt)     │ (Queue, Dossiers, Badges)    │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • System Invariants & Spec │ • src/app/page.tsx         │ • src/components/Overview/** │
│ • src/types/apiContracts.ts│ • src/components/Planner/**│ • src/components/Auditor/**  │
│ • Database & API contracts │ • SVG Time-Distance Chart  │ • KpiStrip & IncidentQueue   │
│ • Decoupled Adapters/Policy│ • Horizon Switcher Sync    │ • DecisionLogModal           │
├────────────────────────────┴────────────────────────────┴──────────────────────────────┤
│ 4. DEVELOPER 3 (AI & SOLVER CORE)                                                      │
│ • src/lib/agents/** • src/lib/ingestion/** • Google OR-Tools CP-SAT Solver • Kavach TSR│
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 2. Grounding & Decoupling Mandates

1. **Grounded Core Foundation:**
   * **Multi-Horizon Rolling Framework (24h Tactical, 7D Operational, 30D Strategic)** is the core planning paradigm and must remain supported across all views.
   * **CP-SAT Disjunctive Interval Graph** is the optimization engine core.
2. **Decoupled & Swappable Domain Parameters:**
   * **Zero Hardcoding of Domain Rules:** All safety headways ($\Delta_{\text{clear}}$), earthing buffers ($\Delta_{\text{earth}}, \Delta_{\text{restore}}$), urgency weights ($w_s, w_d, w_c$), and speed limits ($V_{\text{TSR}}$) are injected dynamically via `DivisionalPolicyProfile`.
   * **Pluggable Ingestion Adapters:** All external data models must implement `IIngestionAdapter` with schema versioning and raw payload passthrough (`rawPayload`, `metadata`), enabling seamless migration from simulated datasets to live CRIS feeds without core solver refactoring.

---

## 🔒 3. Grounded Invariants & Policy-Driven Enforcement

### Invariant 1: Gradient-Aware Machine Siding Transit
* **Rule:** Heavy track machines (CSM tampers, BCM ballast cleaners) and Tower Wagons cannot teleport. Transit velocity between stations dynamically factors in locomotive power, track gradients ($G_s$), and curve resistance ($r_c$):
  $$V_{\text{transit}}(m, s) = \min\left( V_{\max}(m), \; \sqrt{\frac{P_{\text{engine}}(m)}{M_m \cdot (r_0 + g \cdot G_s + r_c)}} \right)$$
* **Constraint:** $t_{\text{WorkEnd}} + \text{GradientTransit}(m, G_s) + \Delta_{\text{clearance}}(\text{Policy}) \le t_{\text{NextTrainArrival}}$.

### Invariant 2: Multi-Department 2PC with G&SR 15.06 Private Number Fallback
* **Rule:** Block cancellation and line re-opening requires a Two-Phase Commit (2PC) from Civil, Electrical, and Signal supervisors via HMAC-SHA256 digital tokens.
* **Statutory Fallback:** If a field supervisor's mobile app goes offline for $> 10\text{ minutes}$ past scheduled block completion, the Station Master exchanges an authorized verbal **Private Number (PN)** via dedicated railway control phone and enters it with biometric authorization, immutably stamped with an `OFFLINE_STATUTORY_FALLBACK` audit flag.

### Invariant 3: Congestion-Preemptible Freeze-Band
* **Rule:** Maintenance windows are locked 48 hours prior to execution. However, if upstream network disruptions accumulate $> 45\text{ minutes}$ of passenger train delays:
  $$C_{\text{PassengerDelay}}(\Delta T) \gg \omega_{\text{shift}} \cdot |\Delta t_{\text{maintenance}}|^2$$
* **Action:** The solver automatically preempts the frozen P2/P3 maintenance window, rolls it forward to the next 7-day slot, and instantly releases line capacity for passenger traffic.

### Invariant 4: Approach-Locked Kavach Speed Supervision
* **Rule:** An optical signal aspect must **NEVER** be dropped to RED directly in the face of an approaching train ($D_{\text{train}} < D_{\text{EBD}}$), as this causes driver panic, emergency clamping, and false SPAD.
* **Action:** The system broadcasts the configured Temporary Speed Restriction ($30\text{ km/h}$) directly to the locomotive Kavach on-board unit (OBU). Kavach smoothly calculates and supervises the service braking deceleration curve inside the cab.

### Invariant 5: Continuous Soft Deadline Risk Relaxation
* **Rule:** In extreme weather (e.g., heavy monsoons causing 50 sections to degrade simultaneously), the solver must **NEVER** crash or return infeasible.
* **Action:** Soft deadlines ($\tau_i^S$) are modeled with continuous slack penalty variables ($q_i = \max(0, c_i - \tau_i^S)$). The solver optimizes up to physical machine throughput limits and injects fail-safe Kavach TSRs for any unserviced section.

### Invariant 6: Batched Corridor Review & Anti-Starvation Escalation
* **Rule:** Executive Section Controllers (`Sr. DOM`) must not suffer from alert fatigue.
* **Action:** Only P1 safety-critical flaws trigger immediate direct screen popups. Routine P3 items are aggregated into a single **Weekly Corridor Review Packet** presented at morning scheduling meetings.

### Invariant 7: Turnout-Coupled Topological Siding Reachability
* **Rule:** Machines must only be routed to sidings with verified physical route access and remaining clear standing length ($\sum \text{Length}(m) \le \text{ClearStandingLength}(S_k)$).

### Invariant 8: Assisted Clearance SLA for Heavy Track Machine Breakdowns
* **Rule:** If a heavy track tamper (CSM) or Tower Wagon suffers engine or hydraulic failure mid-possession:
* **Action:** If the machine fails to report nominal transit velocity $30\text{ minutes}$ prior to scheduled block expiry, the system alerts the nearest locomotive depot and section controller to attach an emergency shunting locomotive, preserving the downstream passenger clearance headway ($\Delta_{\text{clear}}$).

### Invariant 9: Mid-Block Sudden P1 Emergency Flaw Escalation
* **Rule:** If an acute rail fracture (USFD IMR) is detected inside an active block window or during clearance buffer:
* **Action:** The system dynamically adjusts the succeeding train path by issuing a dynamic loop line diversion or holding signals at double-yellow/yellow, simultaneously broadcasting a fail-safe $15\text{ km/h}$ crawling speed cap via Kavach TSRMS to approaching locomotives.

---

## 📝 4. Agent Project Memory & Persistent Handoff Rules

Every meaningful repository change must be recorded across the three persistent memory files:

1. **`context.md`:** Preserves stable, long-term project understanding (architecture, governing railway standards, data flows, invariants).
2. **`features_implemented.md`:** Current functional status of every feature (Implemented, In Progress, Planned).
3. **`tracker.md`:** Agent-to-agent handoff log documenting recent work, files changed, verification results, known issues, and precise next steps.


