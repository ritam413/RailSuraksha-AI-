# Hardcoded mock data mirroring /src/lib/mockData.ts
# Replace with real model outputs when ML pipeline is ready.

from datetime import datetime, timezone

_NOW = "2026-08-21T10:30:00Z"


INTERLOCKING_STATE = {
    "timestamp": _NOW,
    "circuits": [
        {"circuitId": "BLK-101", "lineName": "Up Main 1A", "isOccupied": True,  "occupyingTrainId": "12345", "speedLimitKmh": 110},
        {"circuitId": "BLK-102", "lineName": "Up Main 1B", "isOccupied": False, "occupyingTrainId": None,    "speedLimitKmh": 110},
        {"circuitId": "BLK-103", "lineName": "Down Main 2A","isOccupied": True,  "occupyingTrainId": "67890", "speedLimitKmh": 90},
        {"circuitId": "BLK-104", "lineName": "Loop Line 3", "isOccupied": False, "occupyingTrainId": None,    "speedLimitKmh": 60},
        {"circuitId": "BLK-105", "lineName": "Goods Yard",  "isOccupied": True,  "occupyingTrainId": "11223", "speedLimitKmh": 30},
    ],
    "signals": [
        {"signalId": "S-12", "aspect": "STOP",        "associatedCircuitId": "BLK-101", "isAutomatic": True},
        {"signalId": "S-14", "aspect": "CLEAR",       "associatedCircuitId": "BLK-102", "isAutomatic": True},
        {"signalId": "S-16", "aspect": "HOLD_ACTIVE", "associatedCircuitId": "BLK-103", "isAutomatic": False},
        {"signalId": "S-18", "aspect": "CAUTION",     "associatedCircuitId": "BLK-104", "isAutomatic": True},
    ],
    "switches": [
        {"switchId": "P-4A", "position": "NORMAL",  "isLocked": True},
        {"switchId": "P-4B", "position": "REVERSE", "isLocked": True},
        {"switchId": "P-6A", "position": "NORMAL",  "isLocked": False},
    ],
}


INCIDENT_QUEUE = [
    {
        "incidentId": "INC-2026-0821-001",
        "timestamp": "2026-08-21T10:28:14Z",
        "sourceCameraId": "LOCO-CAB-12345",
        "cameraType": "LOCO_CAB",
        "severityCategory": "CRITICAL",
        "severityScore": 0.982,
        "assignedAgent": "KavachBrakingAgent",
        "status": "PENDING_APPROVAL",
        "boundingBoxes": [
            {
                "class": "BOULDER",
                "confidence": 0.982,
                "x": 312, "y": 198, "width": 148, "height": 134,
                "estimatedDistanceMeters": 340,
            }
        ],
    },
    {
        "incidentId": "INC-2026-0821-002",
        "timestamp": "2026-08-21T10:29:02Z",
        "sourceCameraId": "PLATFORM-GW-CSMT-P1",
        "cameraType": "PLATFORM_GATEWAY",
        "severityCategory": "MODERATE",
        "severityScore": 0.741,
        "assignedAgent": "SectionDispatchAgent",
        "status": "EXECUTING",
        "boundingBoxes": [
            {
                "class": "CROWD_SURGE",
                "confidence": 0.741,
                "x": 0, "y": 200, "width": 1280, "height": 520,
                "estimatedDistanceMeters": 0,
            }
        ],
    },
    {
        "incidentId": "INC-2026-0821-003",
        "timestamp": "2026-08-21T10:29:45Z",
        "sourceCameraId": "LOCO-CAB-67890",
        "cameraType": "LOCO_CAB",
        "severityCategory": "LOW",
        "severityScore": 0.512,
        "assignedAgent": "RiskAuditAgent",
        "status": "PENDING_APPROVAL",
        "boundingBoxes": [
            {
                "class": "CATTLE",
                "confidence": 0.512,
                "x": 580, "y": 310, "width": 90, "height": 78,
                "estimatedDistanceMeters": 680,
            }
        ],
    },
]


PLATFORM_HOLD_STATE = {
    "stationCode": "CSMT",
    "heldPlatformId": "PLATFORM_18",
    "adjacentPlatformId": "PLATFORM_17",
    "gatewayOccupancyIndex": 0.88,
    "gatewayCrowdCount": 482,
    "holdFloorSecondsTotal": 300,
    "remainingHoldSeconds": 252,
    "isMlExtensionActive": True,
    "status": "HOLD_ACTIVE",
    "lastUpdated": _NOW,
}


