# DEV-01: Core TypeScript Contracts & Grounded Mock Data Implementation Plan (Hardened & Grounded)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the foundational type-safe contract interfaces and grounded CSMT–Kalyan multi-department maintenance datasets in `src/types/apiContracts.ts` and `src/lib/mockData.ts`, hardened against midnight rollovers, parallel track ambiguity, cryptographic hash drift, and type deserialization failures.

**Architecture:** Hexagonal Ports & Adapters foundation where data contracts decouple upstream ingestion adapters (TMS Civil, TDMS Electrical, SMMS Signal) from downstream scheduling optimizers (CP-SAT), tactical SVG visualizers, and cryptographic auditor dossiers. Grounded against Central Railway Mumbai suburban quadrupled track geometry (`UP_SLOW`, `DOWN_SLOW`, `UP_FAST`, `DOWN_FAST`, `5TH_LINE`, `6TH_LINE`) and RFC 8785 canonical hashing.

**Tech Stack:** TypeScript 5.x, React 19 / Next.js 16, Vitest 4.x.

---

## 🏛️ Grounded Architectural Invariants (`/wshobson-agents` + `/adversarial-review`)

1. **Multi-Track Line Disambiguation:** All circuits and maintenance demands specify `trackLine: TrackLineCode` (`UP_SLOW`, `DOWN_SLOW`, `UP_FAST`, `DOWN_FAST`, `5TH_LINE`, `6TH_LINE`) to prevent false-positive cross-line interlocking lockouts.
2. **Rollover-Safe Horizon Modeling:** `JointBlockSchedule` includes explicit `durationMinutes: number` alongside `startTimeMinutes` and `endTimeMinutes` to ensure CP-SAT and SVG rendering are immune to negative duration wrap-arounds.
3. **Deterministic SHA-256 Signatures:** Canonical payload string generator strictly sorts demand IDs alphabetically (`sortedDemandIds = demands.map(d => d.demandId).sort().join(',')`) ensuring byte-for-byte hash identity between Python and TypeScript.
4. **Resilient Delay Typing:** `passengerDelaysMinutes: number` permits runtime solver flexibility while unit tests enforce `expect(delay).toBe(0)` on nominal schedules.
5. **Zero Breaking Changes:** Existing legacy UI types (`TrackInterlockingState`, `IncidentRecord`, `EbdCalculationResult`, etc.) remain fully exported and operational.

---

## Global Constraints

- Design Tokens: Light-Blue Mintlify palette (`#F0F6FC` Base, `#FFFFFF` Surface, `#D0DFEE` Border, `#2B7FFF` Signal Blue, `#0F172A` Text).
- Button & Input Geometry: Strictly 4px border radius (Zero pill buttons).
- Passenger Delay Invariant: `passengerDelaysMinutes === 0` (on nominal scheduled joint blocks).
- Safety Clearance Buffer: $\Delta_{\text{clear}} \ge 15\text{ minutes}$.
- OHE Earthing & Restoration Buffers: $\Delta_{\text{earth}} = 10\text{ min}$, $\Delta_{\text{restore}} = 10\text{ min}$.
- Default Kavach TSR Speed: $30\text{ km/h}$.

---

## File Manifest

| Action | Target Path | Responsibility |
| :--- | :--- | :--- |
| **Create** | `tests/contracts.test.ts` | Unit tests verifying type interfaces, invariants, mock dataset distributions, track lines, and hash determinism |
| **Modify** | `src/types/apiContracts.ts` | Export complete hardened SIH 26027 interfaces while preserving existing UI contract exports |
| **Modify** | `src/lib/mockData.ts` | Export grounded CSMT–Kalyan nocturnal datasets (`MOCK_POLICY_PROFILE`, `MOCK_DEMANDS`, `MOCK_JOINT_BLOCKS`, `MOCK_CORRIDOR_KPIS`, `MOCK_TRACK_CIRCUITS`, `MOCK_TRAIN_SCHEDULES`, `MOCK_DECISION_DOSSIERS`) |

---

## Task Breakdown

### Task 1: Write Failing Contract Unit Tests (`tests/contracts.test.ts`)

**Files:**
- Create: `tests/contracts.test.ts`

**Interfaces:**
- Consumes: `src/types/apiContracts.ts`, `src/lib/mockData.ts`
- Produces: Comprehensive test suite validating all contracts, policy weights, demand distributions, line codes, rollover math, and cryptographic determinism.

- [ ] **Step 1: Write the complete failing contract unit test file**

