// src/lib/mockData.ts
// Comprehensive Mock Data Generator & Static Dataset for RailSuraksha AI

import {
  TrackInterlockingState,
  IncidentRecord,
  EbdCalculationResult,
  PlatformHoldState,
  ExplainableDecisionLog
} from '@/types/apiContracts';

export type {
  TrackInterlockingState,
  IncidentRecord,
  EbdCalculationResult,
  PlatformHoldState,
  ExplainableDecisionLog
};

/**
 * 1. Mock Track Interlocking GIS State (Overview Page)
 */
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

/**
 * 2. Mock AI Triage Incident Queue
 */
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

/**
 * 3. Mock Kavach EBD Braking Physics Calculation Result
 */
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

/**
 * 4. Mock Platform Gateway Hold State (Platform 17 / 18 Bottleneck)
 */
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

/**
 * 5. Mock Explainable Decision Log (Auditor Workspace Modal)
 */
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

/**
 * 6. Public Video Stream URL Resources for Demo
 */
export const DEMO_VIDEO_STREAMS = {
  locoCabForwardView: 'https://assets.mixkit.co/videos/preview/mixkit-train-passing-through-a-green-landscape-42211-large.mp4',
  platformGatewayCctv: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-in-a-train-station-41553-large.mp4',
  ohePantographCam: 'https://assets.mixkit.co/videos/preview/mixkit-electric-train-moving-fast-on-railroad-tracks-43542-large.mp4'
};
