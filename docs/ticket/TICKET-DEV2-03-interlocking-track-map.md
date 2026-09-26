# 🎫 `TICKET-DEV2-03`: Section Interlocking & Track Circuit Schematic

- **Assignee:** Developer 2 (Collaborator)
- **Role:** Railway Interlocking Schematic & Signal Graphics
- **Status:** `BLOCKED` by `TICKET-DEV1-01`
- **Priority:** `P1 (High)`
- **Blocking For:** `TICKET-DEV1-05`
- **Reference Spec:** [`docs/12_screens.md#screen-2-section-interlocking--track-circuit-map`](../12_screens.md#screen-2-section-interlocking--track-circuit-map) & [`refactoring_plan.md#bead-4-sanctiongateagent`](../refactoring_plan.md#bead-4-sanctiongateagent)

---

## 🎯 Objective
Refactor `src/components/Overview/InterlockingMap.tsx` and create `src/components/Common/SignalHead.tsx` to provide a schematic view of track circuits `TC-01` through `TC-06` (CSMT $\to$ Dadar $\to$ Kalyan) with live axle counters, 4-aspect signal heads, and Form S&T/T-351 statutory lockout states.

---

## 📁 File Manifest
- **Modify:** `src/components/Overview/InterlockingMap.tsx`
- **Create:** `src/components/Common/SignalHead.tsx`
- **Test:** `tests/InterlockingMap.test.tsx`

---

## 📐 Circuit & Signal Schematic Specifications

### Track Circuit Blocks (`TC-01..TC-06`)
- `TC-01: CSMT` (KM 0.0 - 4.5)
- `TC-02: Byculla` (KM 4.5 - 9.0)
- `TC-03: Dadar` (KM 9.0 - 15.0) — *Primary Maintenance Worksite*
- `TC-04: Kurla` (KM 15.0 - 25.0) — *TSR 30 km/h Supervision Zone*
- `TC-05: Thane` (KM 25.0 - 42.0)
- `TC-06: Kalyan` (KM 42.0 - 54.0)

### State Color Tokens
- `CLEAR`: Green background `#ECFDF5`, Border `#A7F3D0`
- `OCCUPIED`: Yellow background `#FEF3C7`, Border `#FCD34D`
- `BLOCK_SANCTIONED`: Red background `#FEE2E2`, Border `#FCA5A5`, Pulsing Danger Border

### Signal Clamping & Lockout Indicator
- If `isSignalClamped = true`, display Signal `S-12` locked at `RED` with a closed padlock icon and Form `S&T/T-351` notice banner.

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Write test in `tests/InterlockingMap.test.tsx`**
  Verify circuit selection, signal aspect transitions, and lockout rendering.
- [ ] **Step 2: Implement `src/components/Common/SignalHead.tsx`**
  Render 4-aspect LED vertical head (`RED`, `YELLOW`, `DOUBLE_YELLOW`, `GREEN`).
- [ ] **Step 3: Refactor `src/components/Overview/InterlockingMap.tsx`**
- [ ] **Step 4: Run tests and verify PASS**
  Run `npx vitest run tests/InterlockingMap.test.tsx`.
- [ ] **Step 5: Commit**
  `git commit -m "feat(ui): implement track circuit interlocking schematic and signal heads"`

---

## ✅ Acceptance Criteria
1. Displays circuits `TC-01` to `TC-06` horizontally with correct station chainage offsets.
2. Clamping signal updates aspect to `RED` and displays the Form S&T/T-351 lockout badge.
