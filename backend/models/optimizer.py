"""
Pydantic v2 schemas for the IRIS AI Corridor Optimizer Engine.
Strictly maps to src/types/apiContracts.ts
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field

TrackLineCode = Literal['UP_SLOW', 'DOWN_SLOW', 'UP_FAST', 'DOWN_FAST', '5TH_LINE', '6TH_LINE']
TrackCircuitId = Literal['TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05', 'TC-06']
DepartmentCode = Literal['TMS_CIVIL', 'TDMS_ELECTRICAL', 'SMMS_SIGNAL']
UrgencyTier = Literal['P1_CRITICAL', 'P2_SCHEDULED', 'P3_ROUTINE']
BlockStatus = Literal['PROPOSED', 'SANCTIONED', 'ACTIVE', 'RESTORED']


class MaintenanceDemandInput(BaseModel):
    demandId: str
    department: DepartmentCode
    trackCircuitId: TrackCircuitId
    trackLine: TrackLineCode
    stationSection: str
    chainageKm: float
    urgencyTier: UrgencyTier
    urgencyScore: float
    durationMinutes: int
    requiresPowerBlock: bool
    assignedMachine: Optional[str] = None
    deadheadTransitMinutes: int = 0
    rawTicketId: str
    defectDescription: str


class TrainTrajectoryPoint(BaseModel):
    stationCode: str
    km: float
    arrivalTimeMinutes: int
    departureTimeMinutes: int


class TrainScheduleInput(BaseModel):
    trainNumber: str
    trainName: str
    trainType: str
    originStation: str
    destinationStation: str
    trajectoryPoints: List[TrainTrajectoryPoint]


class DivisionalPolicyInput(BaseModel):
    divisionId: str = "BB-CR"
    divisionName: str = "Mumbai Central Railway Division"
    safetyHeadwayBufferMinutes: int = 15
    oheEarthingBufferMinutes: int = 10
    oheRestorationBufferMinutes: int = 10
    defaultTsrSpeedKmh: int = 30
    weightSafetyRisk: float = 0.40
    weightDegradationRate: float = 0.35
    weightTrafficDensity: float = 0.25
    solverTimeoutSeconds: float = 2.0


class CorridorSolveRequest(BaseModel):
    demands: List[MaintenanceDemandInput]
    trainPaths: List[TrainScheduleInput]
    policy: Optional[DivisionalPolicyInput] = Field(default_factory=DivisionalPolicyInput)


class JointBlockResponse(BaseModel):
    status: Literal['OPTIMAL', 'FEASIBLE', 'FALLBACK_TSR']
    blockId: str
    corridorName: str
    trackLine: TrackLineCode
    startTimeMinutes: int
    endTimeMinutes: int
    durationMinutes: int
    affectedTrackCircuits: List[TrackCircuitId]
    bundledDemandIds: List[str]
    downtimeSavedMinutes: int
    corridorDowntimeSavedPct: float
    passengerDelaysMinutes: int
    kavachTsrSpeedKmh: int
    isEmergencyTsrFallback: bool
    optimizationTimestamp: str
