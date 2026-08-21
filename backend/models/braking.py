from pydantic import BaseModel, Field
from .common import DeploymentMode


class EbdCalculationRequest(BaseModel):
    train_id: str = Field(alias="trainId")
    loco_id: str = Field(alias="locoId")
    velocity_kmh: float = Field(alias="velocityKmh", gt=0)
    mass_tonnes: float = Field(alias="massTonnes", gt=0)
    coefficient_friction: float = Field(alias="coefficientFriction", gt=0)
    track_gradient_percent: float = Field(alias="trackGradientPercent")
    reaction_time_seconds: float = Field(alias="reactionTimeSeconds", default=1.2)
    obstacle_distance_meters: float = Field(alias="obstacleDistanceMeters", gt=0)

    model_config = {"populate_by_name": True}


class AutoBrakePayload(BaseModel):
    command: str = "APPLY_EMERGENCY_BRAKE"
    solenoid_pulse_ms: int = Field(alias="solenoidPulseMs")
    cab_alert_audio: str = Field(alias="cabAlertAudio")

    model_config = {"populate_by_name": True}


class EbdCalculationResponse(BaseModel):
    train_id: str = Field(alias="trainId")
    velocity_kmh: float = Field(alias="velocityKmh")
    obstacle_distance_meters: float = Field(alias="obstacleDistanceMeters")
    calculated_stopping_distance_meters: float = Field(alias="calculatedStoppingDistanceMeters")
    margin_distance_meters: float = Field(alias="marginDistanceMeters")
    is_collision_risk: bool = Field(alias="isCollisionRisk")
    required_deceleration_ms2: float = Field(alias="requiredDecelerationMs2")
    auto_brake_command_payload: AutoBrakePayload = Field(alias="autoBrakeCommandPayload")

    model_config = {"populate_by_name": True}


class BrakeExecuteRequest(BaseModel):
    incident_id: str = Field(alias="incidentId")
    loco_id: str = Field(alias="locoId")
    brake_mode: str = Field(alias="brakeMode", default="EMERGENCY_SOLENOID")
    mode: DeploymentMode
    confirmed_by: str | None = Field(alias="confirmedBy", default=None)

    model_config = {"populate_by_name": True}


class BrakeExecuteResponse(BaseModel):
    success: bool
    command_id: str = Field(alias="commandId")
    execution_timestamp: str = Field(alias="executionTimestamp")
    brake_state: str = Field(alias="brakeState", default="ACTUATED")

    model_config = {"populate_by_name": True}


class PipelineStageEvent(BaseModel):
    stage: int
    agent_name: str = Field(alias="agentName")
    status: str  # "PROCESSING" | "COMPLETE"
    latency_ms: int = Field(alias="latencyMs")
    output: dict

    model_config = {"populate_by_name": True}
