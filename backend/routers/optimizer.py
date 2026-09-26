"""
FastAPI Router for IRIS AI Corridor Optimizer.
Dispatches CP-SAT CPU-bound execution via asyncio.to_thread().
"""
import asyncio
from fastapi import APIRouter, HTTPException
from models.optimizer import CorridorSolveRequest, JointBlockResponse
from optimizer import solve_corridor_cp_sat

router = APIRouter()


@router.post(
    "/solve-corridor",
    response_model=JointBlockResponse,
    summary="Solve Corridor Joint Shadow Block Schedule (CP-SAT)",
    description=(
        "Optimizes multi-department maintenance demands against live train schedules "
        "using Google OR-Tools CP-SAT. Guarantees 0 passenger delays, enforces safety headway buffers, "
        "and automatically falls back to Kavach TSR speed squeeze if corridor is congested."
    ),
)
async def solve_corridor_endpoint(req: CorridorSolveRequest):
    try:
        demands_dict = [d.model_dump() for d in req.demands]
        train_paths_dict = [t.model_dump() for t in req.trainPaths]
        policy_dict = req.policy.model_dump() if req.policy else {}
        
        # ponytail: execute CPU-bound CP-SAT solver in thread pool to prevent event loop blocking
        result = await asyncio.to_thread(
            solve_corridor_cp_sat,
            demands_dict,
            train_paths_dict,
            policy_dict
        )
        return JointBlockResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Optimizer failure: {str(exc)}")
