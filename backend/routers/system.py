import copy
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.common import DeploymentMode
from placeholder_data import SYSTEM_MODE

router = APIRouter()

# Mutable in-memory system mode (replace with DB / config service)
_system_mode: dict = copy.deepcopy(SYSTEM_MODE)


class SystemModeResponse(BaseModel):
    mode: DeploymentMode
    lastChangedBy: str
    timestamp: str


class SetModeRequest(BaseModel):
    mode: DeploymentMode
    operatorId: str


class SetModeResponse(BaseModel):
    mode: DeploymentMode
    success: bool


@router.get("/mode", response_model=SystemModeResponse, summary="Get current deployment mode")
async def get_system_mode():
    """
    Returns the active deployment mode (ADVISORY or AUTONOMOUS) and who last changed it.
    ADVISORY: all AI actions require dispatcher approval.
    AUTONOMOUS: AI executes braking / holds directly post-RDSO certification.
    """
    return SystemModeResponse(**_system_mode)


@router.put("/mode", response_model=SetModeResponse, summary="Switch deployment mode")
async def set_system_mode(req: SetModeRequest):
    """
    Switches the platform between ADVISORY and AUTONOMOUS modes.
    Placeholder: persists to in-memory state only.
    In production, this should require elevated operator credentials and audit logging.
    """
    _system_mode["mode"] = req.mode
    _system_mode["lastChangedBy"] = req.operatorId
    _system_mode["timestamp"] = datetime.now(timezone.utc).isoformat()
    return SetModeResponse(mode=req.mode, success=True)
