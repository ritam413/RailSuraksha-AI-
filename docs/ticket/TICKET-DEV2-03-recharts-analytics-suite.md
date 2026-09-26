# 🎫 `TICKET-DEV2-03`: Recharts Analytics Suite (Kavach Deceleration Curve & Triage Donut)

- **Assignee:** Developer 2 (Collaborator)
- **Role:** Data Visualization & Analytical Dashboards
- **Status:** `COMPLETE`
- **Priority:** `P2 (Medium)`
- **Blocking For:** `TICKET-DEV1-07`
- **Reference Spec:** [`docs/12_screens.md#screen-5-kavach-physics--braking-curve-visualizer`](../12_screens.md#screen-5-kavach-physics--braking-curve-visualizer)

---

## 🎯 Objective
Create `src/components/Charts/DecelerationCurve.tsx` and `src/components/Charts/TriageDonut.tsx` using `recharts` to render the RDSO Kavach Emergency Braking Distance (EBD) curve and departmental demand distribution donut.

---

## 📁 File Manifest
- **Create:** `src/components/Charts/DecelerationCurve.tsx`
- **Create:** `src/components/Charts/TriageDonut.tsx`
- **Create:** `src/components/Charts/index.ts`
- **Test:** `tests/ChartsSuite.test.tsx`

---

## 📐 Chart Specifications

### 1. Deceleration Curve (`DecelerationCurve.tsx`)
- Formula: $d_{\text{EBD}} = \frac{v^2}{2 \cdot (a_{\text{service}} + g \cdot (G_s - \mu_{\text{rail}}))}$
- X-Axis: Distance ($0 \to 1200\text{ m}$)
- Y-Axis: Speed ($0 \to 130\text{ km/h}$)
- Lines:
  - Normal Service Braking (Blue `#2B7FFF`)
  - Emergency Kavach EBD (Red `#EF4444`)
  - Permanent TSR Clamp (Amber `#F59E0B`)

### 2. Departmental Demand Triage Donut (`TriageDonut.tsx`)
- Categories:
  - TMS Track Flaws (Orange `#F97316`)
  - TDMS OHE Catenary (Amber `#FBBF24`)
  - SMMS Point Machines (Blue `#3B82F6`)
  - Rolling Stock & Others (Slate `#64748B`)

---

## 🛠️ Implementation Steps (TDD)

- [x] **Step 1: Write tests in `tests/ChartsSuite.test.tsx`**
- [x] **Step 2: Create `src/components/Charts/DecelerationCurve.tsx`**
- [x] **Step 3: Create `src/components/Charts/TriageDonut.tsx`**
- [x] **Step 4: Run tests and verify PASS**
  Run `npx vitest run tests/ChartsSuite.test.tsx` (9/9 tests passed).
- [x] **Step 5: Verify full regression test suite**
  Run `npm test` (89/89 tests passed).

