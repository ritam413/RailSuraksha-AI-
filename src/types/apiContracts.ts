// src/types/apiContracts.ts
// Shared Interface Contracts for RailSuraksha AI Multi-Agent Safety Platform

export type DeploymentMode = 'ADVISORY' | 'AUTONOMOUS';
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
  confidence: number; // e.g. 0.982
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
  calculatedStoppingDistanceMeters: number; // D_stop
  marginDistanceMeters: number;
  isCollisionRisk: boolean;
  requiredDecelerationMs2: number;
  brakeState: 'CLEAR' | 'EMERGENCY_SOLENOID_ACTUATED';
}

export interface PlatformHoldState {
  stationCode: string;
  heldPlatformId: string;
  adjacentPlatformId: string;
  gatewayOccupancyIndex: number; // rho (0.0 - 1.0)
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
