# Primary Research Sources: Indian Railways Automatic Block Planning

> **Problem Statement:** Smart India Hackathon (SIH) Problem Statement 26027  
> **Title:** AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways  
> **Ministry / Department:** Ministry of Railways (Centre for Railway Information Systems - CRIS & RDSO)  
> **Document Version:** 2.1.0 (Grounded Primary Source Directory)

This document records the official Indian Railways, CRIS (Centre for Railway Information Systems), and RDSO (Research Designs and Standards Organisation) primary sources referenced for the Block Planning and Maintenance Coordination architecture.

---

## 1. Official Railway Information Systems & Portals (CRIS)

1. **BDMS (Block & Disconnection Management System) — CRIS**
   * *Primary Purpose:* Unified digital portal for inter-departmental block requisition, processing, and sanctioning of Traffic, Power, and Disconnection blocks across Civil, Electrical, S&T, and Operating departments.
   * *Integration:* Our engine acts as the automated optimization solver brain for BDMS (Auto-BDMS), replacing manual text requests with constraint-optimized joint block schedules.
   * *Source Reference:* CRIS Operations Information Systems Division — [cris.org.in](https://cris.org.in).

2. **COA (Control Office Application) — CRIS Operations Information Systems**
   * *Primary Purpose:* Real-time train movement tracking, electronic train charting, and sectional controller dispatching.
   * *Data Ingested:* Scheduled passenger timetables, active train running delays, and goods train freight path forecasts.
   * *Source Reference:* CRIS COA Portal — [cris.org.in](https://cris.org.in).

3. **TMS (Track Management System) — Civil Engineering Directorate**
   * *Primary Purpose:* Centralized digital track inspection, ultrasonic rail flaw detection (USFD) logs, Track Geometry Index (TGI) recording from Track Recording Cars (TRC), and track tamping machine scheduling.
   * *Data Ingested:* P1/P2/P3 track defects, rail fractures (IMR/OBS/REM), and overdue maintenance chainage markers.
   * *Source Reference:* Indian Railways Permanent Way Manual (**IRPWM 2020**), Chapters 5 & 6; CRIS TMS Portal.

4. **TDMS (Traction Distribution Management System) — Electrical / TRD Directorate**
   * *Primary Purpose:* Asset health monitoring of 25kV Overhead Equipment (OHE), catenary and contact wire wear (< 74 mm²), traction sub-stations (TSS), insulator wash cycles, and Tower Wagon movement logs.
   * *Data Ingested:* Power block demands (25kV OHE de-energization and discharge earthing).
   * *Source Reference:* Indian Railways AC Traction Manual (**ACTM**), Volume II; CRIS TDMS Portal.

5. **SMMS (Signalling Maintenance & Management System) — S&T Directorate**
   * *Primary Purpose:* Preventive and breakdown maintenance tracking of point machines, track circuits, electronic interlocking (EI), and signal aspects.
   * *Data Ingested:* Signaling overhaul schedules and statutory disconnection requirements (**Form S&T/T-351**).
   * *Source Reference:* Indian Railways Signal Engineering Manual (**IRSEM 2021**), Part II; CRIS SMMS Portal.

---

## 2. Safety & Engineering Standards (RDSO & Indian Railways)

1. **Kavach / TCAS (Automatic Train Protection) — RDSO Specification RDSO/SPN/196/2020 (Ver 4.0 / 3.2)**
   * *Integration:* Automatic dissemination of Temporary Speed Restrictions (TSR) via the Temporary Speed Restriction Management System (TSRMS) directly to locomotive cab units over UHF/LTE-R radio links; dynamic EBD calculation.
   * *Source Reference:* RDSO S&T Directorate Specification — [rdso.indianrailways.gov.in](https://rdso.indianrailways.gov.in).

2. **Indian Railways General and Subsidiary Rules (G&SR) — Operating Code & Chapter 15**
   * *Integration:* Strict adherence to statutory safety forms:
     * **Form S&T/T-351:** Disconnection & Reconnection Notice for interlocking gear.
     * **Form T/409 Series:** Caution Orders (T/409 Speed Restriction, T/A 409 Nil, T/B 409 Reminder, T/C 409 Trolley).
     * Safety clearance margins ($\Delta_{\text{clear}} \ge 15\text{ min}$) between maintenance block termination and passenger train entry.
   * *Source Reference:* Indian Railways Safety Directorate — [indianrailways.gov.in](https://indianrailways.gov.in).

---

## 3. Mathematical Optimization & Solver Foundations

1. **Google OR-Tools CP-SAT Solver (`ortools.sat.python.cp_model`)**
   * *Formulation:* Disjunctive interval scheduling (`NewIntervalVar`, `AddNoOverlap`, `AddCumulative`) minimizing total corridor downtime, secondary delay penalties, and deferred risk penalties under hard safety separation constraints.
   * *Reference:* Google AI & Operations Research — [developers.google.com/optimization](https://developers.google.com/optimization).

2. **NetworkX Graph Modeling & OpenRailwayMap GIS**
   * *Formulation:* Geospatial track topology modeling, block section chainage, turnout geometry, and bypass diversions.
   * *Reference:* NetworkX Graph Theory — [networkx.org](https://networkx.org) & OpenRailwayMap API — [openrailwaymap.org](https://www.openrailwaymap.org).
