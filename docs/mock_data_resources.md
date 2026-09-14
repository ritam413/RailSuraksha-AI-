# RailSuraksha AI — Mock Data & Corridor Simulation Resources (SIH 26027)

> **Location:** `docs/mock_data_resources.md`  
> **Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
> **Target Dataset:** TMS, SMMS, TDMS, COA Timetables & Joint Block Bundles

---

## 🚀 1. Ready-to-Use Local Mock Dataset (`src/lib/mockData.ts`)

`src/lib/mockData.ts` provides zero-dependency, fully-typed TypeScript datasets for corridor block planning. Components and API routes can import these immediately:

```typescript
import {
  MOCK_TMS_DEMANDS,       // Civil P-Way flaws, USFD alerts, tamping
  MOCK_SMMS_DEMANDS,      // Signal & Telecom point machine & relay overhauls
  MOCK_TDMS_DEMANDS,      // Electrical TRD 25kV OHE power blocks
  MOCK_COA_TRAIN_PATHS,   // Express & Freight train time-distance slots
  MOCK_JOINT_BLOCK_PLANS, // Bundled shadow-block windows with downtime savings
  MOCK_CORRIDOR_KPIS,     // 38.4% downtime saved, 96.2% asset availability
  MOCK_KAVACH_TSR_STREAM  // Active 30 km/h temporary speed restrictions
} from '@/lib/mockData';
```

---

## 🚂 2. Indian Railways Corridor Benchmark Profiles

The mock datasets simulate realistic high-density trunk routes:

### Profile A: Central Railway — CSMT to Kalyan Corridor (Mumbai Division)
* **Route Length:** 54.0 km (Quadruple Track — Up/Down Fast & Slow).
* **Daily Trains:** Over 850 suburban EMUs, 120 long-distance mail/express, and 35 goods freight rakes.
* **Maintenance Window:** Tight 3-hour nocturnal lull (01:30 to 04:30 IST).
* **Track Circuits Simulated:** `TC-01` (CSMT) $\to$ `TC-02` (Byculla) $\to$ `TC-03` (Dadar) $\to$ `TC-04` (Kurla) $\to$ `TC-05` (Thane) $\to$ `TC-06` (Kalyan).

### Profile B: Eastern Railway — Howrah to Bardhaman Main Line
* **Route Length:** 107.0 km (Triple/Quadruple line with heavy coal freight paths).
* **High-Capacity Assets:** CSM Tamping Machines (Plasser India), Tower Wagons for OHE 25kV inspection.

---

## 📊 3. Sample Mock Records

### 3.1 Civil Track Demand (TMS)
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
  description: "Ultrasonic Flaw Detection (USFD) detected transverse rail flaw (IMR)",
  estimatedDurationMinutes: 180,
  requiredAssets: ["CSM_TAMPER_98", "GANG_CIVIL_04"],
  canShadowBlock: true,
  status: "SLOTTED"
}
```

### 3.2 Electrical Catenary Demand (TDMS)
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
  description: "25kV OHE contact wire wear replacement & insulator wash",
  estimatedDurationMinutes: 150,
  requiredAssets: ["TOWER_WAGON_02", "OHE_LINE_CREW"],
  canShadowBlock: true,
  status: "SLOTTED"
}
```

### 3.3 Bundled Joint Shadow-Block Output
```typescript
{
  blockId: "BLK-JOINT-0906-01",
  sectionId: "CSMT-KYN-UP",
  trackCircuits: ["TC-03", "TC-04"],
  startTime: "01:30 IST",
  endTime: "04:45 IST",
  durationMinutes: 195,
  bundledDemandIds: ["TMS-2026-804", "TDMS-2026-312", "SMMS-2026-105"],
  downtimeSavedMinutes: 85, // 38.4% saving compared to separate blocks
  passengerDelays: 0,
  freightDelayMinutes: 12,
  kavachTsrSpeedKmh: 30,
  sanctionStatus: "RECOMMENDED"
}
```
