from enum import Enum


class SeverityLevel(str, Enum):
    CRITICAL = "CRITICAL"
    MODERATE = "MODERATE"
    LOW = "LOW"


class DeploymentMode(str, Enum):
    ADVISORY = "ADVISORY"
    AUTONOMOUS = "AUTONOMOUS"


class HazardClass(str, Enum):
    BOULDER = "BOULDER"
    RAIL_FRACTURE = "RAIL_FRACTURE"
    CROWD_SURGE = "CROWD_SURGE"
    CATTLE = "CATTLE"
    SIGNAL_OVERRUN = "SIGNAL_OVERRUN"


class CameraType(str, Enum):
    LOCO_CAB = "LOCO_CAB"
    PLATFORM_GATEWAY = "PLATFORM_GATEWAY"
    OHE = "OHE"


class IncidentStatus(str, Enum):
    PENDING_APPROVAL = "PENDING_APPROVAL"
    EXECUTING = "EXECUTING"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class AssignedAgent(str, Enum):
    KAVACH_BRAKING = "KavachBrakingAgent"
    SECTION_DISPATCH = "SectionDispatchAgent"
    RISK_AUDIT = "RiskAuditAgent"
