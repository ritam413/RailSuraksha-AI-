from pydantic import BaseModel, Field
from typing import Optional


class PlatformHoldState(BaseModel):
    station_code: str = Field(alias="stationCode")
    held_platform_id: str = Field(alias="heldPlatformId")
    adjacent_platform_id: str = Field(alias="adjacentPlatformId")
    gateway_occupancy_index: float = Field(alias="gatewayOccupancyIndex", ge=0.0, le=1.0)
    gateway_crowd_count: int = Field(alias="gatewayCrowdCount")
    hold_floor_seconds_total: int = Field(alias="holdFloorSecondsTotal", default=300)
    remaining_hold_seconds: int = Field(alias="remainingHoldSeconds")
    is_ml_extension_active: bool = Field(alias="isMlExtensionActive")
    status: str  # "HOLD_ACTIVE" | "CLEARING" | "RELEASED" | "OVERRIDDEN"
    last_updated: str = Field(alias="lastUpdated")

    model_config = {"populate_by_name": True}


class HoldOverrideRequest(BaseModel):
    platform_id: str = Field(alias="platformId")
    action: str  # "RELEASE" | "EXTEND_3M"
    operator_id: str = Field(alias="operatorId")

    model_config = {"populate_by_name": True}