Write to `tests/contracts.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import {
  MOCK_POLICY_PROFILE,
  MOCK_DEMANDS,
  MOCK_JOINT_BLOCKS,
  MOCK_CORRIDOR_KPIS,
  MOCK_TRACK_CIRCUITS,
  MOCK_TRAIN_SCHEDULES,
  MOCK_DECISION_DOSSIERS,
  MOCK_INTERLOCKING_STATE,
  MOCK_INCIDENTS
} from '@/lib/mockData';
import type {
  DivisionalPolicyProfile,
  MaintenanceDemand,
  JointBlockSchedule,
  CorridorKpiMetrics,
  TrackCircuitState,
  TrainScheduleSlot,
  ExplainableDecisionDossier,
  TrackLineCode
} from '@/types/apiContracts';

describe('TICKET-DEV1-01: IRIS AI Core Data Contracts & Grounded Mock Data', () => {
  describe('1. DivisionalPolicyProfile Contract Invariants', () => {
    it('should adhere to reference safety and earthing buffers', () => {
      const policy: DivisionalPolicyProfile = MOCK_POLICY_PROFILE;
      expect(policy.divisionId).toBe('BB-CR');
      expect(policy.divisionName).toBe('Mumbai Central Railway Division');
      expect(policy.safetyHeadwayBufferMinutes).toBe(15);
      expect(policy.oheEarthingBufferMinutes).toBe(10);
      expect(policy.oheRestorationBufferMinutes).toBe(10);
      expect(policy.defaultTsrSpeedKmh).toBe(30);
    });

    it('should have normalized urgency scoring weights summing to 1.0', () => {
      const policy = MOCK_POLICY_PROFILE;
      const sumWeights = policy.weightSafetyRisk + policy.weightDegradationRate + policy.weightTrafficDensity;
      expect(sumWeights).toBeCloseTo(1.0, 5);
      expect(policy.weightSafetyRisk).toBe(0.40);
      expect(policy.weightDegradationRate).toBe(0.35);
      expect(policy.weightTrafficDensity).toBe(0.25);
    });
  });

  describe('2. MaintenanceDemand Multi-Department & Line Ingestion', () => {
    it('should contain demands from all three CRIS engineering departments', () => {
      const departments = new Set(MOCK_DEMANDS.map((d: MaintenanceDemand) => d.department));
      expect(departments.has('TMS_CIVIL')).toBe(true);
      expect(departments.has('TDMS_ELECTRICAL')).toBe(true);
      expect(departments.has('SMMS_SIGNAL')).toBe(true);
      expect(MOCK_DEMANDS.length).toBeGreaterThanOrEqual(6);
    });

    it('should assign valid track circuit IDs and line codes', () => {
      const validCircuits = new Set(['TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05', 'TC-06']);
      const validLines: TrackLineCode[] = ['UP_SLOW', 'DOWN_SLOW', 'UP_FAST', 'DOWN_FAST', '5TH_LINE', '6TH_LINE'];
      
      MOCK_DEMANDS.forEach((demand: MaintenanceDemand) => {
        expect(validCircuits.has(demand.trackCircuitId)).toBe(true);
        expect(validLines).toContain(demand.trackLine);
        expect(demand.urgencyScore).toBeGreaterThanOrEqual(0);
        expect(demand.urgencyScore).toBeLessThanOrEqual(1.0);
        expect(demand.durationMinutes).toBeGreaterThan(0);
      });
    });

    it('should properly flag power block requirement for TDMS Electrical demands', () => {
      const tdmsDemands = MOCK_DEMANDS.filter((d: MaintenanceDemand) => d.department === 'TDMS_ELECTRICAL');
      expect(tdmsDemands.length).toBeGreaterThan(0);
      tdmsDemands.forEach((d: MaintenanceDemand) => {
        expect(d.requiresPowerBlock).toBe(true);
      });
    });
  });

  describe('3. JointBlockSchedule Zero Delay & Rollover Invariants', () => {
    it('should enforce zero passenger delays and high downtime recovery', () => {
      expect(MOCK_JOINT_BLOCKS.length).toBeGreaterThan(0);
      const primaryBlock: JointBlockSchedule = MOCK_JOINT_BLOCKS[0];
      
      expect(primaryBlock.blockId).toBe('JB-2026-0926-01');
      expect(primaryBlock.trackLine).toBe('UP_SLOW');
      expect(primaryBlock.passengerDelaysMinutes).toBe(0);
      expect(primaryBlock.downtimeSavedMinutes).toBe(85);
      expect(primaryBlock.corridorDowntimeSavedPct).toBe(38.4);
      expect(primaryBlock.durationMinutes).toBe(195);
      expect(primaryBlock.startTimeMinutes).toBe(90);  // 01:30 IST
      expect(primaryBlock.endTimeMinutes).toBe(285);   // 04:45 IST
      expect(primaryBlock.kavachTsrSpeedKmh).toBe(30);
      expect(primaryBlock.bundledDemandIds.length).toBeGreaterThanOrEqual(2);
    });

    it('should accurately calculate duration without negative rollover errors', () => {
      MOCK_JOINT_BLOCKS.forEach((block: JointBlockSchedule) => {
        expect(block.durationMinutes).toBeGreaterThan(0);
        const expectedDuration = block.endTimeMinutes >= block.startTimeMinutes
          ? block.endTimeMinutes - block.startTimeMinutes
          : (block.endTimeMinutes - block.startTimeMinutes + 1440);
        expect(block.durationMinutes).toBe(expectedDuration);
      });
    });
  });

  describe('4. CorridorKpiMetrics Operational Health', () => {
    it('should export realistic grounded Central Railway corridor metrics', () => {
      const kpi: CorridorKpiMetrics = MOCK_CORRIDOR_KPIS;
      expect(kpi.corridorDowntimeSavedPct).toBe(38.4);
      expect(kpi.assetAvailabilityIndexPct).toBe(96.2);
      expect(kpi.whiteCorridorHeadwayMinutes).toBe(195);
      expect(kpi.activeBlocksCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. TrackCircuitState and Interlocking Schematic', () => {
    it('should map all 6 CSMT-Kalyan section circuits continuously with trackLine attributes', () => {
      expect(MOCK_TRACK_CIRCUITS.length).toBe(6);
      expect(MOCK_TRACK_CIRCUITS[0].circuitId).toBe('TC-01');
      expect(MOCK_TRACK_CIRCUITS[5].circuitId).toBe('TC-06');
      
      // Verify contiguous kilometer chainage and line codes
      for (let i = 0; i < MOCK_TRACK_CIRCUITS.length - 1; i++) {
        expect(MOCK_TRACK_CIRCUITS[i].kmEnd).toBe(MOCK_TRACK_CIRCUITS[i + 1].kmStart);
        expect(MOCK_TRACK_CIRCUITS[i].trackLine).toBeDefined();
      }
    });
  });

  describe('6. TrainScheduleSlot Timetable Trajectories', () => {
    it('should contain nocturnal and daytime passenger and freight paths', () => {
      expect(MOCK_TRAIN_SCHEDULES.length).toBeGreaterThanOrEqual(4);
      const vb = MOCK_TRAIN_SCHEDULES.find((t: TrainScheduleSlot) => t.trainNumber === '12345');
      expect(vb).toBeDefined();
      expect(vb?.trainName).toContain('Vande Bharat');
      expect(vb?.trajectoryPoints.length).toBeGreaterThan(1);
    });
  });

  describe('7. ExplainableDecisionDossier Deterministic Cryptographic Seal', () => {
    it('should contain a valid 4-step chronological audit timeline and sorted SHA-256 seal', () => {
      expect(MOCK_DECISION_DOSSIERS.length).toBeGreaterThan(0);
      const dossier: ExplainableDecisionDossier = MOCK_DECISION_DOSSIERS[0];
      
      expect(dossier.chronologicalTimeline.length).toBe(4);
      expect(dossier.chronologicalTimeline[0].stepNumber).toBe(1);
      expect(dossier.chronologicalTimeline[3].stepNumber).toBe(4);
      expect(dossier.sha256Signature).toMatch(/^[a-f0-9]{64}$/i);
      expect(dossier.canonicalPayloadString).toContain('DEM-SMMS-03,DEM-TDMS-02,DEM-TMS-01'); // Alphabetically sorted
      expect(dossier.statutoryForms.rdsoForm14BCertificateHash).toBeDefined();
      expect(dossier.verificationStatus).toBe('VERIFIED_TAMPER_FREE');
    });
  });

  describe('8. Backward Compatibility with Existing UI Subsystems', () => {
    it('should preserve legacy mock datasets for existing views', () => {
      expect(MOCK_INTERLOCKING_STATE).toBeDefined();
      expect(MOCK_INTERLOCKING_STATE.circuits.length).toBeGreaterThan(0);
      expect(MOCK_INCIDENTS).toBeDefined();
      expect(MOCK_INCIDENTS.length).toBeGreaterThan(0);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/contracts.test.ts`  
