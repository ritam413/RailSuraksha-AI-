from pydantic import BaseModel, Field
from typing import List, Optional
from .common import SeverityLevel, HazardClass, CameraType, IncidentStatus, AssignedAgent


class BoundingBox(BaseModel):
    hazard_class: HazardClass = Field(alias="class")
    confidence: float = Field(ge=0.0, le=1.0)
    x: float
    y: float
    width: float
    height: float
    estimated_distance_meters: float = Field(alias="estimatedDistanceMeters")

    model_config = {"populate_by_name": True}


class RawAnomalyPayload(BaseModel):
    anomaly_id: str = Field(alias="anomalyId")
    source_camera_id: str = Field(alias="sourceCameraId")
    camera_type: CameraType = Field(alias="cameraType")
    timestamp: str
    raw_frame_url: str = Field(alias="rawFrameUrl")
    bounding_boxes: List[BoundingBox] = Field(alias="boundingBoxes")

    model_config = {"populate_by_name": True}


class TriageClassificationResult(BaseModel):
    incident_id: str = Field(alias="incidentId")
    raw_anomaly: RawAnomalyPayload = Field(alias="rawAnomaly")
    severity_score: float = Field(alias="severityScore", ge=0.0, le=1.0)
    severity_category: SeverityLevel = Field(alias="severityCategory")
    assigned_agent: AssignedAgent = Field(alias="assignedAgent")
    status: IncidentStatus

    model_config = {"populate_by_name": True}


class IncidentRecord(BaseModel):
    incident_id: str = Field(alias="incidentId")
    timestamp: str
    source_camera_id: str = Field(alias="sourceCameraId")
    camera_type: CameraType = Field(alias="cameraType")
    severity_category: SeverityLevel = Field(alias="severityCategory")
    severity_score: float = Field(alias="severityScore")
    assigned_agent: AssignedAgent = Field(alias="assignedAgent")
    status: IncidentStatus
    bounding_boxes: List[BoundingBox] = Field(alias="boundingBoxes")

    model_config = {"populate_by_name": True}


class IncidentReviewRequest(BaseModel):
    action: str  # "APPROVE" | "REJECT"
    operator_id: str = Field(alias="operatorId")
    reason: Optional[str] = None

    model_config = {"populate_by_name": True}


class IncidentReviewResponse(BaseModel):
    incident_id: str = Field(alias="incidentId")
    action_taken: str = Field(alias="actionTaken")
    operator_id: str = Field(alias="operatorId")
    new_status: IncidentStatus = Field(alias="newStatus")
    timestamp: str

    model_config = {"populate_by_name": True}
