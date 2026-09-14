# RailSuraksha AI — API Endpoints & Backend Data Structure Specification

> **Location:** `docs/api_endpoints_and_backend_schema.md`  
> **System:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
> **Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
> **Document Version:** 2.0.0 (SIH 26027 Refactored Architecture)

---

## 🌐 1. API Endpoints Specification

### 1.1 Multi-Source Departmental Ingestion Endpoints
* `POST /api/v1/ingestion/tms/sync`
  * **Purpose:** Ingests civil track defect alerts, ultrasonic flaw detection (USFD) records, and Track Geometry Index (TGI) deficits.
  * **Request Payload:** `TmsIngestionPayload`
  * **Response:** `{ success: true, ingestedCount: 14, normalizedSection: "CSMT-KYN" }`
* `POST /api/v1/ingestion/smms/sync`
  * **Purpose:** Ingests S&T point machine cycle counts, track circuit relay alerts, and electronic interlocking disconnection requests.
  * **Request Payload:** `SmmsIngestionPayload`
  * **Response:** `{ success: true, ingestedCount: 8 }`
* `POST /api/v1/ingestion/tdms/sync`
  * **Purpose:** Ingests electrical TRD 25kV OHE catenary/contact wire wear logs, neutral section overhauls, and power block demands.
  * **Request Payload:** `TdmsIngestionPayload`
  * **Response:** `{ success: true, ingestedCount: 6 }`
* `POST /api/v1/ingestion/coa/timetables`
  * **Purpose:** Ingests real-time train positions, scheduled timetables, and freight path forecasts from Control Office Application.
  * **Request Payload:** `CoaTimetablePayload`
  * **Response:** `{ success: true, activeTrains: 42, freightRakesForecasted: 18 }`

---

### 1.2 ML Urgency Triage & Priority Scoring Endpoints
* `GET /api/v1/triage/demands`
  * **Purpose:** Retrieves all pending maintenance demands across Civil, Electrical, and Signal directorates, ranked by calculated urgency score.
  * **Query Params:** `sectionId=SEC-KYN-01&urgency=ALL&horizon=TACTICAL_24H`
  * **Response:** `Array<MaintenanceDemandRecord>`
* `POST /api/v1/triage/score`
  * **Purpose:** Dynamically re-evaluates urgency score when new flaw parameters or traffic delays are detected.
  * **Request Payload:** `UrgencyScoringRequest`
  * **Response:** `UrgencyScoringResult` (Urgency Tier: `P1_CRITICAL` | `P2_SCHEDULED` | `P3_ROUTINE`, calculated score 0.0–1.0).

---

### 1.3 Joint Shadow-Block Optimizer Endpoints
* `POST /api/v1/optimizer/solve-corridor`
  * **Purpose:** Triggers the Mixed-Integer Linear Programming (MILP) solver to generate an optimized block plan bundling co-located maintenance into traffic gaps.
  * **Request Body:**
    ```json
    {
      "corridorSectionId": "CSMT-KYN-UP",
      "horizon": "TACTICAL_24H",
      "targetDate": "2026-09-06",
      "maxAllowedFreightDelayMinutes": 30,
      "allowNightLullOnly": true
    }
    ```
  * **Response Body:** `BlockPlanResolution`
    * Array of bundled joint block windows.
    * Corridor downtime saved percentage (e.g. `38.4%`).
    * Train delay impact summary (`zeroPassengerDelays: true`).
    * Kavach TSR speed restrictions generated.
* `GET /api/v1/optimizer/schedules/active`
  * **Purpose:** Returns the current corridor schedule for the Time-Distance String Chart / Gantt UI.
  * **Query Params:** `horizon=TACTICAL_24H`
  * **Response:** `CorridorScheduleView`

---

### 1.4 e-BDMS Sanction & Controller Workflow Endpoints
* `POST /api/v1/blocks/:blockId/sanction`
  * **Purpose:** Section Controller one-click sanction of an AI-recommended joint maintenance block.
  * **Request Body:**
    ```json
    {
      "operatorId": "CTRL-MUM-402",
      "approvalMode": "ADVISORY",
      "sanctionedSlot": {
        "startTime": "2026-09-06T01:30:00Z",
        "endTime": "2026-09-06T04:45:00Z"
      },
      "enforceKavachTsr": true
    }
    ```
  * **Response:** `BlockSanctionResponse` (Block ID, Sanction Status `SANCTIONED`, Kavach TSR Broadcast ID, SHA-256 Audit Seal).
