# 🎫 `TICKET-DEV1-06`: Dual-Mode API Data Client & Offline Fallback

- **Assignee:** Developer 1 (Lead / Core Architect)
- **Role:** Full-Stack API Integration & State Synchronization
- **Status:** `BLOCKED` by `TICKET-DEV1-01`
- **Priority:** `P1 (High)`
- **Blocking For:** `TICKET-DEV1-07`
- **Reference Spec:** [`refactoring_plan.md#bead-3-co-locationscheduleragent`](../refactoring_plan.md#bead-3-co-locationscheduleragent)

---

## 🎯 Objective
Implement `src/lib/apiClient.ts` to provide seamless dual-mode operation: calling the live FastAPI CP-SAT backend (`http://localhost:8000/api/optimize`) with automated retry/timeout, and falling back gracefully to local deterministic heuristic computation without throwing unhandled exceptions.

---

## 📁 File Manifest
- **Create/Modify:** `src/lib/apiClient.ts`
- **Test:** `tests/apiClient.test.ts`

---

## 📐 API Client Specifications

### Functions to Implement
1. `fetchActiveDemands(): Promise<MaintenanceDemand[]>`
2. `triggerCorridorOptimization(demands, policy): Promise<JointBlockSchedule>`
3. `sanctionMaintenanceBlock(blockId, operatorId): Promise<{ success: boolean; dossier: ExplainableDecisionDossier }>`
4. `fetchSectionInterlocking(sectionId: string): Promise<TrackCircuitState[]>`

### Fallback Architecture
- Try FastAPI endpoint at `NEXT_PUBLIC_API_URL || 'http://localhost:8000'`.
- Timeout: 5000ms.
- On Network Error / 5xx / Timeout: Execute client-side deterministic block bundling heuristic and log warning to console.

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Write unit tests in `tests/apiClient.test.ts`**
  Test both live API response mocking and fallback execution.
- [ ] **Step 2: Implement `src/lib/apiClient.ts`**
- [ ] **Step 3: Run tests and verify PASS**
  Run `npx vitest run tests/apiClient.test.ts`.
- [ ] **Step 4: Commit**
  `git commit -m "feat(api): implement dual-mode API data client with zero-fail fallback"`