Expected Output: FAIL with missing exports (`MOCK_POLICY_PROFILE`, `MOCK_DEMANDS`, etc.).

---

### Task 2: Implement Hardened Contracts in `src/types/apiContracts.ts`

**Files:**
- Modify: `src/types/apiContracts.ts`

- [ ] **Step 1: Write the updated hardened type contracts**

Update `src/types/apiContracts.ts`:

```typescript
// src/types/apiContracts.ts
// Shared Interface Contracts for IRIS AI (Automatic Block Planning & Corridor Optimization)

// ==========================================
// 1. CORE ENUMS & LITERAL TYPES
// ==========================================
export type DeploymentMode = 'ADVISORY' | 'AUTONOMOUS';
export type DepartmentCode = 'TMS_CIVIL' | 'TDMS_ELECTRICAL' | 'SMMS_SIGNAL';
export type UrgencyTier = 'P1_CRITICAL' | 'P2_SCHEDULED' | 'P3_ROUTINE';
export type HorizonTier = 'TACTICAL_24H' | 'OPERATIONAL_7D' | 'STRATEGIC_30D';
export type TrackCircuitId = 'TC-01' | 'TC-02' | 'TC-03' | 'TC-04' | 'TC-05' | 'TC-06';
export type TrackLineCode = 'UP_SLOW' | 'DOWN_SLOW' | 'UP_FAST' | 'DOWN_FAST' | '5TH_LINE' | '6TH_LINE';
export type DemandStatus = 'PENDING_TRIAGE' | 'TRIAGED' | 'SLOTTED' | 'SANCTIONED' | 'COMPLETED';
export type BlockStatus = 'PROPOSED' | 'SANCTIONED' | 'ACTIVE' | 'RESTORED';
export type CircuitOperationalStatus = 'CLEAR' | 'OCCUPIED' | 'MAINTENANCE_SLOTTED' | 'BLOCK_SANCTIONED' | 'POWER_ISOLATED';
export type SignalAspect = 'RED' | 'YELLOW' | 'DOUBLE_YELLOW' | 'GREEN';
export type TrainClassification = 'PREMIUM_PASSENGER' | 'EXPRESS' | 'SUBURBAN' | 'FREIGHT';

// ==========================================
// 2. CONFIGURABLE DIVISIONAL POLICY PROFILE
// ==========================================
export interface DivisionalPolicyProfile {
  divisionId: string;
  divisionName: string;
  safetyHeadwayBufferMinutes: number; // Delta_clear (e.g. 15 mins)
  oheEarthingBufferMinutes: number;    // Delta_earth (e.g. 10 mins)
  oheRestorationBufferMinutes: number; // Delta_restore (e.g. 10 mins)
  defaultTsrSpeedKmh: number;          // Default 30 km/h
  weightSafetyRisk: number;            // w_s (0.40)
  weightDegradationRate: number;       // w_d (0.35)
  weightTrafficDensity: number;        // w_c (0.25)
  p1ScoreThreshold: number;            // 0.80
  p2ScoreThreshold: number;            // 0.50
}

// ==========================================
// 3. INGESTION & MAINTENANCE DEMAND CONTRACT
// ==========================================
export interface MaintenanceDemand {
  demandId: string;
  department: DepartmentCode;
  trackCircuitId: TrackCircuitId;
  trackLine: TrackLineCode;
  stationSection: string;
  chainageKm: number;
  urgencyTier: UrgencyTier;
  urgencyScore: number;
  durationMinutes: number;
  requiresPowerBlock: boolean;
  assignedMachine?: string;
  deadheadTransitMinutes: number;
  status: DemandStatus;
  rawTicketId: string;
  defectDescription: string;
}

// ==========================================
// 4. JOINT BLOCK OPTIMIZATION SCHEDULE
// ==========================================
export interface JointBlockSchedule {
  blockId: string;
  corridorName: string;
  trackLine: TrackLineCode;
  startTimeMinutes: number;  // Minutes from midnight (e.g. 90 = 01:30 IST)
  endTimeMinutes: number;    // Minutes from midnight (e.g. 285 = 04:45 IST)
  durationMinutes: number;   // Explicit duration (e.g. 195 mins) to prevent rollover subtraction bugs
  affectedTrackCircuits: TrackCircuitId[];
  bundledDemandIds: string[];
  downtimeSavedMinutes: number;
  corridorDowntimeSavedPct: number;
  passengerDelaysMinutes: number; // 0 on nominal plans
  kavachTsrSpeedKmh: number;
  isEmergencyTsrFallback: boolean;
  status: BlockStatus;
  optimizationTimestamp: string;
}

// ==========================================
// 5. OPERATIONAL KPI METRICS
// ==========================================
export interface CorridorKpiMetrics {
  corridorDowntimeSavedPct: number; // e.g. 38.4%
  assetAvailabilityIndexPct: number; // e.g. 96.2%
  activeBlocksCount: number;
  pendingDemandsCount: number;
  whiteCorridorHeadwayMinutes: number; // e.g. 195 mins (3h 15m)
  activeKavachTsrsCount: number;
}

// ==========================================
// 6. INTERLOCKING & TRACK CIRCUIT STATE
// ==========================================
export interface TrackCircuitState {
  circuitId: TrackCircuitId;
  trackLine: TrackLineCode;
  stationName: string;
  kmStart: number;
  kmEnd: number;
  status: CircuitOperationalStatus;
  activeBlockId?: string;
  signalId: string;
  signalAspect: SignalAspect;
  isSignalClamped: boolean;
  speedLimitKmh: number;
  oheEnergized: boolean;
}

// ==========================================
// 7. TIME-DISTANCE TIMETABLE TRAJECTORIES
// ==========================================
export interface TrainScheduleSlot {
  trainNumber: string;
  trainName: string;
  trainType: TrainClassification;
  originStation: string;
  destinationStation: string;
  trajectoryPoints: Array<{
    stationCode: string;
    km: number;
    arrivalTimeMinutes: number;
    departureTimeMinutes: number;
  }>;
}

// ==========================================
// 8. EXPLAINABLE DECISION DOSSIER & AUDIT
// ==========================================
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

// ==========================================
// 9. BACKWARD-COMPATIBLE LEGACY UI CONTRACTS
// ==========================================
export type SeverityCategory = 'CRITICAL' | 'MODERATE' | 'LOW';
export type WeatherCondition = 'DRY' | 'WET_MONSOON' | 'DENSE_FOG' | 'NIGHT_IR';
export type TacticalCameraAngle = 'FORWARD_CAB' | 'OHE_PANTOGRAPH' | 'BOGIE_UNDERCARRIAGE';

export interface TrackBlockCircuit {
  circuitId: string;
  lineName: string;
  isOccupied: boolean;
  occupyingTrainId?: string;
  speedLimitKmh: number;
}

export interface SignalAspectState {
  signalId: string;
  aspect: 'CLEAR' | 'CAUTION' | 'STOP' | 'HOLD_ACTIVE';
  associatedCircuitId: string;
  isAutomatic: boolean;
}

export interface PointSwitchState {
  switchId: string;
  position: 'NORMAL' | 'REVERSE';
  isLocked: boolean;
}

export interface TrackInterlockingState {
  timestamp: string;
  circuits: TrackBlockCircuit[];
  signals: SignalAspectState[];
  switches: PointSwitchState[];
}

export interface AnomalyBoundingBox {
  class: 'BOULDER' | 'RAIL_FRACTURE' | 'CROWD_SURGE' | 'CATTLE';
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  estimatedDistanceMeters: number;
}

export interface IncidentRecord {
  incidentId: string;
  timestamp: string;
  sourceCameraId: string;
  cameraType: 'LOCO_CAB' | 'PLATFORM_GATEWAY' | 'OHE';
  severityCategory: SeverityCategory;
  severityScore: number;
  assignedAgent: 'KavachBrakingAgent' | 'SectionDispatchAgent' | 'RiskAuditAgent';
  status: 'PENDING_APPROVAL' | 'EXECUTING' | 'RESOLVED' | 'REJECTED';
  boundingBoxes: AnomalyBoundingBox[];
}

export interface EbdCalculationResult {
  trainId: string;
  velocityKmh: number;
  obstacleDistanceMeters: number;
  calculatedStoppingDistanceMeters: number;
  marginDistanceMeters: number;
  isCollisionRisk: boolean;
  requiredDecelerationMs2: number;
  brakeState: 'CLEAR' | 'EMERGENCY_SOLENOID_ACTUATED';
}

export interface PlatformHoldState {
  stationCode: string;
  heldPlatformId: string;
  adjacentPlatformId: string;
  gatewayOccupancyIndex: number;
  gatewayCrowdCount: number;
  remainingHoldSeconds: number;
  isMlExtensionActive: boolean;
  status: 'HOLD_ACTIVE' | 'CLEARING' | 'RELEASED';
}

export interface ExplainableDecisionLog {
  incidentId: string;
  trainNumber: string;
  trackSection: string;
  status: 'ACTION_CONFIRMED' | 'REJECTED' | 'RESOLVED';
  deploymentMode: DeploymentMode;
  steps: Array<{
    stepNumber: number;
    agentName: string;
    title: string;
    detailText: string;
    timestamp: string;
  }>;
  outcomeSummary: string;
}
```

