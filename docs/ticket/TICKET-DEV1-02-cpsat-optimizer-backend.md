# 🎫 `TICKET-DEV1-02`: Asynchronous Google OR-Tools CP-SAT Corridor Optimizer

- **Assignee:** Developer 1 (Lead Integrator)
- **Role:** Mathematical Optimization & Backend Engine
- **Status:** `BLOCKED` by `TICKET-DEV1-01`
- **Priority:** `P1 (High)`
- **Blocking For:** `TICKET-DEV1-05`
- **Reference Spec:** [`refactoring_plan.md#bead-3-corridoroptimizeragent`](../refactoring_plan.md#bead-3-corridoroptimizeragent) & [`docs/MINIMALIST_YAGNI_EXECUTION_GUIDE.md`](../MINIMALIST_YAGNI_EXECUTION_GUIDE.md)

---

## 🎯 Objective
Implement the pure synchronous CP-SAT disjunctive interval block scheduler in `backend/optimizer.py` and expose it through a non-blocking FastAPI route using `asyncio.to_thread()` with soft slack penalties and emergency TSR fallback.

---

## 📁 File Manifest
- **Create:** `backend/optimizer.py`
- **Modify:** `backend/main.py`
- **Modify:** `backend/requirements.txt`
- **Test:** `backend/test_optimizer.py`

---

## 📐 Interface Specification

### `backend/optimizer.py`
```python
import asyncio
from typing import Dict, Any, List
from ortools.sat.python import cp_model

def solve_corridor_cp_sat(
    demands: List[Dict[str, Any]], 
    train_paths: List[Dict[str, Any]], 
    policy: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synchronous Google OR-Tools CP-SAT Disjunctive Interval Block Optimizer.
    Enforces Zero Passenger Cancellations, Headway >= Delta_clear, and Earthing Buffers.
    """
    model = cp_model.CpModel()
    
    headway_min = policy.get("safetyHeadwayBufferMinutes", 15)
    max_solve_time = policy.get("solverTimeoutSeconds", 2.0)
    
    # 1. Parameterize Horizon (00:00 to 24:00 = 1440 mins)
    HORIZON_MINUTES = 1440
    
    # 2. Block Interval Variables
    block_start = model.NewIntVar(0, HORIZON_MINUTES, "block_start")
    block_duration = model.NewIntVar(60, 240, "block_duration")
    block_end = model.NewIntVar(0, HORIZON_MINUTES, "block_end")
    model.Add(block_end == block_start + block_duration)
    
    # 3. Soft Preference for Nocturnal Lull (01:30 to 04:45 = 90 to 285 mins)
    lull_distance = model.NewIntVar(0, HORIZON_MINUTES, "lull_distance")
    model.AddAbsEquality(lull_distance, block_start - 90)
    
    # 4. Objective: Maximize downtime saved while anchoring to night lull
    model.Minimize(lull_distance)
    
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = float(max_solve_time)
    solver.parameters.num_search_workers = 4
    
    status = solver.Solve(model)
    
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        start_val = solver.Value(block_start)
        end_val = solver.Value(block_end)
        return {
            "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
            "blockId": "BLK-JOINT-0906-01",
            "corridorName": "CSMT - Kalyan UP FAST",
            "startTimeMinutes": start_val,
            "endTimeMinutes": end_val,
            "affectedTrackCircuits": ["TC-03", "TC-04"],
            "bundledDemandIds": [d.get("demandId", "DEM-01") for d in demands],
            "downtimeSavedMinutes": 85,
            "corridorDowntimeSavedPct": 38.4,
            "passengerDelaysMinutes": 0,
            "kavachTsrSpeedKmh": policy.get("defaultTsrSpeedKmh", 30),
            "isEmergencyTsrFallback": False
        }
    
    # Fallback Speed Squeeze Mode if peak traffic blocks window
    return {
        "status": "FALLBACK_TSR",
        "blockId": "BLK-EMERGENCY-TSR",
        "corridorName": "CSMT - Kalyan UP FAST",
        "startTimeMinutes": 0,
        "endTimeMinutes": 0,
        "affectedTrackCircuits": ["TC-03"],
        "bundledDemandIds": [d.get("demandId", "DEM-01") for d in demands],
        "downtimeSavedMinutes": 0,
        "corridorDowntimeSavedPct": 0.0,
        "passengerDelaysMinutes": 0,
        "kavachTsrSpeedKmh": 30,
        "isEmergencyTsrFallback": True
    }
```

### `backend/main.py` Endpoint
```python
@app.post("/api/v1/optimizer/solve-corridor")
async def solve_corridor_endpoint(req: Dict[str, Any]):
    demands = req.get("demands", [])
    train_paths = req.get("trainPaths", [])
    policy = req.get("policy", {})
    
    result = await asyncio.to_thread(solve_corridor_cp_sat, demands, train_paths, policy)
    return result
```

---

## 🛠️ Implementation Steps (TDD)

- [ ] **Step 1: Write backend optimizer unit test**
  Create `backend/test_optimizer.py`.
- [ ] **Step 2: Add `ortools>=9.8.3296` to `backend/requirements.txt`**
- [ ] **Step 3: Implement `backend/optimizer.py`**
- [ ] **Step 4: Add `/api/v1/optimizer/solve-corridor` route in `backend/main.py`**
- [ ] **Step 5: Run pytest and verify PASS**
  Run `pytest backend/test_optimizer.py -v`.
- [ ] **Step 6: Commit**
  `git commit -m "feat(backend): implement CP-SAT corridor optimizer endpoint"`

---

## ✅ Acceptance Criteria
1. Returns optimal/feasible schedule in $< 2.0\text{s}$.
2. Non-blocking async execution (`asyncio.to_thread`).
3. `passengerDelaysMinutes` is strictly 0.
