import asyncio
import json
import uuid
import math
from datetime import datetime, timezone
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from models.braking import (
    EbdCalculationRequest,
    EbdCalculationResponse,
    AutoBrakePayload,
    BrakeExecuteRequest,
    BrakeExecuteResponse,
    PipelineStageEvent,
)

router = APIRouter()

_G = 9.81  # m/s²


def _compute_ebd(req: EbdCalculationRequest) -> EbdCalculationResponse:
    """
    RDSO Emergency Braking Distance formula (deterministic physics — no ML needed):
        D_stop = V² / (2 * g * (μ + G)) + V * t_reaction
    where V is in m/s, G is gradient as a fraction (not %).
    """
    v_ms = req.velocity_kmh / 3.6
    mu = req.coefficient_friction
    g_frac = req.track_gradient_percent / 100.0
    t_r = req.reaction_time_seconds

    d_stop = (v_ms ** 2) / (2 * _G * (mu + g_frac)) + (v_ms * t_r)
    margin = req.obstacle_distance_meters - d_stop
    is_risk = d_stop > req.obstacle_distance_meters
    # Required deceleration: V² / (2 * D_obstacle) — what brake must achieve
    a_required = (v_ms ** 2) / (2 * req.obstacle_distance_meters)

    return EbdCalculationResponse(
        trainId=req.train_id,
        velocityKmh=req.velocity_kmh,
        obstacleDistanceMeters=req.obstacle_distance_meters,
        calculatedStoppingDistanceMeters=round(d_stop, 2),
        marginDistanceMeters=round(margin, 2),
        isCollisionRisk=is_risk,
        requiredDecelerationMs2=round(a_required, 3),
        autoBrakeCommandPayload=AutoBrakePayload(
            solenoidPulseMs=250 if is_risk else 0,
            cabAlertAudio="EMERGENCY_BRAKE_AUDIO_ALERT" if is_risk else "CLEAR",
        ),
    )


@router.post("/calculate-ebd", response_model=EbdCalculationResponse, summary="Calculate RDSO Emergency Braking Distance")
async def calculate_ebd(req: EbdCalculationRequest):
    """
    Runs the RDSO-compliant EBD physics formula. This is fully deterministic
    and does not require an ML model. Real Kavach telemetry values replace the
    request body fields in production.
    """
    return _compute_ebd(req)


@router.post("/execute-command", response_model=BrakeExecuteResponse, summary="Execute emergency brake command")
async def execute_brake_command(req: BrakeExecuteRequest):
    """
    Issues the emergency solenoid brake command for a loco.
    In ADVISORY mode the dispatcher must have already approved via /triage/incidents/{id}/review.
    Placeholder: always returns success=True. Wire to real Kavach radio API in production.
    """
    return BrakeExecuteResponse(
        success=True,
        commandId=f"CMD-{uuid.uuid4().hex[:10].upper()}",
        executionTimestamp=datetime.now(timezone.utc).isoformat(),
        brakeState="ACTUATED",
    )


@router.websocket("/pipeline-stream")
async def pipeline_stream(websocket: WebSocket):
    """
    WebSocket channel that streams the sequential 4-agent Kavach pipeline.
    Client sends a JSON body with EbdCalculationRequest fields.
    Server streams back 4 PipelineStageEvent messages, one per agent stage,
    mimicking real edge-compute latencies.

    Placeholder: pipeline outputs are hardcoded; replace each stage with
    real agent calls (YOLOv11 → telemetry → EBD → actuator).
    """
    await websocket.accept()
    try:
        raw = await websocket.receive_json()
        req = EbdCalculationRequest(**raw)
        ebd = _compute_ebd(req)

        stages = [
            {
                "stage": 1,
                "agentName": "Vision Hazard Detector",
                "status": "COMPLETE",
                "latencyMs": 12,
                "output": {
                    "hazardClass": "BOULDER",
                    "confidence": 0.982,
                    "estimatedDistanceMeters": req.obstacle_distance_meters,
                },
            },
            {
                "stage": 2,
                "agentName": "Telemetry Aggregator",
                "status": "COMPLETE",
                "latencyMs": 24,
                "output": {
                    "velocityKmh": req.velocity_kmh,
                    "massTonnes": req.mass_tonnes,
                    "frictionMu": req.coefficient_friction,
                    "gradientPct": req.track_gradient_percent,
                    "reactionTimeSec": req.reaction_time_seconds,
                },
            },
            {
                "stage": 3,
                "agentName": "Kavach Braking Agent",
                "status": "COMPLETE",
                "latencyMs": 15,
                "output": {
                    "stoppingDistanceM": ebd.calculated_stopping_distance_meters,
                    "marginM": ebd.margin_distance_meters,
                    "isCollisionRisk": ebd.is_collision_risk,
                    "requiredDecelMs2": ebd.required_deceleration_ms2,
                },
            },
            {
                "stage": 4,
                "agentName": "Auto-Brake Actuator",
                "status": "COMPLETE",
                "latencyMs": 20,
                "output": {
                    "command": ebd.auto_brake_command_payload.command,
                    "solenoidPulseMs": ebd.auto_brake_command_payload.solenoid_pulse_ms,
                    "brakeState": "EMERGENCY_SOLENOID_ACTUATED" if ebd.is_collision_risk else "CLEAR",
                },
            },
        ]

        for stage in stages:
            await websocket.send_json(stage)
            await asyncio.sleep(stage["latencyMs"] / 1000)

        await websocket.close()
    except WebSocketDisconnect:
        pass
