# Primary Research Sources: Indian Railways Automatic Block Planning

> **Problem Statement:** Smart India Hackathon (SIH) Problem Statement 26027  
> **Title:** AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways  
> **Ministry / Department:** Ministry of Railways (Centre for Railway Information Systems - CRIS & RDSO)

This document records the official Indian Railways, CRIS (Centre for Railway Information Systems), and RDSO (Research Designs and Standards Organisation) primary sources referenced for the Block Planning and Maintenance Coordination architecture.

---

## 1. Official Railway Information Systems & Portals (CRIS)

1. **COA (Control Office Application) — CRIS**
   * *Primary Purpose:* Real-time train movement tracking, electronic train charting, and sectional controller dispatching.
   * *Data Ingested:* Scheduled passenger timetables, active train running delays, and goods train freight path forecasts.
   * *Source Reference:* CRIS Operations Information Systems (OIS) Division — [cris.org.in](https://cris.org.in).

2. **TMS (Track Management System) — Civil Engineering Directorate**
   * *Primary Purpose:* Centralized digital track inspection, ultrasonic rail flaw detection (USFD) logs, Track Geometry Index (TGI) recording from Track Recording Cars (TRC), and track tamping machine scheduling.
   * *Data Ingested:* P1/P2/P3 track defects, rail fractures, and overdue maintenance chainage markers.
   * *Source Reference:* Indian Railways Permanent Way Manual (IRPWM), Chapter 5 & 6; CRIS TMS Portal.

3. **SMMS (Signalling Maintenance & Management System) — S&T Directorate**
   * *Primary Purpose:* Preventive and breakdown maintenance tracking of point machines, track circuits, electronic interlocking (EI), and signal aspects.
   * *Data Ingested:* Signaling overhaul schedules and disconnection requirements.
   * *Source Reference:* Indian Railways Signal Engineering Manual (IRSEM), Part II; CRIS SMMS.

4. **TDMS (Traction Distribution Management System) — Electrical / TRD Directorate**
   * *Primary Purpose:* Asset health monitoring of 25kV Overhead Equipment (OHE), catenary wire wear, power sub-stations (TSS), insulator wash cycles, and Tower Wagon movement logs.
   * *Data Ingested:* Power block demands (OHE power shut-offs).
   * *Source Reference:* Indian Railways AC Traction Manual (ACTM), Volume II; CRIS TDMS.

5. **BDMS (Block Demand Management System) & e-BDMS**
   * *Primary Purpose:* Digital portal for inter-departmental block requisition, traffic acceptance, and sanction by Senior Divisional Operations Managers (Sr. DOM).
   * *Role in Solution:* Our engine acts as the automated optimization brain for BDMS (Auto-BDMS), replacing manual text requests with constraint-optimized joint block schedules.

---

## 2. Safety & Engineering Standards (RDSO)

1. **Kavach / TCAS (Train Collision Avoidance System) — RDSO Specification RDSO/SPN/196/2020**
   * *Integration:* Automatic dissemination of Temporary Speed Restrictions (TSR) and track closure limits directly to locomotive cab units during active maintenance blocks to protect field maintenance gangs.
2. **Indian Railways General and Subsidiary Rules (G&SR) — Chapter 15: Permanent Way and Works**
   * *Integration:* Strict adherence to safety clearance times, signal disconnection protocols, and emergency line blocking procedures.

---

## 3. Mathematical Optimization Foundations

1. **Constraint Satisfaction & Mixed-Integer Linear Programming (MILP)**
   * *Tools:* Google OR-Tools (`ortools.sat.python.cp_model`) and NetworkX.
   * *Formulation:* Multi-objective optimization minimizing corridor downtime and train delay penalty costs under hard safety headway constraints.
