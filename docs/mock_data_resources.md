# IRIS AI — Mock Data & Corridor Simulation Resources (SIH 26027)

> **Location:** `docs/mock_data_resources.md`  
> **Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
> **Target Dataset:** TMS (Civil P-Way), SMMS (S&T), TDMS (Electrical TRD), COA Timetables & Joint Block Bundles  
> **Standards Grounding:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 (Kavach Ver 4.0)

---

## 🚀 1. Ready-to-Use Local Mock Dataset (`src/lib/mockData.ts`)

`src/lib/mockData.ts` provides zero-dependency, fully-typed TypeScript datasets for corridor block planning. Components and API routes can import these immediately:

```typescript
import {
  MOCK_TMS_DEMANDS,       // Civil P-Way flaws, USFD IMR/OBS/REM alerts, TGI scores
  MOCK_SMMS_DEMANDS,      // Signal & Telecom point machines, Form S&T/T-351 requests
  MOCK_TDMS_DEMANDS,      // Electrical TRD 25kV OHE power blocks & wear logs
  MOCK_COA_TRAIN_PATHS,   // Express & Freight train time-distance slots
  MOCK_JOINT_BLOCK_PLANS, // Bundled shadow-block windows with downtime savings
  MOCK_CORRIDOR_KPIS,     // 38.4% downtime saved, 96.2% asset availability
  MOCK_KAVACH_TSR_STREAM  // Active 30 km/h temporary speed restrictions (TSRMS)
} from '@/lib/mockData';
```

---

## 🚂 2. Indian Railways Corridor Benchmark Profiles

The mock datasets simulate realistic high-density trunk routes:

### Profile A: Central Railway — CSMT to Kalyan Corridor (Mumbai Division)
* **Route Length:** 54.0 km (Quadruple Track — Up/Down Fast & Slow).
* **Daily Trains:** Over 850 suburban EMUs, 120 long-distance mail/express, and 35 goods freight rakes.
* **Maintenance Window:** Tight 3-hour nocturnal white corridor (01:30 to 04:30 IST).
* **Track Circuits Simulated:** `TC-01` (CSMT) $\to$ `TC-02` (Byculla) $\to$ `TC-03` (Dadar) $\to$ `TC-04` (Kurla) $\to$ `TC-05` (Thane) $\to$ `TC-06` (Kalyan).

### Profile B: Eastern Railway — Howrah to Bardhaman Main Line
* **Route Length:** 107.0 km (Triple/Quadruple line with heavy coal freight paths).
* **High-Capacity Assets:** CSM Tamping Machines (Plasser India), 8-Wheeler Tower Wagons for OHE 25kV inspection.

---

## 📊 3. Sample Grounded Mock Records

### 3.1 Civil Track Demand (TMS — IRPWM 2020 Compliance)
```typescript
{
  id: "TMS-2026-804",
  department: "TMS_CIVIL",
  assetType: "RAIL_TRACK",
  sectionId: "CSMT-KYN-UP",
  chainageKm: "KM 108/4 - 112/2",
  trackCircuitId: "TC-03",
  urgencyTier: "P1_CRITICAL",
  urgencyScore: 0.94,
  description: "Ultrasonic Flaw Detection (USFD) detected transverse rail flaw (IMR - Immediate Removal)",
  usfdClassification: "IMR",
  tgiScore: 32.4, // Urgent track (TGI < 36 requires TSR & immediate block)
  irpwmRuleRef: "IRPWM 2020 Ch 5 & 6",
  estimatedDurationMinutes: 180,
  requiredAssets: ["CSM_TAMPER_98", "GANG_CIVIL_04"],
  canShadowBlock: true,
  status: "SLOTTED"
}
```

### 3.2 Electrical Catenary Demand (TDMS — ACTM Vol II Compliance)
```typescript
{
  id: "TDMS-2026-312",
  department: "TDMS_ELECTRICAL",
  assetType: "OHE_CATENARY",
  sectionId: "CSMT-KYN-UP",
  chainageKm: "KM 109/1 - 114/6",
  trackCircuitId: "TC-03",
  urgencyTier: "P2_SCHEDULED",
  urgencyScore: 0.78,
  description: "25kV OHE contact wire wear replacement (< 74 mm² residual area) & insulator wash",
  contactWireResidualAreaSqMm: 71.5, // Exceeds 25% wear threshold (standard 107 mm²)
  actmRuleRef: "ACTM Vol II Ch 3 & 4",
  powerBlockEarthingMinutes: 10, // Mandatory discharge earthing buffer
  estimatedDurationMinutes: 150,
  requiredAssets: ["TOWER_WAGON_02", "OHE_LINE_CREW"],
  canShadowBlock: true,
  status: "SLOTTED"
}
```

### 3.3 Signalling Gear Demand (SMMS — IRSEM 2021 Compliance)
```typescript
{
  id: "SMMS-2026-105",
  department: "SMMS_SIGNALLING",
  assetType: "POINT_MACHINE",
  sectionId: "CSMT-KYN-UP",
  chainageKm: "KM 110/2 - 111/0",
  trackCircuitId: "TC-03",
  urgencyTier: "P2_SCHEDULED",
  urgencyScore: 0.72,
  description: "Point Machine SW-04 motor overhaul & stroke calibration",
  formST351Required: true, // Disconnection & Reconnection Notice mandatory
  pointMachineStrokeSeconds: 5.6, // Alert threshold (> 4.5s standard)
  pointMachineCurrentAmps: 3.1, // Elevated current (> 2.5A baseline)
  irsemRuleRef: "IRSEM 2021 Part II",
  estimatedDurationMinutes: 120,
  requiredAssets: ["SIGNAL_MAINTAINER_GANG_02"],
  canShadowBlock: true,
  status: "SLOTTED"
}
```

### 3.4 Bundled Joint Shadow-Block Output (Auto-BDMS Solver Core)
```typescript
{
  blockId: "BLK-JOINT-0906-01",
  sectionId: "CSMT-KYN-UP",
  trackCircuits: ["TC-03", "TC-04"],
  startTime: "01:30 IST",
  endTime: "04:45 IST",
  durationMinutes: 195,
  bundledDemandIds: ["TMS-2026-804", "TDMS-2026-312", "SMMS-2026-105"],
  downtimeSavedMinutes: 85, // 38.4% saving compared to separate blocks (accumulating 7.5h)
  passengerDelays: 0,
  passengerClearanceBufferMinutes: 15, // Mandatory G&SR headway buffer
  freightDelayMinutes: 12,
  kavachTsrSpeedKmh: 30, // RDSO/SPN/196/2020 wireless TSRMS broadcast
  cautionOrderForm: "T/409",
  disconnectionForm: "S&T/T-351",
  sanctionStatus: "RECOMMENDED",
  sha256AuditSeal: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```
