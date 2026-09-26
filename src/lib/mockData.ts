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

// 1. Grounded Divisional Policy Profile
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

// 2. Grounded Multi-Department Maintenance Demands
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

export const MOCK_MAINTENANCE_DEMANDS: MaintenanceDemand[] = MOCK_DEMANDS;

// 3. Optimized Joint Shadow Block Schedule
export const MOCK_JOINT_BLOCKS: JointBlockSchedule[] = [
  {
    blockId: 'JB-2026-0926-01',
    corridorName: 'CSMT-Kalyan Sub-Corridor (Dadar-Kurla Section)',
    trackLine: 'UP_SLOW',
    startTimeMinutes: 90,   // 01:30 IST
    endTimeMinutes: 285,    // 04:45 IST
    durationMinutes: 195,   // 3h 15m window
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

// 4. Corridor KPI Metrics
export const MOCK_CORRIDOR_KPIS: CorridorKpiMetrics = {
  corridorDowntimeSavedPct: 38.4,
  assetAvailabilityIndexPct: 96.2,
  activeBlocksCount: 2,
  pendingDemandsCount: 6,
  whiteCorridorHeadwayMinutes: 195,
  activeKavachTsrsCount: 1
};

// 5. CSMT-Kalyan 6-Circuit Topology (54 KM)
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

// 6. Time-Distance Train Schedule Slots
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

// 7. Explainable Decision Dossiers & Auditing
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

// 8. Backward-Compatible Legacy Mock Datasets
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

export const MOCK_DECISION_DOSSIER: ExplainableDecisionDossier = {
  dossierId: 'DOSSIER-JB-2026-0926-01-A9F4B23',
  blockId: 'JB-2026-0926-01',
  sanctionedBy: 'CTRL-MUM-402 (Sr. DOM / Section Controller)',
  timestamp: '2026-09-26T01:28:14Z',
  canonicalPayloadString: 'JB-2026-0926-01|CTRL-MUM-402 (Sr. DOM / Section Controller)|2026-09-26T01:28:14Z|DEM-SMMS-03,DEM-TDMS-02,DEM-TMS-01|30|RDSO-v4.0',
  sha256Signature: '8f4b23a9e10287cd90b34512e0fac619e048356911cbb007a82910f82c0915ab',
  chronologicalTimeline: [
    {
      stepNumber: 1,
      stageName: 'INGESTION',
      title: 'Multi-Source Defect Ingestion & Spatial Normalization',
      agentName: 'IngestionNormalizerAgent (Spatial & Defect Fusion)',
      description: 'Ingested TMS-804 rail flaw, TDMS-312 catenary wear, and SMMS-109 point stroke telemetry; mapped chainage to TC-03 (Dadar).',
      timestamp: '2026-09-26T01:15:02Z'
    },
    {
      stepNumber: 2,
      stageName: 'TRAFFIC_CONFLICT',
      title: 'Traffic Conflict & White-Corridor Search',
      agentName: 'UrgencyTriageAgent & COA Timetable Evaluator',
      description: 'Evaluated 13,000+ train paths from COA; confirmed 0 passenger train cancellations and identified nocturnal lull (01:30 - 04:45 IST).',
      timestamp: '2026-09-26T01:18:24Z'
    },
    {
      stepNumber: 3,
      stageName: 'JOINT_BUNDLING',
      title: 'Joint Shadow-Block Co-Location Bundling',
      agentName: 'CorridorOptimizerAgent (Google OR-Tools CP-SAT)',
      description: 'Bundled Civil track tamping and S&T point overhaul under de-energized 25kV OHE; saved 85 minutes of cumulative corridor downtime (38.4% reduction).',
      timestamp: '2026-09-26T01:22:45Z'
    },
    {
      stepNumber: 4,
      stageName: 'SANCTION_DISSEMINATION',
      title: 'Safety Dissemination & Interlocking Sanction',
      agentName: 'SanctionGateAgent & SafetyActuatorAgent',
      description: 'Enforced Form S&T/T-351 lockout, clamped entry Signal S-12 to RED, and broadcast wireless Kavach TSR (30 km/h) packet to approaching locomotives.',
      timestamp: '2026-09-26T01:28:14Z'
    }
  ],
  bundledDemands: [
    MOCK_MAINTENANCE_DEMANDS[0],
    MOCK_MAINTENANCE_DEMANDS[1],
    MOCK_MAINTENANCE_DEMANDS[2]
  ],
  statutoryForms: {
    formST351LockoutNumber: 'ST-351-2026-0926-01',
    formT409CautionOrderNumber: 'T409-TSR-30-TC03',
    rdsoForm14BCertificateHash: '8f4b23a9e10287cd90b34512e0fac619e048356911cbb007a82910f82c0915ab'
  },
  verificationStatus: 'VERIFIED_TAMPER_FREE'
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
