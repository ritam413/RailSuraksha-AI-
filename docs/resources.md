# RailSuraksha AI — Central Resource Directory (SIH 26027)

> **Location:** `docs/resources.md`  
> **System:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
> **Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
> **Document Version:** 2.0.0 (SIH 26027 Refactored Architecture)

---

## 🏛️ 1. Official Indian Railways & CRIS Primary Sources

| System / Manual | Directorate / Organization | Role in RailSuraksha AI Architecture | Reference Link |
| :--- | :--- | :--- | :--- |
| **COA** (Control Office Application) | Operations Information Systems (CRIS) | Real-time train movement tracking, electronic charting, passenger timetables & freight forecasts. | [cris.org.in/COA](https://cris.org.in) |
| **TMS** (Track Management System) | Civil Engineering Directorate | Ultrasonic flaw detection (USFD) logs, rail fracture alerts, Track Geometry Index (TGI), track tamping. | [cris.org.in/TMS](https://cris.org.in) |
| **SMMS** (Signalling Maintenance System) | Signal & Telecommunication Directorate | Point machine cycle logs, track circuit relay health, electronic interlocking (EI) disconnection requests. | [cris.org.in/SMMS](https://cris.org.in) |
| **TDMS** (Traction Distribution System) | Electrical / TRD Directorate | 25kV OHE catenary & contact wire wear logs, power sub-stations (TSS), Tower Wagon movement schedules. | [cris.org.in/TDMS](https://cris.org.in) |
| **BDMS & e-BDMS** | Traffic / Operations Directorate | Digital block demand requisition and sanction portal. Our engine serves as the automated solver core (Auto-BDMS). | Indian Railways Operating Code |
| **IRPWM** | Railway Board Civil Engineering | Indian Railways Permanent Way Manual (Chapters 5 & 6: Track Maintenance & Ultrasonic Testing). | [indianrailways.gov.in](https://indianrailways.gov.in) |
| **ACTM** | Railway Board Electrical Directorate | AC Traction Manual, Vol II: OHE Power Blocks and Tower Wagon safety rules. | [indianrailways.gov.in](https://indianrailways.gov.in) |
| **Kavach TCAS** | RDSO S&T Directorate | Specification RDSO/SPN/196/2020: Temporary Speed Restriction (TSR) and line limit wireless injection. | [rdso.indianrailways.gov.in](https://rdso.indianrailways.gov.in) |

---

## 🧮 2. Mathematical Optimization & Solver Foundations

- **Google OR-Tools (Constraint Programming & MILP):**  
  [https://developers.google.com/optimization](https://developers.google.com/optimization)  
  *Used for multi-department co-location clustering, headway constraint satisfaction, and corridor downtime minimization.*
- **NetworkX (Railway Network Graph Modeling):**  
  [https://networkx.org/](https://networkx.org/)  
  *Models track block topology, station yards, and bypass line diversions.*
- **OpenRailwayMap GIS Vector API:**  
  [https://www.openrailwaymap.org/](https://www.openrailwaymap.org/)  
  *Geospatial coordinates of Indian Railways track lines, signal positions, and turnouts.*

---

## 🎨 3. Design System & Light-Blue Mintlify Tokens

- **Typography:**
  - `Inter` (Primary UI, headers, body): [Google Fonts Inter](https://fonts.google.com/specimen/Inter)
  - `JetBrains Mono` (Monospaced telemetry, signal IDs, train numbers, KM markers): [Google Fonts JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)
- **Mintlify Light-Blue Color Tokens:**
  - **Surface 0 (Canvas Base):** `#F0F6FC`
  - **Surface 1 (Card/Panel Surface):** `#FFFFFF` with `#D0DFEE` border
  - **Surface 2 (Elevated Inputs & Active Tabs):** `#E6F0FA`
  - **Primary Accent:** `#2B7FFF` (Signal Blue)
  - **Atmospheric Accent:** `#426188` (Twilight Blue)
  - **Primary Text:** `#0F172A` (Ink Slate)
  - **Geometry:** 4px button/input radius, 16px card radius, 24px container radius (**Strictly ZERO pill buttons**).

---

## 📄 4. Documentation Directory Map

```text
docs/
├── ideasUnderstanding.md                # SIH 26027 problem statement understanding & operational loop
├── prd.md                               # Product Requirements Document (Auto-BDMS v2.0.0)
├── architecture_walkthrough.md          # End-to-end architecture, data flows & MILP formulation
├── architecture_diagram.html            # 16:9 widescreen presentation-ready architecture visual
├── api_endpoints_and_backend_schema.md  # REST, SSE, and Pydantic schemas for TMS/SMMS/TDMS/COA
├── three_developer_execution_plan.md    # 3-developer work split & hour-by-hour roadmap
├── mock_data_resources.md               # Mock datasets, corridor profiles (CSMT-KYN) & sample records
├── research_sources.md                  # Primary Indian Railways, CRIS, and RDSO citations
└── resources.md                         # Central index of external links, manuals, and assets
```
