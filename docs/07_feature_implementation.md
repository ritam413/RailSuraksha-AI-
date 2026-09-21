# RailSuraksha AI — Feature Implementation & Engineering Specification

**System Name:** RailSuraksha AI (Auto-BDMS): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.0.0 (Unified Grounded Specification)  
**Governing Standards:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0, and Google OR-Tools CP-SAT.

---

## 🛠️ 1. Multi-Source Ingestion & Spatial Normalization Pipeline

### 1.1 Ingestion Flow
The ingestion layer continuously normalizes unstructured data across three independent maintenance portals and one traffic dispatching portal:

```text
┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ TMS (IRPWM 2020)│   │TDMS (ACTM Vol II)│   │SMMS (IRSEM 2021)│   │   COA (G&SR)    │
│ • USFD IMR/OBS  │   │• 25kV OHE Wear   │   │• Point Machines │   │ • Live GPS Pos  │
│ • TGI Deficits  │   │• Insulator Wash  │   │• Form S&T/T-351 │   │ • Working Times │
└────────┬────────┘   └────────┬─────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                      │                     │
         └─────────────────────┼──────────────────────┴─────────────────────┘
                               ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│                       UNIFIED SPATIAL CHAINAGE NORMALIZER                          │
│                Linear Kilometer Markers (KM) ──► Discrete Track Circuits           │
│                 (e.g., KM 108/4 to 112/2  ──►  TC-03: Dadar Section)               │
└────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Spatial Chainage Converter Algorithm
Linear railway kilometer posts are mapped into discrete electrical Track Circuits (`TC-01` through `TC-06`):
```typescript
export function normalizeChainageToTrackCircuit(
  chainageStartKm: number,
  chainageEndKm: number,
  corridorCircuits: TrackCircuitTopology[]
): string[] {
  const matchedCircuitIds: string[] = [];
  for (const tc of corridorCircuits) {
    // Check spatial overlap between demand chainage and track circuit boundaries
    if (chainageStartKm < tc.endKm && chainageEndKm > tc.startKm) {
      matchedCircuitIds.push(tc.id);
    }
  }
  return matchedCircuitIds.length > 0 ? matchedCircuitIds : ['TC-UNKNOWN'];
}
```

---

## 🧮 2. ML Urgency Triage & Priority Scoring Algorithm

### 2.1 Dynamic Priority Formula
Every maintenance demand is scored based on safety criticality, asset degradation rate, and time overdue:
$$\text{Urgency Score } S_i = w_1 \cdot \text{SafetyRisk} + w_2 \cdot \text{DegradationRate} \cdot \Delta t + w_3 \cdot \frac{\text{OverdueDays}}{\text{TargetCycleDays}}$$
* Calibrated Weights: $w_1 = 0.40$, $w_2 = 0.35$, $w_3 = 0.25$.

### 2.2 Grounded Track Geometry Index (TGI) Integration (IRPWM 2020)
Track quality is computed via Track Recording Car standard deviation indexes:
$$\text{TGI} = \frac{2U_I + T_I + 6A_I + G_I}{10}$$
* $\text{TGI} \ge 80$: Good (Maintenance-free).
* $50 \le \text{TGI} < 80$: Fair (P3 Routine Maintenance within 30 days).
* $36 \le \text{TGI} < 50$: Poor (P2 Periodic Maintenance within 7 days).
* $\text{TGI} < 36$: Urgent (P1 Critical Flaw $\to$ Immediate Block & TSR $30\text{ km/h}$).

---

## ⚙️ 3. Google OR-Tools CP-SAT Joint Shadow-Block Optimizer

### 3.1 Model Formulation
The mathematical core utilizes the Constraint Programming Satisfaction (`ortools.sat.python.cp_model`) disjunctive interval framework:

```python
from ortools.sat.python import cp_model

model = cp_model.CpModel()

# 1. Variables: Define Interval Variables for Train Movements & Maintenance Tasks
# task_interval = model.NewIntervalVar(start_var, duration_val, end_var, f"task_{i}")

# 2. Hard Disjunctive Constraint: No train movement and work crew on same section
# model.AddNoOverlap([train_interval_j, maintenance_interval_b])

# 3. Hard Safety Headway: 15 min clearance buffer before passenger train arrives
# model.Add(passenger_start_time >= block_end_time + 15)

# 4. Co-Location Earthing Buffer (ACTM Vol II):
# model.Add(civil_start >= ohe_start + 10) # 10 min discharge earthing
# model.Add(civil_end <= ohe_end - 10)     # 10 min restoration buffer
```

### 3.2 Optimization Objective
$$\min Z = \alpha \sum_{b \in \mathcal{B}} \text{Duration}(b) + \beta \sum_{t \in \mathcal{T}} \Delta_{t}^{\text{delay}} + \gamma \sum_{d \in \mathcal{D}_{\text{deferred}}} \text{Risk}(d) - \delta \sum_{d_1, d_2 \in \text{Bundled}} \text{Synergy}(d_1, d_2)$$

---

## 🔄 4. Rolling Horizon Framework (RHF) Engine

To avoid brittle schedules, RailSuraksha AI uses a rolling framework parameterized by a prediction horizon $H$ and a control step $\Delta t$:

| Horizon Tier | Scope ($H$) | Freeze Step ($\Delta t$) | Operational Invariants |
| :--- | :--- | :--- | :--- |
| **Tactical 24h** | 24 Hours | 1 Hour | Immediate night-lull slotting ($01:30\text{--}04:30\text{ AM}$), emergency P1 USFD IMR repairs, live Kavach TSR broadcast. |
| **Operational 7D** | 7 Days | 24 Hours | Multi-department joint shadow bundling (Civil + OHE + S&T), CSM tamping gang and Tower Wagon routing. |
| **Strategic 30D** | 30 Days (26W) | 1 Week | Master Rolling Block Programme (GR 15.02), heavy machine fleet overhauls (BCM), long-term TGI recovery. |

---

## 🛡️ 5. Safety Actuation, Kavach TSR & Interlocking Dispatch

### 5.1 Kavach Wireless TSRMS Injection (`RDSO/SPN/196/2020`)
Upon block sanction, the system formats a digital Temporary Speed Restriction packet transmitted over UHF/LTE radio to approaching locomotive cab units:
```typescript
export interface KavachTsrPacket {
  tsrId: string;
  trackCircuitId: string;
  chainageStartKm: number;
  chainageEndKm: number;
  permittedSpeedKmh: number; // e.g. 30 km/h or 15 km/h
  activationTimestamp: string;
  expirationTimestamp: string;
  broadcastStatus: 'ARMED' | 'BROADCASTING' | 'CLEARED';
}
```

### 5.2 Dynamic Emergency Braking Distance (EBD) Calculation
$$D_{\text{stop}} = \frac{V^2}{2g(\mu + G_s)} + V \cdot t_{\text{reaction}} + d_{\text{buffer}}$$
* Friction $\mu$: Standard Dry $0.134$, Monsoon Rain $0.095$, Winter Fog $0.115$.
* $t_{\text{reaction}} = 1.2\text{s}$ autonomous, $2.5\text{s}$ advisory. $d_{\text{buffer}} = 100\text{m}$.

### 5.3 Electronic Interlocking Lockout (Form S&T/T-351)
* Clamps entrance signals (`S-12`, `S-14`) to danger (`RED`) in electronic interlocking relay logic.
* Padlocks motorized switch points (`SW-04`) to prevent conflicting route clearance into the active maintenance block.
