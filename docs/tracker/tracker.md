# RailSuraksha AI — Active Development Tracker

> **Location:** `docs/tracker/tracker.md`  
> **Status:** Active Sprint / Phase 1 Parallel Implementation (3 Developers)  
> **Last Updated:** 2026-08-21  

---

## 📌 Currently In Progress (Active Tasks)

| Task ID | Component | Description | Owner / Agent | Target Completion | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TSK-101** | Documentation | Complete PRD (`prd.md`), Architecture Pattern, & API Specifications | AI Assistant | Current Phase | ✅ Completed |
| **TSK-102** | Folder Architecture | Structure `docs/tracker`, `docs/context`, `docs/features_implemented` | AI Assistant | Current Phase | ✅ Completed |
| **TSK-103** | Parallel Plan | 3-Developer 2-Day Parallel Execution Plan & Contract Agreement | AI Assistant | Current Phase | ✅ Completed |
| **TSK-104** | Shared Types | Implement `src/types/apiContracts.ts` interface contracts | All 3 Devs | Day 1 Hour 1 | 🔄 In Progress |
| **TSK-105** | UI Components | Dev 1: Next.js Command Center Views & Mintlify Light-Blue styling | Dev 1 | Day 1 Hour 12 | ⏳ Pending |
| **TSK-106** | API Routes | Dev 2: REST & WebSocket Telemetry Endpoints | Dev 2 | Day 1 Hour 12 | ⏳ Pending |
| **TSK-107** | AI & Physics | Dev 3: Triage Classifier, RDSO EBD Physics & Decision Log Trace | Dev 3 | Day 1 Hour 12 | ⏳ Pending |

---

## 🎯 Active Development Backlog (Sprint 1 — 2-Day Division)

### 👤 Developer 1 (Frontend & UI Command Center Lead)
- [ ] Implement `src/types/apiContracts.ts` mock state.
- [ ] Build `Navbar.tsx` with live deployment mode switcher dropdown (`Advisory Mode (Phase 1)` vs `Autonomous Mode`).
- [ ] Build `InterlockingMap.tsx` displaying track circuits (`BLK-101`), signals (`S-12`/`S-14`), and switches (`P-4A`).
- [ ] Build `LocoCameraFeed.tsx` with bounding box overlays.
- [ ] Build `AgentPipelineCanvas.tsx` with step-by-step 4-agent animation canvas.
- [ ] Build `GatewayCctvFeed.tsx` & `HoldCountdown.tsx` 5-min timer ring.
- [ ] Build `DecisionLogModal.tsx` for auditor workspace.

### 👤 Developer 2 (Backend API & Telemetry Engine Lead)
- [ ] Setup `src/app/api/triage/` & `/braking/` REST endpoint routes.
- [ ] Build `src/server/wsServer.ts` real-time WebSocket telemetry broadcaster.
- [ ] Create SSE route `/api/v1/streams/loco-cab/stream` for simulated video frame metadata.
- [ ] Implement `src/services/store.ts` in-memory state manager.
- [ ] Wire Dev 3's pure agent functions into API route handlers.

### 👤 Developer 3 (AI Multi-Agent Engine & Computer Vision Specialist)
- [ ] Implement `src/lib/agents/triageAgent.ts` severity scoring logic (`CRITICAL`, `MODERATE`, `LOW`).
- [ ] Implement `src/lib/physics/ebdPhysicsEngine.ts` RDSO stopping distance formula $D_{\text{stop}}$.
- [ ] Implement `src/lib/agents/sectionDispatchAgent.ts` 5-min hold timer & Optical Flow density logic.
- [ ] Implement `src/lib/agents/explainableLogger.ts` 4-step decision log trace builder.
- [ ] Write unit tests for physics calculations and agent scoring.

---

## 📊 Sprint Velocity & Progress Metrics

- **Total Planned Tasks:** 15
- **Completed Tasks:** 3
- **In-Progress Tasks:** 1
- **Overall Completion:** 27%
