"""
Pytest Test Suite for IRIS AI Google OR-Tools CP-SAT Optimizer Backend.
Verifies Invariants 3.1 through 3.7.
"""
import pytest
from fastapi.testclient import TestClient
from main import app
from optimizer import solve_corridor_cp_sat

client = TestClient(app)

SAMPLE_DEMANDS = [
    {
        "demandId": "DEM-TMS-804",
        "department": "TMS_CIVIL",
        "trackCircuitId": "TC-03",
        "trackLine": "UP_FAST",
        "stationSection": "Dadar - Kurla",
        "chainageKm": 12.4,
        "urgencyTier": "P1_CRITICAL",
        "urgencyScore": 0.94,
        "durationMinutes": 120,
        "requiresPowerBlock": False,
        "rawTicketId": "TMS-MUM-2026-804",
        "defectDescription": "Ultrasonic Rail Flaw detected at KM 12/400"
    },
    {
        "demandId": "DEM-TDMS-312",
        "department": "TDMS_ELECTRICAL",
        "trackCircuitId": "TC-04",
        "trackLine": "UP_FAST",
        "stationSection": "Kurla - Ghatkopar",
        "chainageKm": 15.8,
        "urgencyTier": "P2_SCHEDULED",
        "urgencyScore": 0.72,
        "durationMinutes": 90,
        "requiresPowerBlock": True,
        "rawTicketId": "TDMS-BB-9921",
        "defectDescription": "25kV Catenary Dropper replacement"
    },
    {
        "demandId": "DEM-SMMS-109",
        "department": "SMMS_SIGNAL",
        "trackCircuitId": "TC-03",
        "trackLine": "UP_FAST",
        "stationSection": "Dadar Interlocking",
        "chainageKm": 10.2,
        "urgencyTier": "P2_SCHEDULED",
        "urgencyScore": 0.68,
        "durationMinutes": 60,
        "requiresPowerBlock": False,
        "rawTicketId": "SMMS-SIG-440",
        "defectDescription": "Point Machine 104B detector contact cleaning"
    }
]

# Trains running outside the 01:30 - 04:45 window
SAMPLE_TRAINS_NOMINAL = [
    {
        "trainNumber": "12345",
        "trainName": "Vande Bharat Express",
        "trainType": "PREMIUM_PASSENGER",
        "originStation": "CSMT",
        "destinationStation": "Kalyan",
        "trajectoryPoints": [
            {"stationCode": "CSMT", "km": 0.0, "arrivalTimeMinutes": 360, "departureTimeMinutes": 365},
            {"stationCode": "KYN", "km": 54.0, "arrivalTimeMinutes": 420, "departureTimeMinutes": 425}
        ]
    },
    {
        "trainNumber": "12137",
        "trainName": "Punjab Mail",
        "trainType": "EXPRESS",
        "originStation": "CSMT",
        "destinationStation": "Kalyan",
        "trajectoryPoints": [
            {"stationCode": "CSMT", "km": 0.0, "arrivalTimeMinutes": 1140, "departureTimeMinutes": 1150},
            {"stationCode": "KYN", "km": 54.0, "arrivalTimeMinutes": 1210, "departureTimeMinutes": 1215}
        ]
    }
]

# Dense 24-hour trains that leave no gap >= 60 min with 15 min headway
SAMPLE_TRAINS_DENSE = [
    {
        "trainNumber": f"LOCAL_{i}",
        "trainName": f"Suburban Local {i}",
        "trainType": "SUBURBAN",
        "originStation": "CSMT",
        "destinationStation": "Kalyan",
        "trajectoryPoints": [
            {"stationCode": "CSMT", "km": 0.0, "arrivalTimeMinutes": i * 45, "departureTimeMinutes": i * 45 + 30}
        ]
    } for i in range(32)
]

SAMPLE_POLICY = {
    "divisionId": "BB-CR",
    "divisionName": "Mumbai Central Railway Division",
    "safetyHeadwayBufferMinutes": 15,
    "oheEarthingBufferMinutes": 10,
    "oheRestorationBufferMinutes": 10,
    "defaultTsrSpeedKmh": 30,
    "solverTimeoutSeconds": 2.0
}


def test_nominal_corridor_optimization():
    """Verify solver finds a nocturnal window with downtime savings and 0 passenger delays."""
    result = solve_corridor_cp_sat(SAMPLE_DEMANDS, SAMPLE_TRAINS_NOMINAL, SAMPLE_POLICY)
    
    assert result["status"] in ("OPTIMAL", "FEASIBLE")
    assert result["isEmergencyTsrFallback"] is False
    assert result["passengerDelaysMinutes"] == 0
    assert result["startTimeMinutes"] >= 0
    assert result["endTimeMinutes"] <= 1440
    assert result["durationMinutes"] > 0
    assert result["downtimeSavedMinutes"] > 0
    assert result["corridorDowntimeSavedPct"] > 0
    assert "TC-03" in result["affectedTrackCircuits"]
    assert len(result["bundledDemandIds"]) == 3


def test_headway_clearance_invariant():
    """Verify block interval is at least 15 minutes away from any train arrival/departure."""
    result = solve_corridor_cp_sat(SAMPLE_DEMANDS, SAMPLE_TRAINS_NOMINAL, SAMPLE_POLICY)
    
    b_start = result["startTimeMinutes"]
    b_end = result["endTimeMinutes"]
    headway = SAMPLE_POLICY["safetyHeadwayBufferMinutes"]
    
    for train in SAMPLE_TRAINS_NOMINAL:
        for pt in train["trajectoryPoints"]:
            t_arr = pt["arrivalTimeMinutes"]
            t_dep = pt["departureTimeMinutes"]
            # Block must end before train arrives (with headway) OR start after train leaves (with headway)
            is_clear = (b_end + headway <= t_arr) or (b_start >= t_dep + headway)
            assert is_clear, f"Headway violation against train {train['trainNumber']}"


def test_dense_traffic_emergency_fallback():
    """Verify solver does not crash when traffic is infeasible, returning FALLBACK_TSR."""
    result = solve_corridor_cp_sat(SAMPLE_DEMANDS, SAMPLE_TRAINS_DENSE, SAMPLE_POLICY)
    
    assert result["status"] == "FALLBACK_TSR"
    assert result["isEmergencyTsrFallback"] is True
    assert result["kavachTsrSpeedKmh"] == 30
    assert result["passengerDelaysMinutes"] == 0


def test_fastapi_solve_endpoint():
    """Verify HTTP POST /api/v1/optimizer/solve-corridor endpoint response structure."""
    payload = {
        "demands": SAMPLE_DEMANDS,
        "trainPaths": SAMPLE_TRAINS_NOMINAL,
        "policy": SAMPLE_POLICY
    }
    
    response = client.post("/api/v1/optimizer/solve-corridor", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    assert data["status"] in ("OPTIMAL", "FEASIBLE")
    assert data["passengerDelaysMinutes"] == 0
    assert data["corridorName"] == "CSMT - Kalyan UP FAST"
    assert data["trackLine"] == "UP_FAST"
    assert isinstance(data["bundledDemandIds"], list)
