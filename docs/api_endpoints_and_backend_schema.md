# RailSuraksha AI — API Endpoints & Backend Data Structure Specification

> **Location:** `docs/api_endpoints_and_backend_schema.md`  
> **Purpose:** Comprehensive REST, SSE, WebSocket API specification and Backend Data Schemas for RailSuraksha AI.  
> **Last Updated:** 2026-08-21  

---

## 🌐 1. API Endpoints Specification

### 1.1 Multi-Camera Video & Edge Telemetry Ingestion
- `GET /api/v1/streams/loco-cab/:locoId/stream` (SSE / HLS / WebSocket)
  - **Purpose:** Delivers live video frame feed with YOLOv11 bounding boxes and distance metadata.
  - **Response Payload:** `LocoStreamFrame`
- `GET /api/v1/streams/platform-gateway/:stationId/:pillarId` (SSE / WebSocket)
  - **Purpose:** Delivers platform gateway entrance CCTV video stream with optical flow vectors and crowd count.
  - **Response Payload:** `GatewayStreamFrame`
- `GET /api/v1/streams/ohe/:sectionId` (SSE)
  - **Purpose:** Delivers Overhead Equipment (OHE) camera feed for pantograph spark & catenary line monitoring.

---

### 1.2 AI Triage Agent & Incident Management Endpoints
- `POST /api/v1/triage/classify`
  - **Request Body:** `RawAnomalyPayload`
  - **Response Body:** `TriageClassificationResult` (Severity: `CRITICAL` | `MODERATE` | `LOW`, confidence %, assigned handler).
- `GET /api/v1/triage/queue`
  - **Query Params:** `status=active&severity=all`
  - **Response Body:** `Array<IncidentRecord>`
- `POST /api/v1/triage/incidents/:id/review`
  - **Request Body:** `{ action: "APPROVE" | "REJECT", operatorId: "OP-402", reason?: string }`
  - **Response Body:** `IncidentReviewResponse`

---

### 1.3 Kavach Braking Agent Endpoints (Critical Safety)
- `POST /api/v1/braking/calculate-ebd`
  - **Request Body:** `EbdCalculationRequest`
    - Speed ($V$ in km/h), Mass ($M$ in tonnes), Friction ($\mu$), Gradient ($G$), Obstacle Distance ($D_{\text{obstacle}}$ in meters).
  - **Response Body:** `EbdCalculationResponse`
    - Safe Stopping Distance ($D_{\text{stop}}$ in meters), Hazard Warning Flag (`isHazardDetected`), Required Brake Deceleration ($a$ in $\text{m/s}^2$).
- `POST /api/v1/braking/execute-command`
  - **Request Body:** `{ incidentId: string, locoId: string, brakeMode: "EMERGENCY_SOLENOID", mode: "ADVISORY" | "AUTONOMOUS", confirmedBy?: string }`
  - **Response Body:** `{ success: boolean, commandId: string, executionTimestamp: string, brakeState: "ACTUATED" }`
- `WS /api/v1/braking/pipeline-stream`
  - **Purpose:** Real-time WebSocket channel streaming the sequential execution of the 4 agents (Agent 1 $\to$ Agent 2 $\to$ Agent 3 $\to$ Agent 4).

---

### 1.4 Section Dispatch Agent & Platform Hold Endpoints
- `GET /api/v1/dispatch/interlocking-map`
  - **Response Body:** `TrackInterlockingState` (Circuits `BLK-101`, signals `S-12`/`S-14`, switches `P-4A`).
- `GET /api/v1/dispatch/hold-timer/:platformId`
  - **Response Body:** `PlatformHoldState` (Platform number, remaining time in seconds, gateway occupancy index $\rho$, dynamic ML extension flag).
- `POST /api/v1/dispatch/override-hold`
  - **Request Body:** `{ platformId: string, action: "RELEASE" | "EXTEND_3M", operatorId: string }`
  - **Response Body:** `PlatformHoldState`

---

### 1.5 System Mode & Audit Workspace Endpoints
- `GET /api/v1/system/mode`
  - **Response Body:** `{ mode: "ADVISORY" | "AUTONOMOUS", lastChangedBy: string, timestamp: string }`
- `PUT /api/v1/system/mode`
  - **Request Body:** `{ mode: "ADVISORY" | "AUTONOMOUS", operatorId: string }`
  - **Response Body:** `{ mode: "ADVISORY" | "AUTONOMOUS", success: true }`
- `GET /api/v1/audit/logs/:incidentId`
  - **Response Body:** `ExplainableDecisionLog`
- `POST /api/v1/audit/close-incident`
  - **Request Body:** `{ incidentId: string, auditorId: string, complianceNotes: string }`
  - **Response Body:** `AuditorComplianceReport`

---

## 🗄️ 2. Backend Data Structures & TypeScript Schemas

