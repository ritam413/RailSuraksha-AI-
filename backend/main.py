"""
RailSuraksha AI — FastAPI Prototype Backend
============================================
National-grade Railway Safety & Incident Intelligence Platform.

Run:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000

Interactive docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import streams, triage, braking, dispatch, system, audit

app = FastAPI(
    title="RailSuraksha AI — Backend API",
    description=(
        "Prototype REST + SSE + WebSocket API for the RailSuraksha national railway safety platform. "
        "All ML inference endpoints return hardcoded placeholder data. "
        "The Kavach EBD physics calculation (/braking/calculate-ebd) is fully implemented with the RDSO formula."
    ),
    version="0.1.0-prototype",
    contact={"name": "RailSuraksha Team"},
    license_info={"name": "Internal — not for distribution"},
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Next.js frontend from any domain (Vercel, Render, HF, localhost)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(streams.router,  prefix="/api/v1/streams",  tags=["Video Streams (SSE)"])
app.include_router(triage.router,   prefix="/api/v1/triage",   tags=["AI Triage Agent"])
app.include_router(braking.router,  prefix="/api/v1/braking",  tags=["Kavach Braking Agent"])
app.include_router(dispatch.router, prefix="/api/v1/dispatch", tags=["Section Dispatch Agent"])
app.include_router(system.router,   prefix="/api/v1/system",   tags=["System Mode"])
app.include_router(audit.router,    prefix="/api/v1/audit",    tags=["Audit & Compliance"])


@app.api_route("/", methods=["GET", "HEAD"], tags=["System"])
async def root():
    return {
        "service": "RailSuraksha AI Backend",
        "status": "prototype",
        "docs": "/docs",
        "note": "ML model placeholders active — replace with real inference when models are trained.",
    }


@app.api_route("/health", methods=["GET", "HEAD"], tags=["System"])
async def health():
    return {"status": "ok"}


@app.api_route("/ping", methods=["GET", "HEAD"], tags=["System"])
async def ping():
    return {"status": "ok", "service": "RailSuraksha"}


@app.api_route("/api/v1/system/status", methods=["GET", "HEAD"], tags=["System"])
async def system_status():
    return {"status": "ok", "service": "RailSuraksha AI"}
