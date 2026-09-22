# IRIS AI — TypeScript Domain Schema & Contract Definitions

**System Name:** IRIS AI (Intelligent Railway Inspection and Restoration AI): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.1.0 (Grounded Multi-Horizon & Decoupled Architecture Specification)  
**Location:** `src/types/apiContracts.ts` & `src/types/index.ts`  
**Governing Standards Reference:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 💻 1. Core Domain Enumerations & Types

```typescript
// ============================================================================
// 1. Core System & Department Enums
// ============================================================================

export type DeploymentMode = 'ADVISORY' | 'AUTONOMOUS';

export type DepartmentCode = 'TMS_CIVIL' | 'TDMS_ELECTRICAL' | 'SMMS_SIGNAL';

export type AssetCategory = 
  | 'RAIL_TRACK' 
  | 'OHE_CATENARY' 
  | 'POINT_MACHINE' 
  | 'TRACK_CIRCUIT'
  | 'AXLE_COUNTER';

export type UrgencyTier = 'P1_CRITICAL' | 'P2_SCHEDULED' | 'P3_ROUTINE';

export type HorizonTier = 'TACTICAL_24H' | 'WEEKLY_7D' | 'MONTHLY_30D';

export type BlockSanctionStatus = 'RECOMMENDED' | 'SANCTIONED' | 'REJECTED' | 'CANCELLED';

export type SignalAspect = 'RED' | 'YELLOW' | 'DOUBLE_YELLOW' | 'GREEN';

export type UsfdClassification = 'IMR' | 'OBS' | 'REM' | 'NONE';

export type TrainType = 
  | 'PREMIUM_PASSENGER' 
  | 'EXPRESS_PASSENGER' 
  | 'SUBURBAN_EMU' 
  | 'FREIGHT_GOODS';
```

---

## ⚙️ 2. Dynamic Policy Configuration & Ingestion Contracts

```typescript
// ============================================================================
// 2. Dynamic Policy Profile & Ingestion Port Interfaces
// ============================================================================

export interface DivisionalPolicyProfile {
  policyId: string;                      // e.g. "POL-CR-MUMBAI-2026-V1"
  divisionCode: string;                  // "CR_MUMBAI"
  version: string;                       // "1.2.0"
  minPassengerClearanceMin: number;      // Parameterized (default reference: 15)
  oheEarthingBufferMin: number;          // Parameterized (default reference: 10)
  oheRestorationBufferMin: number;       // Parameterized (default reference: 10)
  defaultTsrSpeedKmph: number;           // Parameterized (default reference: 30)
  urgencyWeights: {
    safety: number;                      // default: 0.40
    overdue: number;                     // default: 0.35
    traffic: number;                     // default: 0.25
  };
  secondaryDelayPenaltyWeight: number;   // default: 1.50
  isLocked?: boolean;
}

export interface BaseIngestionPayload {
  sourceSystem: 'TMS' | 'TDMS' | 'SMMS' | 'COA' | 'CSV_FEED' | 'SIMULATOR';
  schemaVersion: string;
  rawPayload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface IIngestionAdapter<TRaw, TNormalized> {
  readonly adapterName: string;
  readonly schemaVersion: string;
  validate(raw: TRaw): Promise<boolean>;
  transform(raw: TRaw, policy: DivisionalPolicyProfile): Promise<TNormalized[]>;
}
```

---

## 📦 3. Requisition & Maintenance Models

```typescript
// ============================================================================
// 3. Ingested Maintenance Demand Model (TMS / TDMS / SMMS)
// ============================================================================

export interface MaintenanceDemand {
  id: string;                      // e.g. "TMS-2026-804"
  department: DepartmentCode;      // 'TMS_CIVIL' | 'TDMS_ELECTRICAL' | 'SMMS_SIGNAL'
  assetType: AssetCategory;        // 'RAIL_TRACK' | 'OHE_CATENARY' | 'POINT_MACHINE'
  sectionId: string;               // e.g. "CSMT-KYN-UP"
  chainageKm: string;              // e.g. "KM 108/4 - 112/2"
  trackCircuitId: string;          // e.g. "TC-03"
  urgencyTier: UrgencyTier;        // 'P1_CRITICAL' | 'P2_SCHEDULED' | 'P3_ROUTINE'
  urgencyScore: number;            // 0.00 to 1.00
  description: string;
  usfdClassification?: UsfdClassification; // 'IMR' (Immediate Removal per IRPWM)
  tgiScore?: number;               // Track Geometry Index (e.g. 32.4)
  contactWireResidualAreaSqMm?: number; // ACTM < 74 mm² reference limit
  pointMachineStrokeSeconds?: number;   // IRSEM > 4.5s alert
  pointMachineCurrentAmps?: number;     // IRSEM > 2.5A alert
  formST351Required?: boolean;     // Statutory Disconnection Notice
  estimatedDurationMinutes: number;// Work duration in minutes
  requiredAssets: string[];         // ["CSM_TAMPER_98", "TOWER_WAGON_02"]
  canShadowBlock: boolean;         // True if co-locatable with OHE/Civil
  status: 'PENDING_TRIAGE' | 'SLOTTED' | 'SANCTIONED' | 'COMPLETED';
  rawPayload?: Record<string, unknown>; // Preserved raw external payload
  metadata?: Record<string, unknown>;   // Extensible custom attributes
  createdAt?: string;
}
```

