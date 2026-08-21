import uuid
import copy
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from models.audit import (
    ExplainableDecisionLog,
    CloseIncidentRequest,
    AuditorComplianceReport,
)
from placeholder_data import DECISION_LOG

router = APIRouter()

# In-memory audit log store (replace with immutable append-only DB in production)
_audit_logs: dict[str, dict] = {DECISION_LOG["incidentId"]: copy.deepcopy(DECISION_LOG)}


@router.get(
    "/logs/{incident_id}",
    response_model=ExplainableDecisionLog,
    summary="Retrieve 4-step explainable decision log for an incident",
)
async def get_audit_log(incident_id: str):
    """
    Returns the immutable 4-step explainable AI decision log for a given incident:
    1. Vision detection  2. Kinematic telemetry  3. EBD calculation  4. Actuation / approval.
    Used by auditors and the RDSO compliance reporting interface.
    """
    log = _audit_logs.get(incident_id)
    if not log:
        raise HTTPException(status_code=404, detail=f"No audit log for incident {incident_id}")
    return ExplainableDecisionLog(**log)


@router.post(
    "/close-incident",
    response_model=AuditorComplianceReport,
    summary="Close an incident and generate RDSO compliance report",
)
async def close_incident(req: CloseIncidentRequest):
    """
    Closes an incident, marks its decision log as RESOLVED, and returns an
    AuditorComplianceReport suitable for filing with the RDSO safety authority.
    Placeholder: generates a static compliance report. In production this should
    trigger PDF generation and upload to the compliance record system.
    """
    log = _audit_logs.get(req.incident_id)
    if not log:
        raise HTTPException(status_code=404, detail=f"No audit log for incident {req.incident_id}")

    closed_at = datetime.now(timezone.utc).isoformat()
    log["status"] = "RESOLVED"
    log["closedByAuditorId"] = req.auditor_id
    log["closureTimestamp"] = closed_at

    return AuditorComplianceReport(
        reportId=f"RPT-{uuid.uuid4().hex[:10].upper()}",
        incidentId=req.incident_id,
        auditorId=req.auditor_id,
        closedAt=closed_at,
        complianceStatus="COMPLIANT",
        rdsoStandard="RDSO/SPN/TC/0070 Rev-4",
        decisionLog=ExplainableDecisionLog(**log),
        complianceNotes=req.compliance_notes,
    )
