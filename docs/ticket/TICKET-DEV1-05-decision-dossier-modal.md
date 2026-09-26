# 🎫 `TICKET-DEV1-05`: Explainable Decision Dossier Modal & RDSO Form 14B Export

- **Assignee:** Developer 1 (Lead / Core Architect)
- **Role:** Cryptographic Auditing, Explainability & Compliance Surface
- **Status:** `COMPLETED`
- **Priority:** `P0 (Core / Compliance Critical)`
- **Blocking For:** `TICKET-DEV1-07`
- **Reference Spec:** [`docs/12_screens.md#screen-4-auditor-workspace--explainable-decision-dossier-modal`](../12_screens.md#screen-4-auditor-workspace--explainable-decision-dossier-modal) & [`refactoring_plan.md#bead-6-explainableauditoragent`](../refactoring_plan.md#bead-6-explainableauditoragent)

---

## 🎯 Objective
Implement `src/components/Auditor/DecisionLogModal.tsx` and `src/lib/agents/explainableLogger.ts` to present a 4-step chronological AI block justification timeline, an immutable SHA-256 seal verification badge, and an exportable RDSO Form 14B certificate.

---

## 📁 File Manifest
- **Create/Modify:** `src/components/Auditor/DecisionLogModal.tsx`
- **Create/Modify:** `src/lib/agents/explainableLogger.ts`
- **Test:** `tests/DecisionLogModal.test.tsx`

---

## 📐 4-Step Chronological Audit Sequence

1. **Step 1: Multi-Source Ingestion & Spatial Normalization**
   - *Detail:* Ingested TMS-804 rail flaw, TDMS-312 catenary wear, and SMMS-109 point stroke telemetry; mapped chainage to `TC-03` (Dadar).
2. **Step 2: Traffic Conflict & White-Corridor Search**
   - *Detail:* Evaluated 13,000+ train paths from COA; confirmed 0 passenger train cancellations and identified nocturnal lull ($01:30 - 04:45\text{ IST}$).
3. **Step 3: Joint Shadow-Block Co-Location Bundling**
   - *Detail:* Bundled Civil track tamping and S&T point overhaul under de-energized 25kV OHE; saved **85 minutes** of cumulative corridor downtime (38.4% reduction).
4. **Step 4: Safety Dissemination & Sanction**
   - *Detail:* Enforced Form S&T/T-351 lockout, clamped entry Signal S-12 to `RED`, and broadcast wireless Kavach TSR ($30\text{ km/h}$) packet to approaching locomotives.

### Canonical SHA-256 Hash Protocol (RFC 8785)
$$\text{RawString} = \text{blockId} + "|" + \text{sanctionedBy} + "|" + \text{timestamp} + "|" + \text{sortedDemandIds.join(',')} + "|" + \text{tsrSpeed} + "|" + \text{policyVersion}$$

---

## 🛠️ Implementation Steps (TDD)

- [x] **Step 1: Write test in `tests/DecisionLogModal.test.tsx`**
  Verify 4-step timeline rendering, SHA-256 recalculation, and PDF/Print trigger.
- [x] **Step 2: Update `src/lib/agents/explainableLogger.ts`**
  Implement `buildExplainableDossier()` with RFC 8785 delimiter string hashing.
- [x] **Step 3: Refactor `src/components/Auditor/DecisionLogModal.tsx`**
- [x] **Step 4: Run tests and verify PASS**
  Run `npx vitest run tests/DecisionLogModal.test.tsx`.
- [x] **Step 5: Commit**
  `git commit -m "feat(auditor): implement 4-step decision dossier modal and canonical SHA-256 seal"`

---

## ✅ Acceptance Criteria
1. Displays 4 distinct chronological step cards with timestamps and agent badges.
2. Clicking `[COPY SHA-256 SEAL]` copies hash to clipboard and shows success feedback.
3. Form 14B print certificate formats cleanly for export.