---

### Task 3: Implement Grounded CSMT–Kalyan Mock Datasets in `src/lib/mockData.ts`

**Files:**
- Modify: `src/lib/mockData.ts`

- [ ] **Step 1: Populate realistic grounded datasets matching all contracts**

Update `src/lib/mockData.ts`:

```typescript
// src/lib/mockData.ts
// Grounded Mock Datasets for IRIS AI (Automatic Block Planning & Corridor Optimization)

import {
  DivisionalPolicyProfile,
  MaintenanceDemand,
  JointBlockSchedule,
  CorridorKpiMetrics,
  TrackCircuitState,
  TrainScheduleSlot,
  ExplainableDecisionDossier,
  TrackInterlockingState,
  IncidentRecord,
  EbdCalculationResult,
  PlatformHoldState,
  ExplainableDecisionLog
} from '@/types/apiContracts';

export type {
  DivisionalPolicyProfile,
  MaintenanceDemand,
  JointBlockSchedule,
  CorridorKpiMetrics,
  TrackCircuitState,
  TrainScheduleSlot,
  ExplainableDecisionDossier,
  TrackInterlockingState,
  IncidentRecord,
  EbdCalculationResult,
  PlatformHoldState,
  ExplainableDecisionLog
};

// ==========================================
// 1. GROUNDED DIVISIONAL POLICY PROFILE
// ==========================================
export const MOCK_POLICY_PROFILE: DivisionalPolicyProfile = {
  divisionId: 'BB-CR',
  divisionName: 'Mumbai Central Railway Division',
  safetyHeadwayBufferMinutes: 15,
  oheEarthingBufferMinutes: 10,
  oheRestorationBufferMinutes: 10,
  defaultTsrSpeedKmh: 30,
  weightSafetyRisk: 0.40,
  weightDegradationRate: 0.35,
  weightTrafficDensity: 0.25,
  p1ScoreThreshold: 0.80,
  p2ScoreThreshold: 0.50
};

// ==========================================
// 2. GROUNDED MULTI-DEPARTMENT MAINTENANCE DEMANDS
// ==========================================
export const MOCK_DEMANDS: MaintenanceDemand[] = [
  {
    demandId: 'DEM-TMS-01',
    department: 'TMS_CIVIL',
    trackCircuitId: 'TC-03',
    trackLine: 'UP_SLOW',
    stationSection: 'Dadar - Kurla Up Slow Line',
    chainageKm: 14.2,
    urgencyTier: 'P1_CRITICAL',
    urgencyScore: 0.94,
    durationMinutes: 120,
    requiresPowerBlock: false,
    assignedMachine: 'CSM Continuous Tamping Machine #5109',
    deadheadTransitMinutes: 20,
    status: 'SLOTTED',
    rawTicketId: 'CR-TMS-2026-8812',
    defectDescription: 'USFD detected 35mm transverse rail fracture at Welded Joint W-42 (KM 14.220).'
  },
  {
    demandId: 'DEM-TDMS-02',
    department: 'TDMS_ELECTRICAL',
    trackCircuitId: 'TC-03',
    trackLine: 'UP_SLOW',
    stationSection: 'Dadar - Kurla Up Slow Line',
    chainageKm: 14.8,
    urgencyTier: 'P2_SCHEDULED',
    urgencyScore: 0.72,
    durationMinutes: 90,
    requiresPowerBlock: true,
    assignedMachine: 'OHE Hydraulic Ladder Inspection Tower Wagon #60515',
    deadheadTransitMinutes: 15,
    status: 'SLOTTED',
    rawTicketId: 'CR-TDMS-2026-4309',
    defectDescription: '25kV AC Catenary dropper slack and contact wire wear exceeding 20% limit at Mast 14/18.'
  },
  {
    demandId: 'DEM-SMMS-03',
    department: 'SMMS_SIGNAL',
    trackCircuitId: 'TC-03',
    trackLine: 'UP_SLOW',
    stationSection: 'Dadar - Kurla Up Slow Line',
    chainageKm: 15.1,
    urgencyTier: 'P2_SCHEDULED',
    urgencyScore: 0.68,
    durationMinutes: 60,
    requiresPowerBlock: false,
    assignedMachine: 'Signal Gang Maintenance Tool Van',
    deadheadTransitMinutes: 10,
    status: 'SLOTTED',
    rawTicketId: 'CR-SMMS-2026-1192',
    defectDescription: 'Audio Frequency Track Circuit (AFTC) tuning unit impedance drift and point machine detector calibration.'
  },
  {
    demandId: 'DEM-TMS-04',
    department: 'TMS_CIVIL',
    trackCircuitId: 'TC-04',
    trackLine: 'DOWN_FAST',
    stationSection: 'Kurla - Ghatkopar Down Fast Line',
    chainageKm: 21.4,
    urgencyTier: 'P2_SCHEDULED',
    urgencyScore: 0.65,
    durationMinutes: 150,
    requiresPowerBlock: false,
    assignedMachine: 'BCM Ballast Cleaning Machine #302',
    deadheadTransitMinutes: 25,
    status: 'TRIAGED',
    rawTicketId: 'CR-TMS-2026-9044',
    defectDescription: 'Deep screening and ballast deficiency restoration around crossover point 104B.'
  },
  {
    demandId: 'DEM-TDMS-05',
    department: 'TDMS_ELECTRICAL',
    trackCircuitId: 'TC-05',
    trackLine: 'UP_FAST',
    stationSection: 'Ghatkopar - Thane Up Fast Line',
    chainageKm: 29.8,
    urgencyTier: 'P1_CRITICAL',
    urgencyScore: 0.88,
    durationMinutes: 110,
    requiresPowerBlock: true,
    assignedMachine: 'OHE Wiring Train #12',
    deadheadTransitMinutes: 30,
    status: 'PENDING_TRIAGE',
    rawTicketId: 'CR-TDMS-2026-5510',
    defectDescription: 'Damaged cantilever insulator bracket prone to flashover during high moisture morning hours.'
  },
  {
    demandId: 'DEM-SMMS-06',
    department: 'SMMS_SIGNAL',
    trackCircuitId: 'TC-02',
    trackLine: 'DOWN_SLOW',
    stationSection: 'Byculla - Dadar Down Slow Line',
    chainageKm: 7.6,
    urgencyTier: 'P3_ROUTINE',
    urgencyScore: 0.38,
    durationMinutes: 45,
    requiresPowerBlock: false,
    deadheadTransitMinutes: 5,
    status: 'TRIAGED',
    rawTicketId: 'CR-SMMS-2026-0421',
    defectDescription: 'Quarterly LED aspect signal lamp replacement and relay contact resistance test.'
  }
];

// ==========================================
// 3. OPTIMIZED JOINT SHADOW BLOCK SCHEDULE
// ==========================================
export const MOCK_JOINT_BLOCKS: JointBlockSchedule[] = [
  {
    blockId: 'JB-2026-0926-01',
    corridorName: 'CSMT-Kalyan Sub-Corridor (Dadar-Kurla Section)',
    trackLine: 'UP_SLOW',
    startTimeMinutes: 90,   // 01:30 IST
    endTimeMinutes: 285,    // 04:45 IST
    durationMinutes: 195,   // 3 hours 15 minutes window
    affectedTrackCircuits: ['TC-03'],
    bundledDemandIds: ['DEM-TMS-01', 'DEM-TDMS-02', 'DEM-SMMS-03'],
    downtimeSavedMinutes: 85,
    corridorDowntimeSavedPct: 38.4,
    passengerDelaysMinutes: 0,
    kavachTsrSpeedKmh: 30,
    isEmergencyTsrFallback: false,
    status: 'SANCTIONED',
    optimizationTimestamp: '2026-09-26T01:15:00Z'
  },
  {
    blockId: 'JB-2026-0926-02',
    corridorName: 'Kurla-Thane Sub-Corridor (Ghatkopar Section)',
    trackLine: 'DOWN_FAST',
    startTimeMinutes: 105,  // 01:45 IST
    endTimeMinutes: 270,    // 04:30 IST
    durationMinutes: 165,
    affectedTrackCircuits: ['TC-04', 'TC-05'],
    bundledDemandIds: ['DEM-TMS-04', 'DEM-TDMS-05'],
    downtimeSavedMinutes: 65,
    corridorDowntimeSavedPct: 32.1,
    passengerDelaysMinutes: 0,
    kavachTsrSpeedKmh: 30,
    isEmergencyTsrFallback: true,
    status: 'PROPOSED',
    optimizationTimestamp: '2026-09-26T01:20:00Z'
  }
];

// ==========================================
// 4. CORRIDOR KPI METRICS
// ==========================================
export const MOCK_CORRIDOR_KPIS: CorridorKpiMetrics = {
  corridorDowntimeSavedPct: 38.4,
  assetAvailabilityIndexPct: 96.2,
  activeBlocksCount: 2,
  pendingDemandsCount: 6,
  whiteCorridorHeadwayMinutes: 195,
  activeKavachTsrsCount: 1
};

// ==========================================
// 5. CSMT-KALYAN 6-CIRCUIT TOPOLOGY (54 KM)
// ==========================================
export const MOCK_TRACK_CIRCUITS: TrackCircuitState[] = [
  {
    circuitId: 'TC-01',
    trackLine: 'UP_SLOW',
    stationName: 'CSMT - Byculla',
    kmStart: 0.0,
    kmEnd: 4.8,
    status: 'CLEAR',
    signalId: 'S-02',
    signalAspect: 'GREEN',
    isSignalClamped: false,
    speedLimitKmh: 105,
    oheEnergized: true
  },
  {
    circuitId: 'TC-02',
    trackLine: 'DOWN_SLOW',
    stationName: 'Byculla - Dadar',
    kmStart: 4.8,
    kmEnd: 9.2,
    status: 'OCCUPIED',
    signalId: 'S-06',
    signalAspect: 'YELLOW',
    isSignalClamped: false,
    speedLimitKmh: 110,
    oheEnergized: true
  },
  {
    circuitId: 'TC-03',
    trackLine: 'UP_SLOW',
    stationName: 'Dadar - Kurla',
    kmStart: 9.2,
    kmEnd: 15.5,
    status: 'BLOCK_SANCTIONED',
    activeBlockId: 'JB-2026-0926-01',
    signalId: 'S-12',
    signalAspect: 'RED',
    isSignalClamped: true,
    speedLimitKmh: 30,
    oheEnergized: false
  },
  {
    circuitId: 'TC-04',
    trackLine: 'DOWN_FAST',
    stationName: 'Kurla - Ghatkopar',
    kmStart: 15.5,
    kmEnd: 21.8,
    status: 'MAINTENANCE_SLOTTED',
    signalId: 'S-18',
    signalAspect: 'DOUBLE_YELLOW',
    isSignalClamped: false,
    speedLimitKmh: 80,
    oheEnergized: true
  },
  {
    circuitId: 'TC-05',
    trackLine: 'UP_FAST',
    stationName: 'Ghatkopar - Thane',
    kmStart: 21.8,
    kmEnd: 34.0,
    status: 'CLEAR',
    signalId: 'S-24',
    signalAspect: 'GREEN',
    isSignalClamped: false,
    speedLimitKmh: 120,
    oheEnergized: true
  },
  {
    circuitId: 'TC-06',
    trackLine: '5TH_LINE',
    stationName: 'Thane - Kalyan',
    kmStart: 34.0,
    kmEnd: 54.0,
    status: 'OCCUPIED',
    signalId: 'S-32',
    signalAspect: 'DOUBLE_YELLOW',
    isSignalClamped: false,
    speedLimitKmh: 130,
    oheEnergized: true
  }
];

// ==========================================
// 6. TIME-DISTANCE TRAIN SCHEDULE SLOTS
// ==========================================
export const MOCK_TRAIN_SCHEDULES: TrainScheduleSlot[] = [
  {
    trainNumber: '12345',
    trainName: 'CSMT-SBC Vande Bharat Express',
    trainType: 'PREMIUM_PASSENGER',
    originStation: 'CSMT',
    destinationStation: 'Kalyan',
    trajectoryPoints: [
      { stationCode: 'CSMT', km: 0.0, arrivalTimeMinutes: 360, departureTimeMinutes: 360 }, // 06:00 IST
      { stationCode: 'DR', km: 9.2, arrivalTimeMinutes: 371, departureTimeMinutes: 373 },
      { stationCode: 'TNA', km: 34.0, arrivalTimeMinutes: 395, departureTimeMinutes: 397 },
      { stationCode: 'KYN', km: 54.0, arrivalTimeMinutes: 418, departureTimeMinutes: 420 }
    ]
  },
  {
    trainNumber: '12137',
    trainName: 'Punjab Mail',
    trainType: 'EXPRESS',
    originStation: 'CSMT',
    destinationStation: 'Kalyan',
    trajectoryPoints: [
      { stationCode: 'CSMT', km: 0.0, arrivalTimeMinutes: 45, departureTimeMinutes: 45 },  // 00:45 IST
      { stationCode: 'DR', km: 9.2, arrivalTimeMinutes: 58, departureTimeMinutes: 60 },
      { stationCode: 'TNA', km: 34.0, arrivalTimeMinutes: 84, departureTimeMinutes: 86 },
      { stationCode: 'KYN', km: 54.0, arrivalTimeMinutes: 108, departureTimeMinutes: 110 }
    ]
  },
  {
    trainNumber: '22691',
    trainName: 'Bengaluru Rajdhani Express',
    trainType: 'PREMIUM_PASSENGER',
    originStation: 'Kalyan',
    destinationStation: 'CSMT',
    trajectoryPoints: [
      { stationCode: 'KYN', km: 54.0, arrivalTimeMinutes: 320, departureTimeMinutes: 320 }, // 05:20 IST
      { stationCode: 'TNA', km: 34.0, arrivalTimeMinutes: 338, departureTimeMinutes: 340 },
      { stationCode: 'DR', km: 9.2, arrivalTimeMinutes: 362, departureTimeMinutes: 364 },
      { stationCode: 'CSMT', km: 0.0, arrivalTimeMinutes: 378, departureTimeMinutes: 378 }
    ]
  },
  {
    trainNumber: 'BOXN-902',
    trainName: 'JNPT Freight Container Express',
    trainType: 'FREIGHT',
    originStation: 'CSMT',
    destinationStation: 'Kalyan',
    trajectoryPoints: [
      { stationCode: 'CSMT', km: 0.0, arrivalTimeMinutes: 300, departureTimeMinutes: 300 }, // 05:00 IST
      { stationCode: 'DR', km: 9.2, arrivalTimeMinutes: 318, departureTimeMinutes: 320 },
      { stationCode: 'TNA', km: 34.0, arrivalTimeMinutes: 355, departureTimeMinutes: 357 },
      { stationCode: 'KYN', km: 54.0, arrivalTimeMinutes: 395, departureTimeMinutes: 400 }
    ]
  }
];

// ==========================================
// 7. EXPLAINABLE DECISION DOSSIERS & AUDITING
// ==========================================
export const MOCK_DECISION_DOSSIERS: ExplainableDecisionDossier[] = [
  {
    dossierId: 'DOS-2026-0926-01',
    blockId: 'JB-2026-0926-01',
    sanctionedBy: 'OP-402 (Senior Section Controller - BB Division)',
    timestamp: '2026-09-26T01:25:34 IST',
    canonicalPayloadString: 'JB-2026-0926-01|OP-402|2026-09-26T01:25:34Z|DEM-SMMS-03,DEM-TDMS-02,DEM-TMS-01|TSR30|BB-CR',
    sha256Signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    chronologicalTimeline: [
      {
        stepNumber: 1,
        stageName: 'INGESTION',
        title: 'Multi-Department Defect Normalization',
        agentName: 'IngestionNormalizerAgent',
        description: 'Ingested 3 co-located tickets from TMS (Fracture KM 14.2), TDMS (Dropper Slack KM 14.8), and SMMS (AFTC Tuning KM 15.1) on Track Circuit TC-03 (UP_SLOW).',
        timestamp: '01:15:02 IST'
      },
      {
        stepNumber: 2,
        stageName: 'TRAFFIC_CONFLICT',
        title: 'COA Traffic Lull Identification',
        agentName: 'CorridorOptimizerAgent',
        description: 'Identified 195-minute nocturnal maintenance lull between Punjab Mail (dep 01:10) and Vande Bharat (arr 06:00). Verified zero passenger timetable conflicts.',
        timestamp: '01:15:15 IST'
      },
      {
        stepNumber: 3,
        stageName: 'JOINT_BUNDLING',
        title: 'Disjunctive CP-SAT Joint Bundling',
        agentName: 'CorridorOptimizerAgent',
        description: 'Bundled Civil tamping (120m), OHE ladder wagon (90m), and S&T calibration (60m) into a single 195-min window on UP_SLOW line, saving 85 corridor minutes (38.4% recovery).',
        timestamp: '01:15:28 IST'
      },
      {
        stepNumber: 4,
        stageName: 'SANCTION_DISSEMINATION',
        title: 'Safety Interlocking & Kavach Dissemination',
        agentName: 'SafetyActuatorAgent',
        description: 'Clamped UP_SLOW signal S-12 to RED (Form S&T/T-351 #99104), de-energized 25kV OHE section, and transmitted wireless Kavach TSR 30 km/h packet.',
        timestamp: '01:25:34 IST'
      }
    ],
    bundledDemands: [MOCK_DEMANDS[0], MOCK_DEMANDS[1], MOCK_DEMANDS[2]],
    statutoryForms: {
      formST351LockoutNumber: 'ST-351-BB-2026-99104',
      formT409CautionOrderNumber: 'T-409-TSR-30-KM14',
      rdsoForm14BCertificateHash: 'RDSO-14B-SHA256-789a4b2c8f1e'
    },
    verificationStatus: 'VERIFIED_TAMPER_FREE'
  }
];

// ==========================================
// 8. BACKWARD-COMPATIBLE LEGACY MOCK DATA
// ==========================================
export const MOCK_INTERLOCKING_STATE: TrackInterlockingState = {
  timestamp: new Date().toISOString(),
  circuits: [
    { circuitId: 'BLK-101', lineName: 'Up Main 1A', isOccupied: true, occupyingTrainId: '12345 (Vande Bharat)', speedLimitKmh: 130 },
    { circuitId: 'BLK-102', lineName: 'Up Main 1B', isOccupied: false, speedLimitKmh: 130 },
    { circuitId: 'BLK-103', lineName: 'Down Line 2A', isOccupied: true, occupyingTrainId: '22691 (Rajdhani Exp)', speedLimitKmh: 110 },
    { circuitId: 'BLK-104', lineName: 'Platform 17 Loop', isOccupied: true, occupyingTrainId: '12137 (Punjab Mail)', speedLimitKmh: 30 },
    { circuitId: 'BLK-105', lineName: 'Platform 18 Loop', isOccupied: false, speedLimitKmh: 30 }
  ],
  signals: [
    { signalId: 'S-12', aspect: 'STOP', associatedCircuitId: 'BLK-101', isAutomatic: true },
    { signalId: 'S-14', aspect: 'CLEAR', associatedCircuitId: 'BLK-102', isAutomatic: true },
    { signalId: 'S-16', aspect: 'HOLD_ACTIVE', associatedCircuitId: 'BLK-105', isAutomatic: false },
    { signalId: 'S-18', aspect: 'CAUTION', associatedCircuitId: 'BLK-103', isAutomatic: true }
  ],
  switches: [
    { switchId: 'P-4A', position: 'NORMAL', isLocked: true },
    { switchId: 'P-4B', position: 'REVERSE', isLocked: true },
    { switchId: 'P-5A', position: 'NORMAL', isLocked: false }
  ]
};

export const MOCK_INCIDENTS: IncidentRecord[] = [
  {
    incidentId: 'RS-2048',
    timestamp: '08:42:11 IST',
    sourceCameraId: 'LOCO-CAB-FRONT-VANDB-204',
    cameraType: 'LOCO_CAB',
    severityCategory: 'CRITICAL',
    severityScore: 0.982,
    assignedAgent: 'KavachBrakingAgent',
    status: 'PENDING_APPROVAL',
    boundingBoxes: [
      {
        class: 'BOULDER',
        confidence: 0.982,
        x: 420,
        y: 280,
        width: 140,
        height: 110,
        estimatedDistanceMeters: 340
      }
    ]
  },
  {
    incidentId: 'RS-2049',
    timestamp: '08:44:05 IST',
    sourceCameraId: 'CCTV-STATION-CSMT-P17-P18',
    cameraType: 'PLATFORM_GATEWAY',
    severityCategory: 'MODERATE',
    severityScore: 0.785,
    assignedAgent: 'SectionDispatchAgent',
    status: 'EXECUTING',
    boundingBoxes: [
      {
        class: 'CROWD_SURGE',
        confidence: 0.884,
        x: 100,
        y: 150,
        width: 500,
        height: 300,
        estimatedDistanceMeters: 15
      }
    ]
  },
  {
    incidentId: 'RS-2050',
    timestamp: '08:30:00 IST',
    sourceCameraId: 'CREW-DUTY-SYSTEM-WR',
    cameraType: 'OHE',
    severityCategory: 'LOW',
    severityScore: 0.450,
    assignedAgent: 'RiskAuditAgent',
    status: 'RESOLVED',
    boundingBoxes: []
  }
];

export const MOCK_EBD_CALCULATION: EbdCalculationResult = {
  trainId: '12345 (Vande Bharat)',
  velocityKmh: 110,
  obstacleDistanceMeters: 340,
  calculatedStoppingDistanceMeters: 410,
  marginDistanceMeters: -70,
  isCollisionRisk: true,
  requiredDecelerationMs2: 1.15,
  brakeState: 'EMERGENCY_SOLENOID_ACTUATED'
};

export const MOCK_PLATFORM_HOLD_STATE: PlatformHoldState = {
  stationCode: 'CSMT',
  heldPlatformId: 'PLATFORM_18',
  adjacentPlatformId: 'PLATFORM_17',
  gatewayOccupancyIndex: 0.88,
  gatewayCrowdCount: 482,
  remainingHoldSeconds: 252,
  isMlExtensionActive: true,
  status: 'HOLD_ACTIVE'
};

export const MOCK_DECISION_LOG: ExplainableDecisionLog = {
  incidentId: 'RS-2048',
  trainNumber: '12345 (Vande Bharat Express)',
  trackSection: 'Section 14B — Up Main Line',
  status: 'ACTION_CONFIRMED',
  deploymentMode: 'ADVISORY',
  steps: [
    {
      stepNumber: 1,
      agentName: 'Vision Hazard Detector (YOLOv11)',
      title: 'Track Obstacle Detected',
      detailText: 'Front camera #204 identified a 1.2m boulder on Track 1A at 340m distance (Confidence: 98.2%).',
      timestamp: '08:42:11 IST'
    },
    {
      stepNumber: 2,
      agentName: 'Telemetry Aggregator',
      title: 'Kinematic Data Queried',
      detailText: 'Fetched velocity V = 110 km/h, Mass M = 1400t, Friction μ = 0.35, Gradient G = +0.2%.',
      timestamp: '08:42:12 IST'
    },
    {
      stepNumber: 3,
      agentName: 'Kavach Braking Agent (RDSO Physics)',
      title: 'Emergency Braking Distance (EBD) Calculated',
      detailText: 'Computed stopping distance D_stop = 410m. Since obstacle is at 340m, collision risk flagged.',
      timestamp: '08:42:13 IST'
    },
    {
      stepNumber: 4,
      agentName: 'Dispatcher Review & Auto-Actuator',
      title: 'Action Approved & Solenoid Triggered',
      detailText: 'Controller OP-402 approved braking action in Advisory Mode. Emergency brake solenoid engaged. Train stopped 30m prior to hazard.',
      timestamp: '08:42:15 IST'
    }
  ],
  outcomeSummary: 'Train brought to complete halt at 310m mark. Zero casualties. Track maintenance crew dispatched.'
};

export const DEMO_VIDEO_STREAMS = {
  locoCabForwardView: 'https://assets.mixkit.co/videos/preview/mixkit-train-passing-through-a-green-landscape-42211-large.mp4',
  platformGatewayCctv: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-in-a-train-station-41553-large.mp4',
  ohePantographCam: 'https://assets.mixkit.co/videos/preview/mixkit-electric-train-moving-fast-on-railroad-tracks-43542-large.mp4'
};

export const DEMO_IMAGE_ASSETS = {
  trackHazardVision: '/assets/track_hazard_vision.jpg',
  platformGatewayCctv: '/assets/platform_gateway_cctv.png'
};
```

---

### Task 4: Run Test Suite and TypeScript Typecheck

**Files:**
- Test: `tests/contracts.test.ts`

- [ ] **Step 1: Run Vitest unit tests**

Run: `npx vitest run tests/contracts.test.ts`  
Expected Output: All 8 test suites PASS (100% assertions green).

- [ ] **Step 2: Run TypeScript compiler validation**

Run: `npx tsc --noEmit`  
Expected Output: Zero TypeScript compilation errors across entire project.

- [ ] **Step 3: Run full existing test suite to ensure zero regressions**

Run: `npx vitest run`  
Expected Output: All test suites (`railsuraksha.test.ts`, `advanced_features.test.ts`, etc.) PASS.

- [ ] **Step 4: Commit changes**

```bash
git add src/types/apiContracts.ts src/lib/mockData.ts tests/contracts.test.ts docs/RESEARCH_GROUNDING_DEV01_CONTRACTS_FIXES.md
git commit -m "feat(contracts): implement hardened DEV-01 IRIS AI data contracts and grounded mock datasets"
```
