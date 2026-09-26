// src/types/apiContracts.ts
// Shared Interface Contracts for IRIS AI (Automatic Block Planning & Corridor Optimization)

// 1. Core Enums & Literal Types
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

// 2. Configurable Divisional Policy Profile
export interface DivisionalPolicyProfile {
  divisionId: string;
  divisionName: string;
  safetyHeadwayBufferMinutes: number; // Delta_clear (15 mins)
  oheEarthingBufferMinutes: number;    // Delta_earth (10 mins)
  oheRestorationBufferMinutes: number; // Delta_restore (10 mins)
  defaultTsrSpeedKmh: number;          // 30 km/h
  weightSafetyRisk: number;            // 0.40
  weightDegradationRate: number;       // 0.35
  weightTrafficDensity: number;        // 0.25
  p1ScoreThreshold: number;            // 0.80
  p2ScoreThreshold: number;            // 0.50
}

// 3. Maintenance Demand Contract
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

// 4. Joint Block Optimization Schedule
export interface JointBlockSchedule {
  blockId: string;
  corridorName: string;
  trackLine: TrackLineCode;
  startTimeMinutes: number;  // 90 = 01:30 IST
  endTimeMinutes: number;    // 285 = 04:45 IST
  durationMinutes: number;   // 195 mins (rollover-safe)
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

// 5. Corridor KPI Metrics
export interface CorridorKpiMetrics {
  corridorDowntimeSavedPct: number;
  assetAvailabilityIndexPct: number;
  activeBlocksCount: number;
  pendingDemandsCount: number;
  whiteCorridorHeadwayMinutes: number;
  activeKavachTsrsCount: number;
}

// 6. Track Circuit Interlocking State
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

// 7. Time-Distance Timetable Trajectories
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

export interface DecisionTimelineStep {
  stepNumber: 1 | 2 | 3 | 4;
  stageName: 'INGESTION' | 'TRAFFIC_CONFLICT' | 'JOINT_BUNDLING' | 'SANCTION_DISSEMINATION';
  title: string;
  agentName: string;
  description: string;
  timestamp: string;
}

// 8. Explainable Decision Dossier & Audit
export interface ExplainableDecisionDossier {
  dossierId: string;
  blockId: string;
  sanctionedBy: string;
  timestamp: string;
  canonicalPayloadString: string;
  sha256Signature: string;
  chronologicalTimeline: DecisionTimelineStep[];
  bundledDemands: MaintenanceDemand[];
  statutoryForms: {
    formST351LockoutNumber: string;
    formT409CautionOrderNumber: string;
    rdsoForm14BCertificateHash: string;
  };
  verificationStatus: 'VERIFIED_TAMPER_FREE' | 'SIGNATURE_MISMATCH';
}

// 9. Legacy UI Contracts (Preserved for backwards compatibility)
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