### 2.1 Triage & Anomaly Payload Schema
```typescript
export type SeverityLevel = 'CRITICAL' | 'MODERATE' | 'LOW';

export interface RawAnomalyPayload {
  anomalyId: string;
  sourceCameraId: string;
  cameraType: 'LOCO_CAB' | 'PLATFORM_GATEWAY' | 'OHE';
  timestamp: string; // ISO 8601
  rawFrameUrl: string;
  boundingBoxes: Array<{
    class: 'BOULDER' | 'RAIL_FRACTURE' | 'CROWD_SURGE' | 'CATTLE' | 'SIGNAL_OVERRUN';
    confidence: number; // 0.0 - 1.0
    x: number;
    y: number;
    width: number;
    height: number;
    estimatedDistanceMeters: number;
  }>;
}

export interface TriageClassificationResult {
  incidentId: string;
  rawAnomaly: RawAnomalyPayload;
  severityScore: number; // e.g. 0.982
  severityCategory: SeverityLevel;
  assignedAgent: 'KavachBrakingAgent' | 'SectionDispatchAgent' | 'RiskAuditAgent';
  status: 'PENDING_APPROVAL' | 'EXECUTING' | 'RESOLVED' | 'REJECTED';
}
```

---

### 2.2 Kavach Braking Physics Data Structure (RDSO EBD Formula)
$$\text{Stopping Distance } D_{\text{stop}} = \frac{V^2}{2 \cdot g \cdot (\mu + G)} + (V \cdot t_{\text{reaction}})$$

```typescript
export interface EbdCalculationRequest {
  trainId: string;
  locoId: string;
  velocityKmh: number; // Speed V in km/h
  massTonnes: number; // Mass M in tonnes
  coefficientFriction: number; // friction mu (e.g. 0.35)
  trackGradientPercent: number; // Gradient G (+1.2% uphill, -0.8% downhill)
  reactionTimeSeconds: number; // t_reaction (default: 1.2s)
  obstacleDistanceMeters: number; // D_obstacle
}

export interface EbdCalculationResponse {
  trainId: string;
  velocityKmh: number;
  obstacleDistanceMeters: number;
  calculatedStoppingDistanceMeters: number; // D_stop
  marginDistanceMeters: number; // D_obstacle - D_stop
  isCollisionRisk: boolean; // True if D_stop > D_obstacle
  requiredDecelerationMs2: number;
  autoBrakeCommandPayload: {
    command: 'APPLY_EMERGENCY_BRAKE';
    solenoidPulseMs: number;
    cabAlertAudio: string;
  };
}
```

---

### 2.3 Platform Gateway & Hold Timer Data Structure
```typescript
export interface PlatformHoldState {
  stationCode: string; // e.g. "CSMT"
  heldPlatformId: string; // e.g. "PLATFORM_18"
  adjacentPlatformId: string; // e.g. "PLATFORM_17"
  gatewayOccupancyIndex: number; // rho ratio 0.0 - 1.0 (e.g. 0.88 = 88%)
  gatewayCrowdCount: number; // e.g. 482
  holdFloorSecondsTotal: number; // 300 seconds (5 mins)
  remainingHoldSeconds: number; // e.g. 252 (04:12)
  isMlExtensionActive: boolean; // True if crowd density triggered +3m extension
  status: 'HOLD_ACTIVE' | 'CLEARING' | 'RELEASED' | 'OVERRIDDEN';
  lastUpdated: string;
}
```

---

### 2.4 Railway Track Interlocking GIS Data Structure
```typescript
export interface TrackBlockCircuit {
  circuitId: string; // e.g. "BLK-101"
  lineName: string; // e.g. "Up Main 1A"
  isOccupied: boolean;
  occupyingTrainId?: string; // e.g. "12345"
  speedLimitKmh: number;
}

export interface SignalAspectState {
  signalId: string; // e.g. "S-12"
  aspect: 'CLEAR' | 'CAUTION' | 'STOP' | 'HOLD_ACTIVE'; // 🟢 | 🟡 | 🔴 | 🔵
  associatedCircuitId: string;
  isAutomatic: boolean;
}

export interface PointSwitchState {
  switchId: string; // e.g. "P-4A"
  position: 'NORMAL' | 'REVERSE';
  isLocked: boolean;
}

export interface TrackInterlockingState {
  timestamp: string;
  circuits: TrackBlockCircuit[];
  signals: SignalAspectState[];
  switches: PointSwitchState[];
}
```

---

### 2.5 Explainable Decision Log Schema
```typescript
export interface DecisionLogStep {
  stepNumber: number; // 1, 2, 3, 4
  agentName: string; // e.g. "Vision Hazard Detector"
  title: string;
  detailText: string;
  timestamp: string;
  telemetrySnapshot: Record<string, any>;
}

export interface ExplainableDecisionLog {
  incidentId: string;
  trainNumber: string;
  trackSection: string;
  status: 'ACTION_CONFIRMED' | 'REJECTED_BY_OPERATOR' | 'RESOLVED';
  deploymentMode: 'ADVISORY' | 'AUTONOMOUS';
  steps: DecisionLogStep[];
  outcomeSummary: string;
  closedByAuditorId?: string;
  closureTimestamp?: string;
}
```
