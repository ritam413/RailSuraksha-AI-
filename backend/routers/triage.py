import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Query
from models.triage import (
    RawAnomalyPayload,
    TriageClassificationResult,
    IncidentRecord,
    IncidentReviewRequest,
    IncidentReviewResponse,
)
from models.common import SeverityLevel, AssignedAgent, IncidentStatus
from placeholder_data import INCIDENT_QUEUE

router = APIRouter()

# In-memory incident store (replace with DB layer when ready)
_incidents: dict[str, dict] = {inc["incidentId"]: inc for inc in INCIDENT_QUEUE}


def _placeholder_classify(payload: RawAnomalyPayload) -> tuple[float, SeverityLevel, AssignedAgent]:
    """
    Placeholder triage logic.
    TODO: replace with trained severity-score model inference.
    """
    if not payload.bounding_boxes:
        return 0.1, SeverityLevel.LOW, AssignedAgent.RISK_AUDIT

    box = max(payload.bounding_boxes, key=lambda b: b.confidence)
    dist = box.estimated_distance_meters
    conf = box.confidence

    # Simple rule-based placeholder — mirrors triageAgent.ts scoring
    base = conf * 0.7
    hazard_bonus = {"BOULDER": 0.3, "RAIL_FRACTURE": 0.28, "CROWD_SURGE": 0.15, "CATTLE": 0.08, "SIGNAL_OVERRUN": 0.22}.get(
        box.hazard_class.value, 0.0
    )
    distance_penalty = max(0.0, (dist - 200) / 1000)
    score = min(1.0, base + hazard_bonus - distance_penalty)

    if score >= 0.85:
        return score, SeverityLevel.CRITICAL, AssignedAgent.KAVACH_BRAKING
    elif score >= 0.65:
        return score, SeverityLevel.MODERATE, AssignedAgent.SECTION_DISPATCH
    return score, SeverityLevel.LOW, AssignedAgent.RISK_AUDIT


@router.post("/classify", response_model=TriageClassificationResult, summary="Classify a raw anomaly")
async def classify_anomaly(payload: RawAnomalyPayload):
    """
    Receives a raw anomaly payload from an edge camera and returns a
    triage classification with severity score and assigned downstream agent.
    """
    score, severity, agent = _placeholder_classify(payload)
    incident_id = f"INC-{uuid.uuid4().hex[:8].upper()}"
    result = {
        "incidentId": incident_id,
        "rawAnomaly": payload.model_dump(by_alias=True),
        "severityScore": round(score, 3),
        "severityCategory": severity,
        "assignedAgent": agent,
        "status": IncidentStatus.PENDING_APPROVAL,
    }
    _incidents[incident_id] = {**result, "sourceCameraId": payload.source_camera_id,
                               "cameraType": payload.camera_type,
                               "timestamp": payload.timestamp,
                               "boundingBoxes": [b.model_dump(by_alias=True) for b in payload.bounding_boxes]}
    return TriageClassificationResult(**result)


@router.get("/queue", response_model=list[IncidentRecord], summary="Get active incident queue")
async def get_incident_queue(
    status: str = Query(default="active", description="Filter: active | all"),
    severity: str = Query(default="all", description="Filter: CRITICAL | MODERATE | LOW | all"),
):
    """Returns the current AI-triaged incident queue, sorted by severity score descending."""
    incidents = list(_incidents.values())
    if status == "active":
        incidents = [i for i in incidents if i.get("status") in ("PENDING_APPROVAL", "EXECUTING")]
    if severity != "all":
        incidents = [i for i in incidents if i.get("severityCategory") == severity.upper()]
    incidents.sort(key=lambda i: i.get("severityScore", 0), reverse=True)
    return [IncidentRecord(**i) for i in incidents]


@router.post("/incidents/{incident_id}/review", response_model=IncidentReviewResponse, summary="Approve or reject an incident action")
async def review_incident(incident_id: str, body: IncidentReviewRequest):
    """Dispatcher approves or rejects the AI-recommended action for an incident."""
    incident = _incidents.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    new_status = IncidentStatus.EXECUTING if body.action == "APPROVE" else IncidentStatus.REJECTED
    _incidents[incident_id]["status"] = new_status

    return IncidentReviewResponse(
        incidentId=incident_id,
        actionTaken=body.action,
        operatorId=body.operator_id or body.model_dump().get("operatorId", ""),
        newStatus=new_status,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
