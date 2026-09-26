# 🎫 `TICKET-DEV2-02`: Multi-Department Demand Queue & Triage Component

- **Assignee:** Developer 2 (Collaborator)
- **Role:** Interactive UI Components & Triage
- **Status:** `BLOCKED` by `TICKET-DEV1-01`
- **Priority:** `P1 (High)`
- **Blocking For:** `TICKET-DEV2-04`, `TICKET-DEV1-05`
- **Reference Spec:** [`docs/13_component.md#incidentqueue`](../13_component.md#incidentqueue) & [`refactoring_plan.md#bead-2-urgencytriageagent`](../refactoring_plan.md#bead-2-urgencytriageagent)

---

## 🎯 Objective
Refactor `src/components/Overview/IncidentQueue.tsx` and build `src/components/Overview/DemandRowItem.tsx` and `src/components/Common/UrgencyBadge.tsx` to present incoming Civil, Electrical, and Signal maintenance requisitions with filter tabs and one-click sanction action buttons.

---

## 📁 File Manifest
- **Modify:** `src/components/Overview/IncidentQueue.tsx`
- **Create:** `src/components/Overview/DemandRowItem.tsx`
- **Create:** `src/components/Common/UrgencyBadge.tsx`
- **Test:** `tests/IncidentQueue.test.tsx`

---

## 📐 Component Specification

### Department Tags
- `TMS_CIVIL`: Crimson text `#991B1B`, Background `#FEE2E2`, Border `#FCA5A5`
- `TDMS_ELECTRICAL`: Amber text `#92400E`, Background `#FEF3C7`, Border `#FCD34D`
- `SMMS_SIGNAL`: Blue text `#1E40AF`, Background `#DBEAFE`, Border `#93C5FD`

### Filter Tabs
`[All]`, `[TMS Civil]`, `[TDMS OHE]`, `[SMMS Signal]`, `[P1 Only]`

### Row Actions
- Display Track Circuit (`TC-03`), Chainage (`KM 9.2`), Estimated Duration (`90m`), Power Block requirement icon (`⚡`).
- Action Button: `[APPROVE & SANCTION BLOCK]` with 4px radius.

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Write unit test in `tests/IncidentQueue.test.tsx`**
  Verify department filtering and `onSanction(demandId)` click trigger.
- [ ] **Step 2: Implement `src/components/Common/UrgencyBadge.tsx`**
- [ ] **Step 3: Implement `src/components/Overview/DemandRowItem.tsx`**
- [ ] **Step 4: Refactor `src/components/Overview/IncidentQueue.tsx`**
- [ ] **Step 5: Run tests and verify PASS**
  Run `npx vitest run tests/IncidentQueue.test.tsx`.
- [ ] **Step 6: Commit**
  `git commit -m "feat(ui): implement multi-department demand triage queue"`

---

## ✅ Acceptance Criteria
1. Filters demands by department and priority tier instantaneously.
2. Clicking `[APPROVE & SANCTION BLOCK]` invokes the parent callback with the target `demandId`.
