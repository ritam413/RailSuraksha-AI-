# 🎫 `TICKET-DEV2-01`: 6-Metric Block Planning KPI Strip

- **Assignee:** Developer 2 (Collaborator)
- **Role:** UI Layouts & Operational Metrics
- **Status:** `BLOCKED` by `TICKET-DEV1-01`
- **Priority:** `P1 (High)`
- **Blocking For:** `TICKET-DEV1-05`
- **Reference Spec:** [`docs/13_component.md#kpi-strip`](../13_component.md#kpi-strip) & [`.agents/rules/dev2.md`](../../.agents/rules/dev2.md)

---

## 🎯 Objective
Refactor `src/components/Overview/KpiStrip.tsx` and create `src/components/Overview/KpiCard.tsx` to display the 6 core operational metrics of IRIS AI following the Light-Blue Mintlify design system.

---

## 📁 File Manifest
- **Modify:** `src/components/Overview/KpiStrip.tsx`
- **Create:** `src/components/Overview/KpiCard.tsx`
- **Test:** `tests/KpiStrip.test.tsx`

---

## 📐 Metric Card Specifications

The strip must render **6 distinct operational cards**:
1. **Corridor Downtime Saved:** `38.4%` (Shadow Blocking ROI badge)
2. **Track Availability Index:** `96.2%` (Target $> 95\%$)
3. **Active Corridor Blocks:** `03 Active` (Nocturnal possessory windows)
4. **Pending Demands:** `08 In Queue` (Civil + Electrical + S&T)
5. **White Corridor Headway Gap:** `3h 15m` (Next available lull: 01:30 - 04:45)
6. **Active Kavach TSRs:** `02 Enforced` ($30\text{ km/h}$ speed supervision)

### Styling Discipline
- Card Base: `#FFFFFF` with 1px border `#D0DFEE`
- Radius: `16px` outer card, strictly `4px` inner buttons/badges (zero pill buttons)
- Typography: Slate-800 font-semibold for values, Slate-500 font-medium for labels.

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Write KPI strip test in `tests/KpiStrip.test.tsx`**
  Verify all 6 metrics, trend badges, and format strings render.
- [ ] **Step 2: Implement `src/components/Overview/KpiCard.tsx`**
- [ ] **Step 3: Refactor `src/components/Overview/KpiStrip.tsx`**
  Consume `CorridorKpiMetrics` and fall back to `MOCK_CORRIDOR_KPIS`.
- [ ] **Step 4: Run tests and verify PASS**
  Run `npx vitest run tests/KpiStrip.test.tsx`.
- [ ] **Step 5: Commit**
  `git commit -m "feat(ui): update KPI strip with IRIS AI block planning metrics"`

---

## ✅ Acceptance Criteria
1. Renders 6 responsive cards cleanly on desktop and tablet.
2. Zero pill buttons or unstyled raw text.
