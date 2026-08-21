import asyncio
import json
import copy
from datetime import datetime, timezone
from fastapi import APIRouter
from sse_starlette.sse import EventSourceResponse
from placeholder_data import (
    LOCO_STREAM_FRAME_TEMPLATE,
    GATEWAY_STREAM_FRAME_TEMPLATE,
    OHE_STREAM_FRAME_TEMPLATE,
)

router = APIRouter()


async def _loco_event_generator(loco_id: str):
    """Streams YOLOv11 loco-cab detection frames via SSE.
    Placeholder: yields hardcoded boulder detection at 1 Hz.
    Replace inner dict with real edge-inference output when model is ready.
    """
    frame_counter = 0
    while True:
        frame = copy.deepcopy(LOCO_STREAM_FRAME_TEMPLATE)
        frame["locoId"] = loco_id
        frame["frameId"] = f"F-{frame_counter:05d}"
        frame["timestamp"] = datetime.now(timezone.utc).isoformat()
        yield {"event": "frame", "data": json.dumps(frame)}
        frame_counter += 1
        await asyncio.sleep(1)


async def _gateway_event_generator(station_id: str, pillar_id: str):
    """Streams platform gateway crowd-count frames via SSE.
    Placeholder: yields hardcoded crowd surge detection at 1 Hz.
    Replace with real optical-flow + YOLO crowd counter output.
    """
    frame_counter = 0
    while True:
        frame = copy.deepcopy(GATEWAY_STREAM_FRAME_TEMPLATE)
        frame["stationId"] = station_id
        frame["pillarId"] = pillar_id
        frame["frameId"] = f"G-{frame_counter:05d}"
        frame["timestamp"] = datetime.now(timezone.utc).isoformat()
        yield {"event": "frame", "data": json.dumps(frame)}
        frame_counter += 1
        await asyncio.sleep(1)


async def _ohe_event_generator(section_id: str):
    """Streams OHE pantograph spark-monitor frames via SSE.
    Placeholder: yields healthy catenary state at 1 Hz.
    Replace with real pantograph anomaly detector output.
    """
    frame_counter = 0
    while True:
        frame = copy.deepcopy(OHE_STREAM_FRAME_TEMPLATE)
        frame["sectionId"] = section_id
        frame["frameId"] = f"O-{frame_counter:05d}"
        frame["timestamp"] = datetime.now(timezone.utc).isoformat()
        yield {"event": "frame", "data": json.dumps(frame)}
        frame_counter += 1
        await asyncio.sleep(1)


@router.get("/loco-cab/{loco_id}/stream", summary="Loco-cab forward vision SSE stream")
async def loco_cab_stream(loco_id: str):
    """
    SSE stream of YOLOv11 bounding boxes + kinematic metadata from the
    locomotive forward camera. One JSON event per video frame (~1 Hz placeholder).
    """
    return EventSourceResponse(_loco_event_generator(loco_id))


@router.get(
    "/platform-gateway/{station_id}/{pillar_id}",
    summary="Platform gateway CCTV SSE stream",
)
async def platform_gateway_stream(station_id: str, pillar_id: str):
    """
    SSE stream of crowd headcount, occupancy density, and optical-flow vectors
    from the platform entrance CCTV pillar camera.
    """
    return EventSourceResponse(_gateway_event_generator(station_id, pillar_id))


@router.get("/ohe/{section_id}", summary="OHE pantograph spark monitor SSE stream")
async def ohe_stream(section_id: str):
    """
    SSE stream of pantograph arc / catenary health data from the
    Overhead Equipment camera at a given track section.
    """
    return EventSourceResponse(_ohe_event_generator(section_id))
