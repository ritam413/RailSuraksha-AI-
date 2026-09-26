# 📑 Grounded Research Report: IRIS AI Contracts & Hardening Architecture

> **Context:** Primary Research & Grounding for `TICKET-DEV1-01` (`src/types/apiContracts.ts` and `src/lib/mockData.ts`)  
> **Methods:** `/firecrawl`, `search_web`, Indian Railways Central Railway (CR) Operating Manuals, RDSO/SPN/196/2020, RFC 8785 JCS, Google OR-Tools CP-SAT Linear Timeline Formulations.  
> **Date:** 2026-09-26  
> **Status:** Grounded & Certified

---

## 1. Central Railway (CR) CSMT–Kalyan Track Infrastructure Grounding

### 1.1 Quadrupled Suburban Corridor & 5th/6th Lines
The 54-kilometer corridor between **Chhatrapati Shivaji Maharaj Terminus (CSMT)** and **Kalyan Junction (KYN)** operates on a **quadrupled track system** with supplementary dedicated lines:
- **Slow Corridor (`UP_SLOW` / `DOWN_SLOW`):** Handles all-stop suburban EMU local trains across 24 intermediate stations.
- **Fast Corridor (`UP_FAST` / `DOWN_FAST`):** Handles fast suburban EMUs and nocturnal express trains skipping minor stops.
- **5th and 6th Lines (`5TH_LINE` / `6TH_LINE`):** Segregates long-distance Mail/Express trains (e.g. *Punjab Mail*, *Rajdhani*, *Vande Bharat*) and JNPT container freights (`BOXN`) between Kurla/Thane and Kalyan.

### 1.2 Grounded Contract Enhancement
`TrackCircuitState`, `MaintenanceDemand`, and `JointBlockSchedule` must explicitly distinguish the track line code:
```typescript
export type TrackLineCode = 'UP_SLOW' | 'DOWN_SLOW' | 'UP_FAST' | 'DOWN_FAST' | '5TH_LINE' | '6TH_LINE';
```
This prevents false-positive interlocking lockouts (e.g., a civil block on `UP_SLOW` at KM 14.2 does not lock down the parallel `UP_FAST` or `DOWN_FAST` tracks).

---

## 2. CP-SAT Disjunctive Interval & Midnight Rollover Grounding

### 2.1 OR-Tools Linear Timeline Paradigm
Google OR-Tools CP-SAT requires **strictly non-negative monotonic integer domains** for interval variables (`model.NewIntervalVar(start, size, end, name)`). Modulo arithmetic directly inside interval constraints is computationally forbidden and breaks interval propagation.

### 2.2 Linearized 24h/7D Time Representation
- Time is modeled as continuous elapsed minutes from horizon zero ($t \in [0, \text{Horizon}]$).
- For a 24-hour tactical horizon ($H = 1440\text{ min}$), overnight shifts spanning midnight are modeled either:
  1. As continuous linear minutes exceeding 1440 (e.g., $23:30 \to 1410$, $03:30 \to 1650$).
  2. With explicit `durationMinutes: number` stored alongside `startTimeMinutes` and `endTimeMinutes` to ensure duration is never computed via naive subtraction.

```typescript
export interface JointBlockSchedule {
  blockId: string;
  corridorName: string;
  trackLine: TrackLineCode;
  startTimeMinutes: number;   // e.g. 90 = 01:30 IST
  endTimeMinutes: number;     // e.g. 285 = 04:45 IST
  durationMinutes: number;    // e.g. 195 minutes (explicit, rollover-safe)
  // ...
}
```

---

## 3. RFC 8785 Canonicalization & Delimiter-Separated SHA-256 Grounding

### 3.1 Deterministic Signing & Hashing Standard
To guarantee bit-for-bit SHA-256 parity between Python's `hashlib.sha256()` and JavaScript's `crypto.subtle.digest()`, all collections must be sorted lexicographically before serialization:
- **Canonical Delimiter Format:**
  $$\text{Payload} = \text{blockId} \parallel "|" \parallel \text{operatorId} \parallel "|" \parallel \text{timestamp} \parallel "|" \parallel \text{sortedDemandIds.join(',')} \parallel "|" \parallel \text{tsrSpeed} \parallel "|" \parallel \text{divisionId}$$
- **Array Sorting Rule:** Array items must be sorted using ASCII standard `demands.map(d => d.demandId).sort()`.

---

## 4. Grounded Interface Contract Updates

The updated contract model integrates all 4 findings:
1. `TrackLineCode` added.
2. `durationMinutes` explicitly added to `JointBlockSchedule`.
3. `passengerDelaysMinutes` converted from literal `0` to `number` (with unit test assertion for `0`).
4. Canonical payload generation utility and sorted demand IDs codified.
