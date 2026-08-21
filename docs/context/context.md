# RailSuraksha AI — Context & Architectural Decisions (ADR)

> **Location:** `docs/context/context.md`  
> **Purpose:** Immutable record of project context, architectural decisions made, design tokens, and domain rules.  
> **Last Updated:** 2026-08-21  

---

## 🏛️ Architectural Context & Vision

**RailSuraksha AI (रेल-सुरक्षा)** is a national-grade railway operations command center combined with an AI multi-agent safety ecosystem designed for Indian Railways.

### Key Contextual Problems & Solutions:
1. **Platform Stampede Prevention:**  
   - *Problem:* Simultaneous train arrivals on adjacent platforms (e.g., Platforms 17 & 18) sharing a common foot-over-bridge (FOB) cause catastrophic crowd surges.
   - *Solution:* Enforces a **5-Minute Deterministic Hold Floor** on incoming adjacent trains. Extended dynamically if ML optical flow detects overcrowding at platform staircases.

2. **Continuous Visual Track Inspection:**  
   - *Problem:* USFD (Ultrasonic Flaw Detection) rail testing vehicles operate on periodic schedules (weeks apart). Mid-frequency hazards (boulders, rail fractures, cattle) occur unpredictably.
   - *Solution:* Front-facing locomotive camera feeds with edge YOLOv11 hazard detection running continuously during revenue service.

3. **Deterministic Emergency Braking (Kavach Physics Integration):**  
   - *Problem:* Probabilistic AI models should never directly actuate emergency brakes without deterministic safety guarantees.
   - *Solution:* AI vision passes obstacle distance ($D_{\text{obstacle}}$) to the **Kavach Braking Agent**, which executes the certified RDSO Emergency Braking Distance (EBD) formula ($D_{\text{stop}}$) to trigger braking commands.

---

## 📜 Architectural Decision Records (ADRs)

### ADR-001: Light-Blue Mintlify Design System Selection
- **Status:** APPROVED
- **Date:** 2026-08-20
- **Context:** Generic dark mode SaaS themes or busy e-commerce aesthetics degrade situational awareness in high-stress railway control rooms.
- **Decision:** Adopt a **Pristine Light-Blue Command Center Aesthetic** built on Mintlify spatial discipline:
  - Base Canvas (Surface 0): `#F0F6FC` (Ice Blue Canvas)
  - Card/Panel (Surface 1): `#FFFFFF` (Pure White with `#D0DFEE` border)
  - Elevated Tabs/Inputs (Surface 2): `#E6F0FA`
  - Primary Accent: `#2B7FFF` (Signal Blue)
  - Text Primary: `#0F172A` (Ink Slate)
  - Component Geometry: 4px button/input radius, 16px card radius, 24px container radius (Strictly ZERO pill buttons).

### ADR-002: Advisory Mode (Phase 1) vs Autonomous Mode Governance
- **Status:** APPROVED
- **Date:** 2026-08-20
- **Context:** Safety regulations (RDSO / Railway Board) mandate human-in-the-loop oversight before automated system intervention is fully certified.
- **Decision:** Implement a global **Deployment Mode Switcher**:
  - **Advisory Mode (Phase 1):** AI recommendations present an action gate requiring human Station Master / Controller approval (`[APPROVE ACTION]`).
  - **Autonomous Mode (Post-RDSO Cert):** Direct automatic execution for critical emergency braking and signal locks, while still outputting explainable audit logs.

### ADR-003: 4-Agent Sequential Safety Pipeline
- **Status:** APPROVED
- **Date:** 2026-08-21
- **Context:** Complex AI decisions need clear, explainable stages for dispatchers and auditors.
- **Decision:** Structure the safety pipeline into 4 distinct agent steps:
  1. **Agent 1 (Vision Hazard Detector):** YOLOv11 detection on camera feed.
  2. **Agent 2 (Telemetry Aggregator):** Train speed ($V$), mass ($M$), friction ($\mu$).
  3. **Agent 3 (Kavach Braking Agent):** Calculates RDSO stopping distance ($D_{\text{stop}}$).
  4. **Agent 4 (Auto-Brake Actuator):** Dispatches brake solenoid signals & alerts dispatcher.

### ADR-004: Explicit Scope Exclusions
- **Status:** APPROVED
- **Date:** 2026-08-21
- **Decision:** Explicitly exclude passenger coach interior seat diagrams, individual facial recognition, and generic financial/marketing analytics widgets to maintain strict focus on track & platform safety.

---

## 🛠️ Technology Stack Decisions

- **Frontend Framework:** Next.js 16 (React 19), App Router
- **Styling & Design Tokens:** Tailwind CSS v4, Vanilla CSS variables, Lucide React Icons
- **Real-time Telemetry:** WebSockets / Server-Sent Events (SSE)
- **Computer Vision Inference:** ONNX Runtime Web / YOLOv11 + Optical Flow
- **Typography:** `Inter` (sans-serif) for primary interface, `JetBrains Mono` for telemetry metadata & signal IDs.
