# IRIS AI — API Design & Interface Specifications

**System Name:** IRIS AI (Intelligent Railway Inspection and Restoration AI): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.1.0 (Grounded Multi-Horizon & Decoupled Architecture Specification)  
**Base URL:** `/api/v1` (REST) & `/ws/v1` (WebSockets)  
**Governing Standards Reference:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 🌐 1. REST Endpoints Specification

### 1.1 Pluggable Departmental Ingestion & Adapter Mapping

#### `POST /api/v1/ingestion/tms/sync`
* **Description:** Ingests Civil P-Way track defects, USFD records, and TGI deficits through the TMS Ingestion Adapter.
* **Request Payload:**
  ```json
  {
    "schemaVersion": "1.0.0",
    "sectionId": "CSMT-KYN-UP",
    "defects": [
      {
        "chainageKm": "KM 108/4 - 112/2",
        "usfdClassification": "IMR",
        "tgiScore": 32.4,
        "description": "Transverse rail fissure detected by TRC-04",
        "estimatedDurationMinutes": 180,
        "rawPayload": { "trcRunId": "TRC-2026-09", "probeRef": "PRB-88" },
        "metadata": { "divisionSpecificCode": "CSMT-D4" }
      }
    ]
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "adapterName": "TMS_INGESTION_ADAPTER",
    "ingestedCount": 1,
    "normalizedTrackCircuits": ["TC-03"],
    "assignedUrgencyTier": "P1_CRITICAL"
  }
  ```

#### `POST /api/v1/ingestion/tdms/sync`
* **Description:** Ingests Electrical TRD 25kV OHE catenary/contact wire wear logs and power cut requests through the TDMS Adapter.
* **Response (200 OK):** `{ "success": true, "adapterName": "TDMS_INGESTION_ADAPTER", "ingestedCount": 2 }`

#### `POST /api/v1/ingestion/smms/sync`
* **Description:** Ingests S&T point machine cycle logs and statutory Form S&T/T-351 disconnection demands through the SMMS Adapter.
* **Response (200 OK):** `{ "success": true, "adapterName": "SMMS_INGESTION_ADAPTER", "ingestedCount": 3, "formST351Generated": true }`

#### `POST /api/v1/ingestion/coa/timetables`
* **Description:** Ingests COA working timetables, live train GPS positions, and goods freight forecasts through the COA Adapter.
* **Response (200 OK):** `{ "success": true, "activePassengerTrains": 28, "forecastedFreightPaths": 12 }`

---

### 1.2 Divisional Policy & Safety Configuration Engine

#### `GET /api/v1/config/policy/:divisionCode`
* **Description:** Retrieves the active safety policy profile and constraint parameters for a railway division.
* **Response (200 OK):**
  ```json
  {
    "policyId": "POL-CR-MUMBAI-2026-V1",
    "divisionCode": "CR_MUMBAI",
    "version": "1.2.0",
    "minPassengerClearanceMin": 15,
    "oheEarthingBufferMin": 10,
    "oheRestorationBufferMin": 10,
    "defaultTsrSpeedKmph": 30,
    "urgencyWeights": {
      "safety": 0.40,
      "overdue": 0.35,
      "traffic": 0.25
    },
    "secondaryDelayPenaltyWeight": 1.5,
    "isLocked": false,
    "updatedAt": "2026-09-20T14:30:00Z"
  }
  ```

#### `PUT /api/v1/config/policy/:divisionCode`
* **Description:** Updates divisional safety buffers and urgency weight coefficients at runtime without application downtime.
* **Request Payload:**
  ```json
  {
    "minPassengerClearanceMin": 18,
    "urgencyWeights": { "safety": 0.45, "overdue": 0.30, "traffic": 0.25 }
  }
  ```
* **Response (200 OK):** `{ "success": true, "updatedPolicyId": "POL-CR-MUMBAI-2026-V2" }`

---

### 1.3 ML Urgency Triage & Priority Scoring

#### `GET /api/v1/triage/demands`
* **Description:** Retrieves all pending maintenance demands ranked by urgency score computed against the active policy profile.
* **Query Parameters:** `sectionId=CSMT-KYN-UP&urgency=ALL&horizon=TACTICAL_24H`
* **Response (200 OK):** `Array<MaintenanceDemandRecord>`

#### `POST /api/v1/triage/score`
* **Description:** Recomputes dynamic urgency score for a single defect when track condition or traffic congestion changes.
* **Request Payload:** `{ "demandId": "TMS-2026-804", "daysOverdue": 14, "trafficDensityIndex": 0.88 }`
* **Response (200 OK):** `{ "demandId": "TMS-2026-804", "urgencyScore": 0.94, "urgencyTier": "P1_CRITICAL" }`

---

### 1.4 Joint Shadow-Block Optimizer Core `[Grounded Core]`