---

## 🚂 4. Train Scheduling & Traffic Slot Models

```typescript
// ============================================================================
// 4. Train Timetable & Section Path Slot Model (COA Integration)
// ============================================================================

export interface TrainScheduleSlot {
  trainNumber: string;             // e.g. "12127"
  trainName: string;               // e.g. "Mumbai-Pune Intercity Exp"
  trainType: TrainType;
  sectionId: string;
  entryStation: string;            // "CSMT"
  exitStation: string;             // "Kalyan"
  entryTime: string;               // e.g. "01:10 IST"
  exitTime: string;                // e.g. "02:15 IST"
  isDelayTolerant: boolean;        // False for passenger, True for freight
  maxAllowableDelayMinutes: number;// 0 for passenger, 30 for freight
  priorityRank: number;            // 1 (Highest: Rajdhani) to 5 (Freight)
  metadata?: Record<string, unknown>;
}
```

---

## 🧩 5. Joint Shadow-Block & Optimization Models `[Grounded Core]`

```typescript
// ============================================================================
// 5. Bundled Joint Shadow-Block Plan Model (Solver Output)
// ============================================================================

export interface JointBlockSchedule {
  blockId: string;                 // e.g. "BLK-JOINT-0906-01"
  sectionId: string;               // e.g. "CSMT-KYN-UP"
  policyId?: string;               // Policy configuration used for optimization
  trackCircuits: string[];         // ["TC-03", "TC-04"]
  startTime: string;               // e.g. "01:30 IST"
  endTime: string;                 // e.g. "04:45 IST"
  durationMinutes: number;         // 195 minutes
  bundledDemandIds: string[];      // ["TMS-804", "TDMS-312", "SMMS-105"]
  bundledDemands?: MaintenanceDemand[];
  downtimeSavedMinutes: number;    // Co-located bundling savings (e.g. 85m)
  corridorDowntimeSavedPct: number;// e.g. 38.4%
  passengerDelays: number;         // Strictly 0 (Grounded Invariant)
  passengerClearanceBufferMinutes: number; // Configurable (default: 15m)
  freightDelayMinutes: number;     // e.g. 12m
  kavachTsrSpeedKmh: number;       // e.g. 30 km/h (Configurable)
  cautionOrderForm: 'T/409';
  disconnectionForm: 'S&T/T-351';
  sanctionStatus: BlockSanctionStatus;
  sanctionedBy?: string;           // "CTRL-MUM-402"
  sha256AuditSeal: string;         // Hexadecimal cryptographic signature
  metadata?: Record<string, unknown>;
}
```

---

## 🛡️ 6. Safety, Kavach TSR & Interlocking Models

```typescript
// ============================================================================
// 6. Safety Telemetry, Kavach TSR & Interlocking Data Contracts
// ============================================================================

export interface KavachTsrPacket {
  tsrId: string;                   // "TSR-KAVACH-104"
  trackCircuitId: string;          // "TC-03"
  permittedSpeedKmh: number;       // Configurable (default: 30)
  activationTimestamp: string;
  expirationTimestamp: string;
  broadcastStatus: 'ARMED' | 'BROADCASTING' | 'CLEARED';
  policyVersion?: string;
}

export interface TrackCircuitState {
  circuitId: string;               // "TC-01" .. "TC-06"
  name: string;                    // "Dadar"
  status: 'CLEAR' | 'OCCUPIED' | 'BLOCKED_TSR';
  signalId: string;                // "S-12"
  signalAspect: SignalAspect;      // 'RED' | 'YELLOW' | 'DOUBLE_YELLOW' | 'GREEN'
  isClampedRed: boolean;           // True under Form S&T/T-351 lockout
  activeBlockId?: string;
  metadata?: Record<string, unknown>;
}

export interface CorridorKpiMetrics {
  corridorDowntimeSavedPct: number;
  assetAvailabilityIndexPct: number;
  activeBlocksCount: number;
  pendingDemandsCount: number;
  whiteCorridorHeadwayMinutes: number;
  activeKavachTsrsCount: number;
}
```

---

## 📜 7. Explainable AI Decision Dossier Model

```typescript
// ============================================================================
// 7. Explainable 4-Step Decision Dossier (RDSO Form 14B Compliance)
// ============================================================================

export interface DecisionStep {
  step: 1 | 2 | 3 | 4;
  title: string;
  detail: string;
  timestamp: string;
  authorityRef: string; // e.g. "IRPWM 2020 Ch 5", "G&SR Rule 15.06"
}

export interface ExplainableDecisionDossier {
  blockId: string;
  corridorSection: string;
  sanctionedBy: string;
  sanctionTimestamp: string;
  sha256VerificationHash: string;
  steps: DecisionStep[];
  formST351Confirmed: boolean;
  formT409CautionBroadcast: boolean;
  kavachTsrArmed: boolean;
  rdsoForm14BValid: boolean;
  policyVersionUsed?: string;
}
```

