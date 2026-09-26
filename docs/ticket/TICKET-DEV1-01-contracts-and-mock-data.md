# 🎫 `TICKET-DEV1-01`: Core TypeScript Contracts & Grounded Mock Data Seam

- **Assignee:** Developer 1 (Lead Integrator)
- **Role:** Full-Stack Contracts & Ingestion Seam
- **Status:** `OPEN (UNBLOCKED ROOT FRONTIER)`
- **Priority:** `P0 (Critical Blocker)`
- **Blocking For:** `TICKET-DEV1-02`, `TICKET-DEV1-03`, `TICKET-DEV1-04`, `TICKET-DEV2-01..05`
- **Reference Spec:** [`refactoring_plan.md#bead-1-ingestionnormalizeragent`](../refactoring_plan.md#bead-1-ingestionnormalizeragent) & [`docs/09_api_design.md`](../09_api_design.md)

---

## 🎯 Objective
Establish the foundational type-safe contract interfaces and grounded CSMT–Kalyan mock datasets in `src/types/apiContracts.ts` and `src/lib/mockData.ts` to unlock all parallel development for Developer 1 and Developer 2 with zero merge conflicts.

---

## 📁 File Manifest
- **Modify:** `src/types/apiContracts.ts`
- **Modify:** `src/lib/mockData.ts`
- **Test:** `tests/contracts.test.ts`

---

## 📐 Interface Specification

```typescript
// src/types/apiContracts.ts

export type DeploymentMode = 'ADVISORY' | 'AUTONOMOUS';
export type DepartmentCode = 'TMS_CIVIL' | 'TDMS_ELECTRICAL' | 'SMMS_SIGNAL';
export type UrgencyTier = 'P1_CRITICAL' | 'P2_SCHEDULED' | 'P3_ROUTINE';
export type HorizonTier = 'TACTICAL_24H' | 'OPERATIONAL_7D' | 'STRATEGIC_30D';
export type TrackCircuitId = 'TC-01' | 'TC-02' | 'TC-03' | 'TC-04' | 'TC-05' | 'TC-06';

export interface DivisionalPolicyProfile {
  divisionId: string;
  divisionName: string;
  safetyHeadwayBufferMinutes: number; // 15 mins (Delta_clear)
  oheEarthingBufferMinutes: number;    // 10 mins (Delta_earth)
  oheRestorationBufferMinutes: number; // 10 mins (Delta_restore)
  defaultTsrSpeedKmh: number;          // 30 km/h
  weightSafetyRisk: number;            // 0.40 (w_s)
  weightDegradationRate: number;       // 0.35 (w_d)
  weightTrafficDensity: number;        // 0.25 (w_c)
  p1ScoreThreshold: number;            // 0.80
  p2ScoreThreshold: number;            // 0.50
}

export interface MaintenanceDemand {
  demandId: string;
  department: DepartmentCode;
  trackCircuitId: TrackCircuitId;
  stationSection: string;
  chainageKm: number;
  urgencyTier: UrgencyTier;
  urgencyScore: number;
  durationMinutes: number;
  requiresPowerBlock: boolean;
  assignedMachine?: string;
  deadheadTransitMinutes: number;
  status: 'PENDING_TRIAGE' | 'TRIAGED' | 'SLOTTED' | 'SANCTIONED' | 'COMPLETED';
  rawTicketId: string;
  defectDescription: string;
}

export interface JointBlockSchedule {
  blockId: string;
  corridorName: string;
  startTimeMinutes: number;  // 90 = 01:30 IST
  endTimeMinutes: number;    // 285 = 04:45 IST
  affectedTrackCircuits: TrackCircuitId[];
  bundledDemandIds: string[];
  downtimeSavedMinutes: number;
  corridorDowntimeSavedPct: number;
  passengerDelaysMinutes: 0; // Strictly 0
  kavachTsrSpeedKmh: number;
  isEmergencyTsrFallback: boolean;
  status: 'PROPOSED' | 'SANCTIONED' | 'ACTIVE' | 'RESTORED';
  optimizationTimestamp: string;
}

export interface CorridorKpiMetrics {
  corridorDowntimeSavedPct: number; // 38.4%
  assetAvailabilityIndexPct: number; // 96.2%
  activeBlocksCount: number;
  pendingDemandsCount: number;
  whiteCorridorHeadwayMinutes: number; // 195 mins (3h 15m)
  activeKavachTsrsCount: number;
}

export interface TrackCircuitState {
  circuitId: TrackCircuitId;
  stationName: string;
  kmStart: number;
  kmEnd: number;
  status: 'CLEAR' | 'OCCUPIED' | 'MAINTENANCE_SLOTTED' | 'BLOCK_SANCTIONED' | 'POWER_ISOLATED';
  activeBlockId?: string;
  signalId: string;
  signalAspect: 'RED' | 'YELLOW' | 'DOUBLE_YELLOW' | 'GREEN';
  isSignalClamped: boolean;
  speedLimitKmh: number;
  oheEnergized: boolean;
}

export interface TrainScheduleSlot {
  trainNumber: string;
  trainName: string;
  trainType: 'PREMIUM_PASSENGER' | 'EXPRESS' | 'SUBURBAN' | 'FREIGHT';
  originStation: string;
  destinationStation: string;
  trajectoryPoints: Array<{
    stationCode: string;
    km: number;
    arrivalTimeMinutes: number;
    departureTimeMinutes: number;
  }>;
}

export interface ExplainableDecisionDossier {
  dossierId: string;
  blockId: string;
  sanctionedBy: string;
  timestamp: string;
  canonicalPayloadString: string;
  sha256Signature: string;
  chronologicalTimeline: Array<{
    stepNumber: 1 | 2 | 3 | 4;
    stageName: 'INGESTION' | 'TRAFFIC_CONFLICT' | 'JOINT_BUNDLING' | 'SANCTION_DISSEMINATION';
    title: string;
    agentName: string;
    description: string;
    timestamp: string;
  }>;
  bundledDemands: MaintenanceDemand[];
  statutoryForms: {
    formST351LockoutNumber: string;
    formT409CautionOrderNumber: string;
    rdsoForm14BCertificateHash: string;
  };
  verificationStatus: 'VERIFIED_TAMPER_FREE' | 'SIGNATURE_MISMATCH';
}
```

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Write failing contract unit test**
  Create `tests/contracts.test.ts` verifying `MOCK_DEMANDS`, `MOCK_JOINT_BLOCKS`, and `MOCK_POLICY_PROFILE`.
- [ ] **Step 2: Run test and verify it fails**
  Run `npx vitest run tests/contracts.test.ts`.
- [ ] **Step 3: Update `src/types/apiContracts.ts`**
  Implement the exact contracts above.
- [ ] **Step 4: Update `src/lib/mockData.ts`**
  Populate realistic grounded CSMT–Kalyan nocturnal joint maintenance datasets.
- [ ] **Step 5: Run tests and verify PASS**
  Run `npx vitest run tests/contracts.test.ts`.
- [ ] **Step 6: Commit**
  `git commit -m "feat(contracts): implement IRIS AI API contracts and mock datasets"`

---

## ✅ Acceptance Criteria
1. Zero TypeScript compilation errors (`tsc --noEmit`).
2. `MOCK_DEMANDS` contains at least 3 distinct departments (`TMS_CIVIL`, `TDMS_ELECTRICAL`, `SMMS_SIGNAL`).
3. `MOCK_JOINT_BLOCKS[0]` contains `passengerDelaysMinutes: 0`, `downtimeSavedMinutes: 85`, and `corridorDowntimeSavedPct: 38.4`.