#### `POST /api/v1/optimizer/solve-corridor`
* **Description:** Executes Google OR-Tools CP-SAT disjunctive scheduling engine parameterized by the active policy profile across specified horizon.
* **Request Payload:**
  ```json
  {
    "corridorSectionId": "CSMT-KYN-UP",
    "horizon": "TACTICAL_24H",
    "targetDate": "2026-09-06",
    "policyVersion": "POL-CR-MUMBAI-2026-V1",
    "allowNightLullOnly": true,
    "maxAllowableFreightDelayMinutes": 30
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "blockPlan": {
      "blockId": "BLK-JOINT-0906-01",
      "sectionId": "CSMT-KYN-UP",
      "trackCircuitIds": ["TC-03", "TC-04"],
      "startTime": "2026-09-06T01:30:00Z",
      "endTime": "2026-09-06T04:45:00Z",
      "durationMinutes": 195,
      "bundledDemandCount": 3,
      "downtimeSavedMinutes": 85,
      "corridorDowntimeSavedPct": 38.4,
      "passengerCancellations": 0,
      "kavachTsrSpeedKmh": 30,
      "policyVersionUsed": "POL-CR-MUMBAI-2026-V1"
    }
  }
  ```

#### `GET /api/v1/optimizer/schedules/active`
* **Description:** Returns the active corridor schedule formatted for SVG Time-Distance String Chart rendering.
* **Query Parameters:** `horizon=TACTICAL_24H`
* **Response (200 OK):** `{ "trainSchedules": [...], "jointBlocks": [...] }`

---

### 1.5 Section Controller Sanction & Actuation

#### `POST /api/v1/blocks/:blockId/sanction`
* **Description:** Section Controller one-click block sanction triggering decoupled safety actuation adapters with optimistic concurrency control.
* **Request Payload:**
  ```json
  {
    "operatorId": "CTRL-MUM-402",
    "optimisticLockVersion": 1,
    "approvalMode": "ADVISORY",
    "sanctionSlot": {
      "startTime": "2026-09-06T01:30:00Z",
      "endTime": "2026-09-06T04:45:00Z"
    },
    "enforceKavachTsr": true
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "blockId": "BLK-JOINT-0906-01",
    "sanctionStatus": "SANCTIONED",
    "version": 2,
    "kavachTsrBroadcastId": "TSR-KAVACH-104",
    "signalLockoutAspect": "RED_CLAMPED",
    "formST351Status": "ISSUED",
    "formT409Status": "BROADCAST",
    "sha256AuditSeal": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```

#### `GET /api/v1/ingestion/dead-letter-queue`
* **Description:** Retrieves unparseable or unmapped external payloads for manual supervisor review and geo-tagging.
* **Response (200 OK):** `Array<DeadLetterIngestionRecord>`

#### `GET /api/v1/sync/events`
* **Description:** Event replay endpoint allowing reconnected WebSocket clients to catch up on missed state transitions.
* **Query Parameters:** `since_seq=1042&limit=50`
* **Response (200 OK):** `{ "events": [...], "latestSeq": 1048 }`

#### `POST /api/v1/blocks/:blockId/reject`
* **Description:** Controller rejects proposed block with operational justification, prompting solver to re-optimize.
* **Request Payload:** `{ "reason": "Late running Express #12138", "preferredSearchWindow": "AFTER_0245" }`
* **Response (200 OK):** `{ "reScheduled": true, "alternativeBlockId": "BLK-JOINT-0906-02" }`

---

### 1.6 Safety, Kavach TSR & Compliance

#### `GET /api/v1/safety/kavach-tsr/active`
* **Description:** Streams all active digital Temporary Speed Restrictions broadcast to locomotive cab units.
* **Response (200 OK):** `Array<KavachTsrPacket>`

#### `GET /api/v1/auditor/dossier/:blockId`
* **Description:** Retrieves the complete 4-step explainable AI decision dossier signed with SHA-256 hash.
* **Response (200 OK):** `ExplainableDecisionDossier`

#### `GET /api/v1/auditor/form-14b/:blockId`
* **Description:** Generates certified RDSO Form 14B Safety Compliance Certificate (JSON/PDF).

---

## ⚡ 2. WebSocket Real-Time Telemetry Specification

### `WS /ws/v1/corridor-telemetry`
* **Protocol Invariant:** All outgoing messages contain monotonic sequence numbers (`seq_id: number`) for client desynchronization detection.
* **Channel Subscriptions:**
  * `TRAIN_TRACKING`: Real-time GPS location updates ($1\text{ Hz}$).
  * `CIRCUIT_OCCUPANCY`: Track circuits `TC-01` through `TC-06` status changes (`CLEAR` $\leftrightarrow$ `OCCUPIED` $\leftrightarrow$ `BLOCKED_TSR`).
  * `BLOCK_SANCTION_EVENTS`: Instant notification of block sanction or cancellation.
  * `KAVACH_TSR_STREAM`: Real-time Temporary Speed Restriction broadcasts and locomotive acknowledgments.
  * `POLICY_CHANGE_STREAM`: Real-time broadcast of policy parameter updates across connected client sessions.


