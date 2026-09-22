# IRIS AI — Technical Specification & Non-Functional Requirements

**System Name:** IRIS AI (Intelligent Railway Inspection and Restoration AI): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.1.0 (Grounded Multi-Horizon & Decoupled Architecture Specification)  
**Governing Standards Reference:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 💻 1. Core Technology Stack & Architectural Patterns

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TECHNOLOGY STACK MATRIX                              │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ LAYER                      │ PRIMARY TECHNOLOGY         │ KEY LIBRARIES & FRAMEWORKS   │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ Architecture Style         │ Hexagonal Ports & Adapters │ Pluggable Ingestion/Actuation│
│ Frontend Web App           │ Next.js 16 (App Router)    │ React 19, TypeScript 5+      │
│ Styling & Tokens           │ Tailwind CSS v4            │ Vanilla CSS, Mintlify Theme  │
│ Charts & Graph Visualizer  │ High-Performance SVG / D3  │ Lucide React, Framer Motion  │
│ Backend API Services       │ FastAPI (Python 3.12) / TS │ Pydantic v2, Uvicorn, SSE    │
│ Mathematical Solver        │ Google OR-Tools CP-SAT     │ ortools.sat.python.cp_model  │
│ Policy & Config Engine     │ Externalized Config/JSONB  │ Pydantic Settings, Redis 7   │
│ Graph Topology             │ NetworkX 3.2+              │ Track Circuit Adjacency DAG  │
│ Audio Synthesizer          │ Pure Web Audio API         │ 800Hz / 1200Hz RDSO Chimes   │
│ Persistence & Cache        │ PostgreSQL 16 / Redis 7    │ Prisma ORM / pgvector        │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

---

## 🔌 2. Decoupled Architecture & Pluggability Engine

### 2.1 Pluggable Ingestion Interface (`IIngestionAdapter`)
All external data feeds are ingested through strongly-typed abstraction interfaces:
```typescript
export interface IIngestionAdapter<TRawPayload, TNormalizedEntity> {
  readonly adapterName: string;
  readonly schemaVersion: string;
  validate(raw: TRawPayload): Promise<boolean>;
  normalize(raw: TRawPayload, policy: DivisionalPolicyProfile): Promise<TNormalizedEntity[]>;
}
```
* **Simulation Adapter:** Generates grounded synthetic corridor feeds (CSMT–Kalyan) for rapid local development and demo testing.
* **Configurable File/CSV Adapter:** Ingests ad-hoc division CSV/JSON export files with mapping profiles.
* **Enterprise CRIS Adapter:** Connects to live TMS, TDMS, SMMS, and COA REST/SOAP endpoints without altering core solver logic.

### 2.2 Externalized Policy & Constraint Engine (`PolicyConfigService`)
* **No Hardcoded Domain Rules:** All safety headways ($\Delta_{\text{clear}}$), earthing buffers ($\Delta_{\text{earth}}, \Delta_{\text{restore}}$), urgency weight factors ($w_s, w_d, w_c$), and speed caps ($V_{\text{TSR}}$) are injected via `DivisionalPolicyProfile`.
* **Runtime Calibration:** Division controllers can adjust safety buffers per division or weather season without code re-deployment.

---

## ⚡ 3. Non-Functional Requirements & Performance SLAs

### 3.1 Optimization Engine Performance SLAs `[Grounded Core]`
* **Multi-Horizon Solve Latency:**
  * **24-Hour Tactical Horizon:** Returns verified optimal or near-optimal ($< 2\%\text{ gap}$) block plan in **$< 30\text{ seconds}$** for a 100km corridor.
  * **7-Day Operational Horizon:** Solves weekly rolling corridor maintenance in **$< 90\text{ seconds}$**.
  * **30-Day Strategic Horizon:** Solves monthly cyclical maintenance in **$< 180\text{ seconds}$**.
* **Emergency Flaw Re-Optimization:** Upon sudden P1 rail defect insertion, solver re-routing must complete in **$< 15\text{ seconds}$**.
* **Solver Determinism & Feasibility:** Incorporates continuous soft slack penalties ($q_i = \max(0, c_i - \tau_i^S)$) ensuring it never crashes or returns an empty/infeasible result under extreme network degradation.

### 3.2 Frontend Responsiveness & Rendering Performance
* **SVG String Chart Smoothness:** Must maintain **60 fps** hardware-accelerated rendering during time-scrubbing, zooming, and panning.
* **Zero Cumulative Layout Shift (CLS):** Dynamic train path line rendering must not cause layout jumping ($\text{CLS} < 0.05$).
* **First Contentful Paint (FCP):** $\text{FCP} < 1.2\text{ seconds}$ on standard railway division broadband networks.

### 3.3 Real-Time Safety & Actuation Latencies
* **Kavach TSR Broadcast Packet Generation:** $\le 200\text{ ms}$ from Section Controller click to wireless packet emission.
* **Electronic Interlocking Clamping:** Relay lockout status updated across all connected client interfaces in $\le 500\text{ ms}$ via WebSockets.

---

## 🔒 4. Security, Integrity & Compliance Architecture

### 4.1 Cryptographic Audit Trail (RDSO Form 14B)
* Every sanctioned block plan produces an immutable 4-step explainable record sealed with a **`SHA-256`** hash:
  $$\text{AuditSeal} = \text{SHA256}(\text{BlockId} + \text{OperatorId} + \text{Timestamp} + \text{BundledDemands} + \text{TSRSpeed} + \text{PolicyVersion})$$
* Tamper detection: Any modification to underlying work order times or policy profiles invalidates the cryptographic verification signature.

### 4.2 Fail-Safe Architectural Defaults
* **Signal Aspect Clamping:** In the event of system network loss or database disconnection, all active maintenance block signals default to danger (`RED`) in fail-safe relay logic.
* **Kavach ATP Speed Supervision:** Onboard locomotive Kavach units enforce speed restrictions until explicit, verified digital clearance is received from the Radio Block Center (RBC).

### 4.3 Role-Based Access Control (RBAC)
* Strict JWT session-based token authentication separating `SECTION_CONTROLLER` sanction rights from `DEPARTMENT_PLANNER` submission rights, `POLICY_ADMINISTRATOR` tuning rights, and `SAFETY_AUDITOR` inspection privileges.