DECISION_LOG = {
    "incidentId": "INC-2026-0821-001",
    "trainNumber": "12345",
    "trackSection": "BLK-101 / Up Main 1A",
    "status": "ACTION_CONFIRMED",
    "deploymentMode": "ADVISORY",
    "steps": [
        {
            "stepNumber": 1,
            "agentName": "Vision Hazard Detector",
            "title": "YOLOv11 Hazard Detection",
            "detailText": "Boulder detected at 340m with 98.2% confidence on loco cam LOCO-CAB-12345. Bounding box: [312, 198, 148×134px].",
            "timestamp": "2026-08-21T10:28:14.012Z",
            "telemetrySnapshot": {"camera": "LOCO-CAB-12345", "frameId": "F-9821", "latencyMs": 12},
        },
        {
            "stepNumber": 2,
            "agentName": "Telemetry Aggregator",
            "title": "Kavach Radio Kinematic Query",
            "detailText": "Train 12345 travelling at 110 km/h, mass 820t, friction μ=0.134, gradient +0.2%, reaction time 1.96s.",
            "timestamp": "2026-08-21T10:28:14.036Z",
            "telemetrySnapshot": {"velocityKmh": 110, "massTonnes": 820, "mu": 0.134, "gradient": 0.2, "latencyMs": 24},
        },
        {
            "stepNumber": 3,
            "agentName": "Kavach Braking Agent",
            "title": "RDSO EBD Physics Calculation",
            "detailText": "D_stop = 371.4m > D_obstacle = 340m. Collision risk CONFIRMED. Margin: -31.4m. Solenoid actuation required.",
            "timestamp": "2026-08-21T10:28:14.051Z",
            "telemetrySnapshot": {"stoppingDistanceM": 371.4, "marginM": -31.4, "isCollisionRisk": True, "latencyMs": 15},
        },
        {
            "stepNumber": 4,
            "agentName": "Advisory Gate",
            "title": "Dispatcher Approval — OP-402",
            "detailText": "Action APPROVED by operator OP-402. Emergency solenoid actuated on Train 12345. Train stopped 30m prior to boulder.",
            "timestamp": "2026-08-21T10:28:22.183Z",
            "telemetrySnapshot": {"operatorId": "OP-402", "actionTaken": "APPROVE", "latencyMs": 8132},
        },
    ],
    "outcomeSummary": "Train 12345 successfully stopped 30m before boulder on BLK-101. No casualties. Track inspection dispatched.",
}


SYSTEM_MODE = {
    "mode": "ADVISORY",
    "lastChangedBy": "OP-402",
    "timestamp": _NOW,
}

# Loco-cab SSE frame template (placeholder — replace with real YOLOv11 output)
LOCO_STREAM_FRAME_TEMPLATE = {
    "frameId": "F-0000",
    "locoId": "PLACEHOLDER",
    "timestamp": _NOW,
    "detections": [
        {
            "class": "BOULDER",
            "confidence": 0.982,
            "x": 312, "y": 198, "width": 148, "height": 134,
            "estimatedDistanceMeters": 340,
        }
    ],
    "speedKmh": 110,
    "pipelineLatencyMs": 51,
}

# Platform gateway SSE frame template (placeholder — replace with real optical-flow output)
GATEWAY_STREAM_FRAME_TEMPLATE = {
    "frameId": "G-0000",
    "stationId": "PLACEHOLDER",
    "pillarId": "PLACEHOLDER",
    "timestamp": _NOW,
    "crowdCount": 482,
    "gatewayOccupancyIndex": 0.88,
    "opticalFlowVelocity": 0.42,
    "detections": [
        {
            "class": "CROWD_SURGE",
            "confidence": 0.741,
            "x": 0, "y": 200, "width": 1280, "height": 520,
            "estimatedDistanceMeters": 0,
        }
    ],
}

# OHE SSE frame template (placeholder — replace with pantograph spark detector)
OHE_STREAM_FRAME_TEMPLATE = {
    "frameId": "O-0000",
    "sectionId": "PLACEHOLDER",
    "timestamp": _NOW,
    "sparkAnomalyDetected": False,
    "sparkConfidence": 0.0,
    "catenaryHealthScore": 0.97,
}
