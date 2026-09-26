# 🎫 `TICKET-DEV1-05`: Master 3-View Cockpit & Horizon Switcher Assembly

- **Assignee:** Developer 1 (Lead Integrator)
- **Role:** Page Orchestration & App Integration
- **Status:** `BLOCKED` by all Developer 1 and Developer 2 tickets
- **Priority:** `P0 (Terminal Integration)`
- **Unblocks:** Release & Live Pitch Presentation
- **Reference Spec:** [`docs/12_screens.md#screen-1-master-corridor-block-command-cockpit`](../12_screens.md#screen-1-master-corridor-block-command-cockpit)

---

## 🎯 Objective
Assemble all Developer 1 and Developer 2 components into the Master IRIS AI Command Cockpit (`src/app/page.tsx`) with 3 tactical view switchers, a top navigation bar with rolling horizon tabs (`[24h Tactical]`, `[7D Operational]`, `[30D Strategic]`), and global sanction event handling.

---

## 📁 File Manifest
- **Modify:** `src/app/page.tsx`
- **Modify:** `src/components/Navbar.tsx`
- **Test:** `tests/MainCockpit.test.tsx`

---

## 📐 Layout & Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR: [IRIS AI Auto-BDMS] | [24h Tactical | 7D | 30D] | [Mode: Advisory]     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TACTICAL VIEW SWITCHER:                                                                │
│   [1. Master Corridor Planner]  [2. Interlocking Map]  [3. Cab Vision & Kavach HUD]    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ KPI STRIP (Dev 2): [38.4% Downtime Saved] [96.2% Availability] [03 Blocks] [08 Demands]│
├──────────────────────────────────────────────────────────┬─────────────────────────────┤
│ VIEW 1: CORRIDOR MAREY STRING CHART (Dev 1)              │ DEPARTMENT DEMAND QUEUE     │
│         Time vs. Distance with Shaded Shadow Blocks      │ (Dev 2): Filter by TMS/SMMS │
├──────────────────────────────────────────────────────────┴─────────────────────────────┤
│ MODAL: EXPLAINABLE DECISION DOSSIER (Dev 2)                                            │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Update `src/components/Navbar.tsx`**
  Add Horizon Switcher buttons and Mode Toggle (`ADVISORY` / `AUTONOMOUS`).
- [ ] **Step 2: Implement `src/app/page.tsx`**
  Import and wire:
  - `KpiStrip` (from `src/components/Overview/KpiStrip`)
  - `CorridorStringChart` (from `src/components/Planner/CorridorStringChart`)
  - `IncidentQueue` (from `src/components/Overview/IncidentQueue`)
  - `InterlockingMap` (from `src/components/Overview/InterlockingMap`)
  - `LocoCameraFeed` (from `src/components/LocoCameraFeed`)
  - `DecisionLogModal` (from `src/components/Auditor/DecisionLogModal`)
- [ ] **Step 3: Wire `handleSanctionBlock(blockId)`**
  Atomically update interlocking state to `BLOCK_SANCTIONED` and open the Decision Log Modal.
- [ ] **Step 4: Run full test suite**
  Run `npm test`.
- [ ] **Step 5: Commit**
  `git commit -m "feat(cockpit): assemble master 3-view command center and horizon switcher"`

---

## ✅ Acceptance Criteria
1. Seamless tab switching between the 3 views with zero layout shifts.
2. Horizon tabs update time scales dynamically.
3. Sanctioning a block updates interlocking status and displays the SHA-256 decision dossier.
