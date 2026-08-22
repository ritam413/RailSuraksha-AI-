---
title: RailSuraksha AI API
emoji: 🚆
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# RailSuraksha AI — FastAPI Backend

National-grade Railway Safety, Track Interlocking & Incident Intelligence Platform Backend API.

## Endpoints
- **Interactive Swagger Docs:** `/docs`
- **Health Check:** `/health`
- **Track GIS Interlocking Map:** `/api/v1/dispatch/interlocking-map`
- **AI Triage Incident Queue:** `/api/v1/triage/incidents`
- **Kavach EBD Physics Braking:** `/api/v1/braking/calculate-ebd`
- **Platform Hold Overrides:** `/api/v1/dispatch/hold-timer/{platform_id}/override`
- **Auditor Decision Logs:** `/api/v1/audit/decision-log/{incident_id}`
