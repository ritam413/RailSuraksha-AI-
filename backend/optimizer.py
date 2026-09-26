"""
Google OR-Tools CP-SAT Corridor Optimization Engine for IRIS AI.
Implements multi-department joint shadow block scheduling during nocturnal lulls (01:30 - 04:45 IST)
with strict zero passenger delay, safety headway buffers, and emergency TSR fallback.
"""
from datetime import datetime, timezone
from typing import Dict, Any, List, Set
from ortools.sat.python import cp_model


def solve_corridor_cp_sat(
    demands: List[Dict[str, Any]], 
    train_paths: List[Dict[str, Any]], 
    policy: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Synchronous Google OR-Tools CP-SAT Corridor Disjunctive Interval Optimizer.
    
    Constraints Enforced:
    1. Zero Passenger Delays (all passenger train trajectories are hard non-negotiable intervals).
    2. Safety Headway Buffer (Delta_clear >= 15 min between block possession and train passages).
    3. Power Block Buffers (Delta_earth = 10 min, Delta_restore = 10 min if requiresPowerBlock is True).
    4. Multi-Department Joint Shadow Bundling (co-located demands merged into single possessory window).
    5. Fallback Speed Squeeze Mode if peak-hour congestion prevents physical possession.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    
    if not demands:
        return {
            "status": "FEASIBLE",
            "blockId": "BLK-EMPTY-00",
            "corridorName": "CSMT - Kalyan UP FAST",
            "trackLine": "UP_FAST",
            "startTimeMinutes": 90,
            "endTimeMinutes": 90,
            "durationMinutes": 0,
            "affectedTrackCircuits": [],
            "bundledDemandIds": [],
            "downtimeSavedMinutes": 0,
            "corridorDowntimeSavedPct": 0.0,
            "passengerDelaysMinutes": 0,
            "kavachTsrSpeedKmh": policy.get("defaultTsrSpeedKmh", 30),
            "isEmergencyTsrFallback": False,
            "optimizationTimestamp": now_iso
        }
    
    # 1. Extract Policy & Domain Parameters
    headway_min = int(policy.get("safetyHeadwayBufferMinutes", 15))
    earthing_min = int(policy.get("oheEarthingBufferMinutes", 10))
    restoration_min = int(policy.get("oheRestorationBufferMinutes", 10))
    default_tsr = int(policy.get("defaultTsrSpeedKmh", 30))
    solver_timeout = float(policy.get("solverTimeoutSeconds", 2.0))
    
    # 2. Extract Target Corridor & Track Circuits
    target_track_line = demands[0].get("trackLine", "UP_FAST")
    affected_circuits_set: Set[str] = set()
    bundled_demand_ids: List[str] = []
    
    total_individual_work_minutes = 0
    max_single_work_minutes = 0
    requires_power_block = False
    
    for d in demands:
        bundled_demand_ids.append(d.get("demandId", "DEM-UNKNOWN"))
        if "trackCircuitId" in d:
            affected_circuits_set.add(d["trackCircuitId"])
        dur = int(d.get("durationMinutes", 60))
        total_individual_work_minutes += dur
        if dur > max_single_work_minutes:
            max_single_work_minutes = dur
        if d.get("requiresPowerBlock", False):
            requires_power_block = True

    affected_circuits = sorted(list(affected_circuits_set)) if affected_circuits_set else ["TC-03", "TC-04"]
    
    # Calculate required joint block duration: max work duration + power/safety buffer
    effective_buffer = (earthing_min + restoration_min) if requires_power_block else 15
    required_block_duration = max_single_work_minutes + effective_buffer
    required_block_duration = max(60, min(240, required_block_duration))

    # 3. Parameterize Horizon (00:00 to 24:00 = 1440 mins)
    HORIZON_MINUTES = 1440
    
    model = cp_model.CpModel()
    
    # 4. Decision Variables: Block Start, Duration, End
    block_start = model.NewIntVar(0, HORIZON_MINUTES - required_block_duration, "block_start")
    block_duration = model.NewConstant(required_block_duration)
    block_end = model.NewIntVar(required_block_duration, HORIZON_MINUTES, "block_end")
    model.Add(block_end == block_start + block_duration)
    
    block_interval = model.NewIntervalVar(block_start, block_duration, block_end, "block_interval")
    
    # 5. Extract Conflicting Train Windows with Safety Headway Protection
    disjunctive_intervals = [block_interval]
    
    for train in train_paths:
        points = train.get("trajectoryPoints", [])
        if not points:
            continue
        arr_times = [p.get("arrivalTimeMinutes", 0) for p in points if "arrivalTimeMinutes" in p]
        dep_times = [p.get("departureTimeMinutes", 0) for p in points if "departureTimeMinutes" in p]
        if not arr_times or not dep_times:
            continue
        
        t_start_raw = max(0, min(arr_times) - headway_min)
        t_end_raw = min(HORIZON_MINUTES, max(dep_times) + headway_min)
        t_dur_raw = max(1, t_end_raw - t_start_raw)
        
        train_int_start = model.NewConstant(t_start_raw)
        train_int_dur = model.NewConstant(t_dur_raw)
        train_int_end = model.NewConstant(t_end_raw)
        
        t_interval = model.NewIntervalVar(
            train_int_start, 
            train_int_dur, 
            train_int_end, 
            f"train_{train.get('trainNumber', 'UNK')}"
        )
        disjunctive_intervals.append(t_interval)
    
    # 6. Disjunctive Non-Overlap Constraint
    model.AddNoOverlap(disjunctive_intervals)
    
    # 7. Soft Preference for Nocturnal Lull (01:30 to 04:45 = 90 to 285 mins, center at 90 mins)
    NOCTURNAL_START = 90
    lull_deviation = model.NewIntVar(0, HORIZON_MINUTES, "lull_deviation")
    
    diff = model.NewIntVar(-HORIZON_MINUTES, HORIZON_MINUTES, "diff")
    model.Add(diff == block_start - NOCTURNAL_START)
    model.AddAbsEquality(lull_deviation, diff)
    
    model.Minimize(lull_deviation)
    
    # 8. Solve with CP-SAT
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = solver_timeout
    solver.parameters.num_search_workers = 4
    
    status = solver.Solve(model)
    
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        start_val = int(solver.Value(block_start))
        end_val = int(solver.Value(block_end))
        duration_val = end_val - start_val
        
        downtime_saved = max(0, total_individual_work_minutes - duration_val)
        downtime_saved_pct = round((downtime_saved / max(1, total_individual_work_minutes)) * 100, 1)
        
        return {
            "status": "OPTIMAL" if status == cp_model.OPTIMAL else "FEASIBLE",
            "blockId": "BLK-JOINT-0906-01",
            "corridorName": f"CSMT - Kalyan {target_track_line.replace('_', ' ')}",
            "trackLine": target_track_line,
            "startTimeMinutes": start_val,
            "endTimeMinutes": end_val,
            "durationMinutes": duration_val,
            "affectedTrackCircuits": affected_circuits,
            "bundledDemandIds": sorted(bundled_demand_ids),
            "downtimeSavedMinutes": downtime_saved,
            "corridorDowntimeSavedPct": min(100.0, downtime_saved_pct),
            "passengerDelaysMinutes": 0,
            "kavachTsrSpeedKmh": default_tsr,
            "isEmergencyTsrFallback": False,
            "optimizationTimestamp": now_iso
        }
    
    # 9. Fallback Speed Squeeze Mode (ponytail: emergency TSR broadcast when full physical possession is impossible)
    return {
        "status": "FALLBACK_TSR",
        "blockId": "BLK-EMERGENCY-TSR",
        "corridorName": f"CSMT - Kalyan {target_track_line.replace('_', ' ')}",
        "trackLine": target_track_line,
        "startTimeMinutes": 0,
        "endTimeMinutes": 0,
        "durationMinutes": 0,
        "affectedTrackCircuits": affected_circuits,
        "bundledDemandIds": sorted(bundled_demand_ids),
        "downtimeSavedMinutes": 0,
        "corridorDowntimeSavedPct": 0.0,
        "passengerDelaysMinutes": 0,
        "kavachTsrSpeedKmh": default_tsr,
        "isEmergencyTsrFallback": True,
        "optimizationTimestamp": now_iso
    }
