# RailSuraksha AI — Technical Specification & Non-Functional Requirements

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Governing Standards:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 💻 1. Core Technology Stack

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   TECHNOLOGY STACK MATRIX                              │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ LAYER                      │ PRIMARY TECHNOLOGY         │ KEY LIBRARIES & FRAMEWORKS   │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ Frontend Web App           │ Next.js 16 (App Router)    │ React 19, TypeScript 5+      │
│ Styling & Tokens           │ Tailwind CSS v4            │ Vanilla CSS, Mintlify Theme  │
│ Charts & Graph Visualizer  │ High-Performance SVG / D3  │ Lucide React, Framer Motion  │
│ Backend API Services       │ FastAPI (Python 3.12) / TS │ Pydantic v2, Uvicorn, SSE    │
│ Mathematical Solver        │ Google OR-Tools CP-SAT     │ ortools.sat.python.cp_model  │
│ Graph Topology             │ NetworkX 3.2+              │ Track Circuit Adjacency DAG  │
│ Audio Synthesizer          │ Pure Web Audio API         │ 800Hz / 1200Hz RDSO Chimes   │
│ Persistence & Cache        │ PostgreSQL 16 / Redis 7    │ Prisma ORM / pgvector        │
└────────────────────────────┴────────────────────────────┴──────────────────────────────┘
```

---

## ⚡ 2. Non-Functional Requirements & Performance SLAs

### 2.1 Optimization Engine Performance SLAs
* **Solve Latency:** Google OR-Tools CP-SAT solver must return a verified optimal or near-optimal ($< 2\%\text{ gap}$) joint corridor block plan in **$< 30\text{ seconds}$** for a 100km corridor over a 24-hour tactical horizon.
* **Emergency Flaw Re-Optimization:** Upon sudden P1 rail defect insertion, solver re-routing must complete in **$< 15\text{ seconds}$**.
* **Solver Determinism & Feasibility:** The solver must incorporate continuous soft slack penalties ($q_i = \max(0, c_i - \tau_i^S)$) ensuring it never crashes or returns an empty/infeasible result under extreme network degradation.

### 2.2 Frontend Responsiveness & Rendering Performance
* **SVG String Chart Smoothness:** Must maintain **60 fps** hardware-accelerated rendering during time-scrubbing, zooming, and panning.
* **Zero Cumulative Layout Shift (CLS):** Dynamic train path line rendering must not cause layout jumping ($\text{CLS} < 0.05$).
* **First Contentful Paint (FCP):** $\text{FCP} < 1.2\text{ seconds}$ on standard railway division broadband networks.

### 2.3 Real-Time Safety & Actuation Latencies
* **Kavach TSR Broadcast Packet Generation:** $\le 200\text{ ms}$ from Section Controller click to wireless packet emission.
* **Electronic Interlocking Clamping:** Relay lockout status updated across all connected client interfaces in $\le 500\text{ ms}$ via WebSockets.

---

## 🔒 3. Security, Integrity & Compliance Architecture

### 3.1 Cryptographic Audit Trail (RDSO Form 14B)
* Every sanctioned block plan produces an immutable 4-step explainable record sealed with a **`SHA-256`** hash:
  $$\text{AuditSeal} = \text{SHA256}(\text{BlockId} + \text{OperatorId} + \text{Timestamp} + \text{BundledDemands} + \text{TSRSpeed})$$
* Tamper detection: Any modification to underlying work order times invalidates the cryptographic verification signature.

### 3.2 Fail-Safe Architectural Defaults
* **Signal Aspect Clamping:** In the event of system network loss or database disconnection, all active maintenance block signals default to danger (`RED`) in fail-safe relay logic.
* **Kavach ATP Speed Supervision:** Onboard locomotive Kavach units enforce speed restrictions until explicit, verified digital clearance is received from the Radio Block Center (RBC).

### 3.3 Role-Based Access Control (RBAC)
* Strict JWT session-based token authentication separating `SECTION_CONTROLLER` sanction rights from `DEPARTMENT_PLANNER` submission rights and `SAFETY_AUDITOR` inspection privileges.
