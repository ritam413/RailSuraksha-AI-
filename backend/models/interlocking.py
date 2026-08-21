from pydantic import BaseModel, Field
from typing import List, Optional


class TrackBlockCircuit(BaseModel):
    circuit_id: str = Field(alias="circuitId")
    line_name: str = Field(alias="lineName")
    is_occupied: bool = Field(alias="isOccupied")
    occupying_train_id: Optional[str] = Field(alias="occupyingTrainId", default=None)
    speed_limit_kmh: int = Field(alias="speedLimitKmh")

    model_config = {"populate_by_name": True}


class SignalAspectState(BaseModel):
    signal_id: str = Field(alias="signalId")
    aspect: str  # "CLEAR" | "CAUTION" | "STOP" | "HOLD_ACTIVE"
    associated_circuit_id: str = Field(alias="associatedCircuitId")
    is_automatic: bool = Field(alias="isAutomatic")

    model_config = {"populate_by_name": True}


class PointSwitchState(BaseModel):
    switch_id: str = Field(alias="switchId")
    position: str  # "NORMAL" | "REVERSE"
    is_locked: bool = Field(alias="isLocked")

    model_config = {"populate_by_name": True}


class TrackInterlockingState(BaseModel):
    timestamp: str
    circuits: List[TrackBlockCircuit]
    signals: List[SignalAspectState]
    switches: List[PointSwitchState]
