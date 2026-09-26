# 🎫 `TICKET-DEV1-07`: Master Cockpit Assembly & Horizon Switcher

- **Assignee:** Developer 1 (Lead / Core Architect)
- **Role:** Master Cockpit Layout, Routing, Event Bus & State Orchestration
- **Status:** `BLOCKED` by `TICKET-DEV1-01` through `TICKET-DEV1-06`, and `TICKET-DEV2-01` through `TICKET-DEV2-03`
- **Priority:** `P0 (Terminal Integration)`
- **Reference Spec:** [`docs/12_screens.md`](../12_screens.md) & [`refactoring_plan.md#section-4-system-architecture`](../refactoring_plan.md#section-4-system-architecture)

---

## 🎯 Objective
Assemble `src/app/page.tsx`, `src/components/Navbar.tsx`, and `src/components/LocoCameraFeed.tsx` to unify the 3 tactical views:
1. **View 1: Corridor Planner (Marey String Chart + Demand Triage Queue)**
2. **View 2: Section Interlocking & Signal Schematic**
3. **View 3: Loco-Cab Forward Vision HUD (Kavach EBD overlay)**

---

## 📁 File Manifest
- **Modify:** `src/app/page.tsx`
- **Modify:** `src/components/Navbar.tsx`
- **Modify:** `src/components/LocoCameraFeed.tsx`
- **Test:** `tests/AppCockpit.test.tsx`

---

## 📐 Layout & State Specifications

### Tactical View Switching
- Primary navigation tab in `Navbar.tsx`:
  - `[📊 Corridor Planner (Marey)]`
  - `[🚦 Interlocking Map]`
  - `[🚆 Loco-Cab HUD (Kavach)]`

### Global Event Bus
- Sanctioning a block in `IncidentQueue.tsx` or `CorridorStringChart.tsx` triggers:
  1. Circuit state change in `InterlockingMap.tsx` (`TC-03` turns `BLOCK_SANCTIONED`, Signal `S-12` clamped to `RED`).
  2. TSR warning overlay in `LocoCameraFeed.tsx` (Speed Limit target clamped to $30\text{ km/h}$).
  3. Metric update in `KpiStrip.tsx` (Active Blocks incremented, Downtime Saved refreshed).
  4. Decision Dossier audit logged in `DecisionLogModal.tsx`.

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Write integration tests in `tests/AppCockpit.test.tsx`**
- [ ] **Step 2: Refactor `src/components/Navbar.tsx`**
- [ ] **Step 3: Refactor `src/components/LocoCameraFeed.tsx`**
- [ ] **Step 4: Refactor `src/app/page.tsx`**
- [ ] **Step 5: Run tests and verify PASS**
  Run `npm test`.
- [ ] **Step 6: Commit**
  `git commit -m "feat(cockpit): assemble master IRIS AI 3-view command center and sanction event bus"`
