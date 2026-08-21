# RailSuraksha AI — Central Resource Links & Assets Directory

> **Location:** `docs/resources.md`  
> **Purpose:** Central repository for all video stream URLs, mock datasets, ML repositories, design tokens, and project documentation links.  
> **Last Updated:** 2026-08-21  

---

## 🎥 1. Demo Video Stream URLs (Royalty-Free MP4 Feeds)

| Stream Target | Visual Content | Direct CDN MP4 URL |
| :--- | :--- | :--- |
| **Loco-Cab Forward View** | High-definition front camera feed along railway track (for YOLOv11 obstacle bounding box overlay) | [mixkit-train-passing-landscape.mp4](https://assets.mixkit.co/videos/preview/mixkit-train-passing-through-a-green-landscape-42211-large.mp4) |
| **Platform Gateway CCTV** | Station entrance crowded staircase (Pillar #1 entrance camera for optical flow crowd density $\rho$) | [mixkit-crowd-walking-station.mp4](https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-in-a-train-station-41553-large.mp4) |
| **OHE Pantograph Camera** | Overhead catenary wire & high-speed electric loco pantograph inspection camera | [mixkit-electric-train-moving-tracks.mp4](https://assets.mixkit.co/videos/preview/mixkit-electric-train-moving-fast-on-railroad-tracks-43542-large.mp4) |

---

## 📦 2. Project Datasets & Mock Schema Files

- **Local Mock Dataset & Schemas:** [mockData.ts](file:///d:/Games/Hckthons/cspin/src/lib/mockData.ts)  
  *Contains zero-dependency TypeScript mock datasets for Track Interlocking state, AI Triage incidents (`RS-2048`), Kavach RDSO EBD calculations, Platform 17/18 hold states, and 4-step decision logs.*
- **Shared API Interface Contracts:** [apiContracts in three_developer_execution_plan.md](file:///d:/Games/Hckthons/RailSuraksha_AI/docs/three_developer_execution_plan.md#shared-interface-contract-srctypesapicontractsts)  
  *Contains shared TypeScript interface definitions for `AnomalyBoundingBox`, `IncidentRecord`, `EbdCalculationResult`, `PlatformHoldState`, and `ExplainableDecisionLog`.*

---

## 🤖 3. Open-Source ML Datasets & GIS APIS

- **Roboflow Universe — Railway Track Obstacle Detection:**  
  [https://universe.roboflow.com/search?q=railway+track+obstacle](https://universe.roboflow.com/search?q=railway+track+obstacle)  
  *5,000+ annotated images of rail fractures, boulders, cattle, and foreign track objects in YOLOv8/v11 format.*
- **Kaggle — Indian Railways Operational Datasets:**  
  [https://www.kaggle.com/datasets?search=indian+railways](https://www.kaggle.com/datasets?search=indian+railways)  
  *Indian Railways train schedules, station code maps, track interlocking section metadata.*
- **OpenRailwayMap GIS Vector API:**  
  [https://www.openrailwaymap.org/](https://www.openrailwaymap.org/)  
  *Live vector GIS track lines, signal positions, and turnout switch coordinates.*

---

## 🎨 4. Design System Tokens & Typography

- **Google Fonts:**
  - `Inter` (sans-serif primary UI): [Google Fonts Inter](https://fonts.google.com/specimen/Inter)
  - `JetBrains Mono` (monospaced telemetry & speed metrics): [Google Fonts JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- **Icon Library:**
  - Lucide React Icons: [https://lucide.dev/icons/](https://lucide.dev/icons/)
- **Mintlify Light-Blue Color System Tokens:**
  - **Canvas Base (Surface 0):** `#F0F6FC`
  - **Card Surface (Surface 1):** `#FFFFFF` with `#D0DFEE` border
  - **Elevated Controls (Surface 2):** `#E6F0FA`
  - **Primary Accent:** `#2B7FFF` (Signal Blue)
  - **Text Primary:** `#0F172A` (Ink Slate)
  - **Geometry:** 4px button/input radius, 16px card radius, 24px container radius (**Zero pill buttons**).

---

## 📄 5. Internal Project Documentation Directory Map

| Document Title | File Link | Summary / Key Purpose |
| :--- | :--- | :--- |
| **6-Hour Execution Plan** | [three_developer_execution_plan.md](file:///d:/Games/Hckthons/RailSuraksha_AI/docs/three_developer_execution_plan.md) | 3-Developer parallel work matrix, 6-hour schedule, copy-paste prompts |
| **Context & ADRs** | [context.md](file:///d:/Games/Hckthons/cspin/docs/context.md) | Architectural decision records, 4-agent safety pipeline, design tokens |
| **Product Requirements (PRD)** | [prd.md](file:///d:/Games/Hckthons/RailSuraksha_AI/docs/prd.md) | MoSCoW priorities, target personas, non-functional rules |
| **API Endpoints & Schemas** | [api_endpoints_and_backend_schema.md](file:///d:/Games/Hckthons/RailSuraksha_AI/docs/api_endpoints_and_backend_schema.md) | REST API endpoints, WebSocket payload formats, database models |
| **Features Implemented** | [features_implemented.md](file:///d:/Games/Hckthons/RailSuraksha_AI/docs/features_implemented/features_implemented.md) | Feature matrix, status breakdown, architectural rationale |
| **Mock Resources Guide** | [mock_data_resources.md](file:///d:/Games/Hckthons/cspin/docs/mock_data_resources.md) | Mock data code snippets & video stream guide |
| **Development Tracker** | [tracker.md](file:///d:/Games/Hckthons/cspin/docs/tracker.md) | Task execution checklist & component progress |
