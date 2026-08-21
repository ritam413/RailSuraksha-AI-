from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from .common import DeploymentMode


class DecisionLogStep(BaseModel):
    step_number: int = Field(alias="stepNumber")
    agent_name: str = Field(alias="agentName")
    title: str
    detail_text: str = Field(alias="detailText")
    timestamp: str
    telemetry_snapshot: Dict[str, Any] = Field(alias="telemetrySnapshot", default_factory=dict)

    model_config = {"populate_by_name": True}


class ExplainableDecisionLog(BaseModel):
    incident_id: str = Field(alias="incidentId")
    train_number: str = Field(alias="trainNumber")
    track_section: str = Field(alias="trackSection")
    status: str  # "ACTION_CONFIRMED" | "REJECTED_BY_OPERATOR" | "RESOLVED"
    deployment_mode: DeploymentMode = Field(alias="deploymentMode")
    steps: List[DecisionLogStep]
    outcome_summary: str = Field(alias="outcomeSummary")
    closed_by_auditor_id: Optional[str] = Field(alias="closedByAuditorId", default=None)
    closure_timestamp: Optional[str] = Field(alias="closureTimestamp", default=None)

    model_config = {"populate_by_name": True}


class CloseIncidentRequest(BaseModel):
    incident_id: str = Field(alias="incidentId")
    auditor_id: str = Field(alias="auditorId")
    compliance_notes: str = Field(alias="complianceNotes")

    model_config = {"populate_by_name": True}


class AuditorComplianceReport(BaseModel):
    report_id: str = Field(alias="reportId")
    incident_id: str = Field(alias="incidentId")
    auditor_id: str = Field(alias="auditorId")
    closed_at: str = Field(alias="closedAt")
    compliance_status: str = Field(alias="complianceStatus")
    rdso_standard: str = Field(alias="rdsoStandard")
    decision_log: ExplainableDecisionLog = Field(alias="decisionLog")
    compliance_notes: str = Field(alias="complianceNotes")

    model_config = {"populate_by_name": True}