* `POST /api/v1/blocks/:blockId/reject`
  * **Purpose:** Controller rejects a proposed block with operational justification, prompting the solver to find an alternative window.
  * **Request Body:** `{ "reason": "Late running express train 12138", "alternativePreference": "AFTER_0300" }`

---

### 1.5 Safety, Kavach TSR & Interlocking Endpoints
* `GET /api/v1/safety/kavach-tsr/active`
  * **Purpose:** Streams all active Temporary Speed Restrictions broadcast to locomotive cab units.
  * **Response:** `Array<KavachTsrPacket>`
* `GET /api/v1/safety/interlocking-status/:sectionId`
  * **Purpose:** Returns live track circuit occupancy and signal lockout aspects for circuits `TC-01` through `TC-06`.
  * **Response:** `TrackInterlockingState`

---

## 📦 2. Core Backend Data Schemas (TypeScript & Pydantic)

### 2.1 Unified Maintenance Demand Model
```typescript
export type DepartmentCode = 'TMS_CIVIL' | 'TDMS_ELECTRICAL' | 'SMMS_SIGNAL';
export type UrgencyTier = 'P1_CRITICAL' | 'P2_SCHEDULED' | 'P3_ROUTINE';

export interface MaintenanceDemandRecord {
  demandId: string;
  department: DepartmentCode;
  assetType: 'RAIL_TRACK' | 'OHE_CATENARY' | 'POINT_MACHINE' | 'TRACK_CIRCUIT';
  sectionId: string;
  chainageStartKm: number; // e.g. 108.4
  chainageEndKm: number;   // e.g. 112.2
  trackCircuitId: string;  // e.g. "TC-03"
  urgencyTier: UrgencyTier;
  urgencyScore: number;    // 0.00 - 1.00
  estimatedDurationMinutes: number;
  requiredAssets: string[]; // e.g. ["CSM_TAMPER_98", "TOWER_WAGON_04"]
  canShadowBlock: boolean;
  status: 'PENDING_TRIAGE' | 'SLOTTED' | 'SANCTIONED' | 'COMPLETED';
}
```

### 2.2 Train Schedule & Path Slot Model
```typescript
export interface TrainScheduleSlot {
  trainNumber: string;
  trainName: string;
  trainType: 'PREMIUM_PASSENGER' | 'EXPRESS_PASSENGER' | 'SUBURBAN' | 'FREIGHT';
  sectionId: string;
  entryTime: string;
  exitTime: string;
  isDelayTolerant: boolean;
  maxAllowableDelayMinutes: number;
  priorityRank: number; // 1 (highest) to 5
}
```

### 2.3 Joint Shadow-Block Resolution Model
```typescript
export interface JointBlockPlan {
  blockId: string;
  sectionId: string;
  trackCircuitIds: string[]; // ["TC-03", "TC-04"]
  startTime: string;
  endTime: string;
  durationMinutes: number;
  bundledDemands: MaintenanceDemandRecord[];
  coLocatedSavingsMinutes: number;
  trafficLullIdentified: string; // e.g. "01:30 - 04:45 IST Night Window"
  passengerCancellations: number; // Strictly 0
  freightDelayMinutes: number;
  kavachTsr: {
    tsrSpeedKmh: number; // e.g. 30 km/h
    affectedSections: string[];
    broadcastStatus: 'ARMED' | 'BROADCASTING' | 'CLEARED';
  };
  sanctionStatus: 'RECOMMENDED' | 'SANCTIONED' | 'REJECTED';
}
```

### 2.4 Explainable Decision Dossier Model
```typescript
export interface ExplainableDecisionDossier {
  blockId: string;
  corridorSection: string;
  sha256VerificationHash: string;
  sanctionedBy: string;
  sanctionTimestamp: string;
  steps: [
    {
      step: 1;
      title: "Multi-Source Data Ingestion";
      detail: "Normalized 3 TMS defect markers, 1 TDMS 25kV power cut demand, and COA live train paths.";
    },
    {
      step: 2;
      title: "Traffic Conflict & Headway Analysis";
      detail: "Avoided 14:00 freight path bottleneck. Identified natural 3h 15m night traffic lull.";
    },
    {
      step: 3;
      title: "Joint Shadow-Block Bundling";
      detail: "Bundled OHE catenary wash with civil track tamping under single 210-min window, saving 85 mins of downtime.";
    },
    {
      step: 4;
      title: "Safety Dissemination & Sanction Output";
      detail: "Generated Kavach TSR 30 km/h for adjacent tracks and locked S-12 signal aspect.";
    }
  ];
}
```
