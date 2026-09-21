# RailSuraksha AI — API Design & Interface Specifications

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Base URL:** `/api/v1` (REST) & `/ws/v1` (WebSockets)  
**Governing Standards:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0.

---

## 🌐 1. REST Endpoints Specification

### 1.1 Multi-Source Departmental Ingestion

#### `POST /api/v1/ingestion/tms/sync`
* **Description:** Ingests Civil P-Way track defects, ultrasonic flaw detection (USFD) records, and Track Geometry Index (TGI) deficits per *IRPWM 2020*.
* **Request Payload:**
  ```json
  {
    "sectionId": "CSMT-KYN-UP",
    "defects": [
      {
        "chainageKm": "KM 108/4 - 112/2",
        "usfdClassification": "IMR",
        "tgiScore": 32.4,
        "description": "Transverse rail fissure detected by TRC-04",
        "estimatedDurationMinutes": 180
      }
    ]
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "ingestedCount": 1,
    "normalizedTrackCircuits": ["TC-03"],
    "assignedUrgencyTier": "P1_CRITICAL"
  }
  ```

#### `POST /api/v1/ingestion/tdms/sync`
* **Description:** Ingests Electrical TRD 25kV OHE catenary/contact wire residual area wear logs ($< 74\text{ mm}^2$), insulator washing schedules, and power cut requests per *ACTM Vol II*.
* **Response (200 OK):** `{ "success": true, "ingestedCount": 2, "earthingBufferMinutes": 10 }`

#### `POST /api/v1/ingestion/smms/sync`
* **Description:** Ingests S&T point machine cycle logs ($> 4.5\text{s}$ stroke time / $> 2.5\text{A}$ current) and statutory **Form S&T/T-351** disconnection demands per *IRSEM 2021*.
* **Response (200 OK):** `{ "success": true, "ingestedCount": 3, "formST351Generated": true }`

#### `POST /api/v1/ingestion/coa/timetables`
* **Description:** Ingests Control Office Application working timetables, live train GPS positions, and goods freight forecasts.
* **Response (200 OK):** `{ "success": true, "activePassengerTrains": 28, "forecastedFreightPaths": 12 }`

---

### 1.2 ML Urgency Triage & Priority Scoring

#### `GET /api/v1/triage/demands`
* **Description:** Retrieves all pending maintenance demands across Civil, Electrical, and Signal directorates ranked by urgency score.
* **Query Parameters:** `sectionId=CSMT-KYN-UP&urgency=ALL&horizon=TACTICAL_24H`
* **Response (200 OK):** `Array<MaintenanceDemandRecord>`

#### `POST /api/v1/triage/score`
* **Description:** Recomputes dynamic urgency score for a single defect when track condition or traffic congestion changes.
* **Request Payload:** `{ "demandId": "TMS-2026-804", "daysOverdue": 14, "trafficDensityIndex": 0.88 }`
* **Response (200 OK):** `{ "demandId": "TMS-2026-804", "urgencyScore": 0.94, "urgencyTier": "P1_CRITICAL" }`

---

### 1.3 Joint Shadow-Block Optimizer Core

#### `POST /api/v1/optimizer/solve-corridor`
* **Description:** Executes Google OR-Tools CP-SAT disjunctive scheduling engine to bundle co-located maintenance demands into traffic gaps.
* **Request Payload:**
  ```json
  {
    "corridorSectionId": "CSMT-KYN-UP",
    "horizon": "TACTICAL_24H",
    "targetDate": "2026-09-06",
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
      "kavachTsrSpeedKmh": 30
    }
  }
  ```

#### `GET /api/v1/optimizer/schedules/active`
* **Description:** Returns the active corridor schedule formatted for SVG Time-Distance String Chart rendering.
* **Query Parameters:** `horizon=TACTICAL_24H`
* **Response (200 OK):** `{ "trainSchedules": [...], "jointBlocks": [...] }`

---

### 1.4 Section Controller Sanction & Actuation

#### `POST /api/v1/blocks/:blockId/sanction`
* **Description:** Section Controller one-click block sanction triggering automatic safety dispatch.
* **Request Payload:**
  ```json
  {
    "operatorId": "CTRL-MUM-402",
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
    "kavachTsrBroadcastId": "TSR-KAVACH-104",
    "signalLockoutAspect": "RED_CLAMPED",
    "formST351Status": "ISSUED",
    "formT409Status": "BROADCAST",
    "sha256AuditSeal": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```

#### `POST /api/v1/blocks/:blockId/reject`
* **Description:** Controller rejects proposed block with operational justification, prompting solver to re-optimize.
* **Request Payload:** `{ "reason": "Late running Express #12138", "preferredSearchWindow": "AFTER_0245" }`
* **Response (200 OK):** `{ "reScheduled": true, "alternativeBlockId": "BLK-JOINT-0906-02" }`

---

### 1.5 Safety, Kavach TSR & Compliance

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
* **Channel Subscriptions:**
  * `TRAIN_TRACKING`: Real-time GPS location updates ($1\text{ Hz}$).
  * `CIRCUIT_OCCUPANCY`: Track circuits `TC-01` through `TC-06` status changes (`CLEAR` $\leftrightarrow$ `OCCUPIED` $\leftrightarrow$ `BLOCKED_TSR`).
  * `BLOCK_SANCTION_EVENTS`: Instant notification of block sanction or cancellation.
  * `KAVACH_TSR_STREAM`: Real-time Temporary Speed Restriction broadcasts and locomotive acknowledgments.
