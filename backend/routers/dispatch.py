import copy
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from models.dispatch import PlatformHoldState, HoldOverrideRequest
from models.interlocking import TrackInterlockingState
from placeholder_data import INTERLOCKING_STATE, PLATFORM_HOLD_STATE

router = APIRouter()

# Mutable in-memory hold state (replace with DB in production)
_hold_state: dict = copy.deepcopy(PLATFORM_HOLD_STATE)


@router.get(
    "/interlocking-map",
    response_model=TrackInterlockingState,
    summary="Get current track interlocking state",
)
async def get_interlocking_map():
    """
    Returns the current state of all track block circuits, signal aspects,
    and point switches for the Railway Interlocking Map visualisation.
    Placeholder: returns hardcoded CSMT yard state. Replace with real
    interlocking controller (IXL) adapter in production.
    """
    state = copy.deepcopy(INTERLOCKING_STATE)
    state["timestamp"] = datetime.now(timezone.utc).isoformat()
    return TrackInterlockingState(**state)


@router.get(
    "/hold-timer/{platform_id}",
    response_model=PlatformHoldState,
    summary="Get platform hold timer state",
)
async def get_hold_timer(platform_id: str):
    """
    Returns the current crowd-management hold timer state for a platform.
    Placeholder: returns hardcoded Platform 18 CSMT state.
    Replace with real crowd-density pipeline + DB read in production.
    """
    if platform_id.upper() not in (_hold_state["heldPlatformId"], "PLATFORM_18"):
        raise HTTPException(status_code=404, detail=f"No active hold for platform {platform_id}")
    state = copy.deepcopy(_hold_state)
    state["lastUpdated"] = datetime.now(timezone.utc).isoformat()
    return PlatformHoldState(**state)


@router.post(
    "/override-hold",
    response_model=PlatformHoldState,
    summary="Station Master override: release or extend platform hold",
)
async def override_hold(req: HoldOverrideRequest):
    """
    Allows the Station Master to manually release a hold early or extend it
    by 3 minutes if crowd density remains critical.
    Placeholder: mutates in-memory state. Wire to real timer service in production.
    """
    if req.platform_id.upper() not in (_hold_state["heldPlatformId"], "PLATFORM_18"):
        raise HTTPException(status_code=404, detail=f"No active hold for platform {req.platform_id}")

    if req.action == "RELEASE":
        _hold_state["remainingHoldSeconds"] = 0
        _hold_state["status"] = "OVERRIDDEN"
    elif req.action == "EXTEND_3M":
        _hold_state["remainingHoldSeconds"] += 180
        _hold_state["isMlExtensionActive"] = True
    else:
        raise HTTPException(status_code=422, detail="action must be RELEASE or EXTEND_3M")

    _hold_state["lastUpdated"] = datetime.now(timezone.utc).isoformat()
    return PlatformHoldState(**_hold_state)
