# IRIS AI — Feature Implementation & Engineering Specification

**System Name:** IRIS AI (Intelligent Railway Inspection and Restoration AI): Automatic Block Planning & Corridor Optimization  
**Problem Statement:** SIH 26027 — *"AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways"*  
**Document Version:** 3.1.0 (Grounded Multi-Horizon & Decoupled Architecture Specification)  
**Governing Standards Reference:** IRPWM 2020, ACTM Vol II, IRSEM 2021, G&SR Chapter 15, RDSO/SPN/196/2020 Kavach Ver 4.0, and Google OR-Tools CP-SAT.

---

## 🛠️ 1. Pluggable Ingestion & Spatial Normalization Pipeline

### 1.1 Decoupled Ingestion Architecture (Ports & Adapters)
The ingestion layer normalizes external data feeds via pluggable adapter classes implementing `IIngestionAdapter`:

```text
┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ TMS (IRPWM 2020)│   │TDMS (ACTM Vol II)│   │SMMS (IRSEM 2021)│   │   COA (G&SR)    │
│ • USFD IMR/OBS  │   │• 25kV OHE Wear   │   │• Point Machines │   │ • Live GPS Pos  │
│ • TGI Deficits  │   │• Insulator Wash  │   │• Form S&T/T-351 │   │ • Working Times │
└────────┬────────┘   └────────┬─────────┘   └────────┬────────┘   └────────┬────────┘
         │                     │                      │                     │
         ▼                     ▼                      ▼                     ▼
┌─────────────────┐   ┌──────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  TMS Adapter    │   │   TDMS Adapter   │   │  SMMS Adapter   │   │   COA Adapter   │
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

### 1.2 Ingestion Adapter Base Contract
```typescript
export interface BaseIngestionPayload {
  sourceSystem: 'TMS' | 'TDMS' | 'SMMS' | 'COA' | 'CSV_FEED' | 'SIMULATOR';
  schemaVersion: string;
  rawPayload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export abstract class BaseIngestionAdapter<TRaw, TNormalized> {
  abstract readonly adapterName: string;
  abstract readonly schemaVersion: string;
  abstract validate(raw: TRaw): Promise<boolean>;
  abstract transform(raw: TRaw, policy: DivisionalPolicyProfile): Promise<TNormalized[]>;
}
```

### 1.3 Spatial Chainage Converter Algorithm
Linear railway kilometer posts are mapped into discrete electrical Track Circuits (`TC-01` through `TC-06`) via decoupled lookup:
```typescript
export function normalizeChainageToTrackCircuit(
  chainageStartKm: number,
  chainageEndKm: number,
  corridorCircuits: TrackCircuitTopology[]
): string[] {
  const matchedCircuitIds: string[] = [];
  for (const tc of corridorCircuits) {
    if (chainageStartKm < tc.endKm && chainageEndKm > tc.startKm) {
      matchedCircuitIds.push(tc.id);
    }
  }
  return matchedCircuitIds.length > 0 ? matchedCircuitIds : ['TC-UNKNOWN'];
}
```

---

## 🧮 2. Configurable Priority Scoring & Rules Engine

### 2.1 Dynamic Priority Scoring Formula (Policy Injected)
Every maintenance demand is scored based on safety criticality, asset degradation rate, and time overdue using weights dynamically supplied by the active `DivisionalPolicyProfile`:
$$\text{Urgency Score } S_i = w_{\text{safety}} \cdot \text{SafetyRisk} + w_{\text{degrade}} \cdot \text{DegradationRate} \cdot \Delta t + w_{\text{overdue}} \cdot \frac{\text{OverdueDays}}{\text{TargetCycleDays}}$$
* **Default Reference Baseline:** $w_{\text{safety}} = 0.40$, $w_{\text{degrade}} = 0.35$, $w_{\text{overdue}} = 0.25$ (Configurable per division).

### 2.2 Track Geometry Index (TGI) Integration (IRPWM 2020 Reference)
$$\text{TGI} = \frac{2U_I + T_I + 6A_I + G_I}{10}$$
* $\text{TGI} \ge 80$: Good (Maintenance-free).
* $50 \le \text{TGI} < 80$: Fair (P3 Routine Maintenance within 30 days).
* $36 \le \text{TGI} < 50$: Poor (P2 Periodic Maintenance within 7 days).
* $\text{TGI} < 36$: Urgent (P1 Critical Flaw $\to$ Immediate Block & TSR $30\text{ km/h}$).

---

## ⚙️ 3. Google OR-Tools CP-SAT Joint Shadow-Block Optimizer

### 3.1 Policy-Parameterized Model Formulation
The mathematical core utilizes Google OR-Tools CP-SAT with constraints parameterized by the active policy profile:

```python
from ortools.sat.python import cp_model

def build_corridor_model(demands, train_paths, policy_config):
    model = cp_model.CpModel()
    
    # 1. Variables: Define Interval Variables for Train Movements & Maintenance Tasks
    # task_interval = model.NewIntervalVar(start_var, duration_val, end_var, f"task_{i}")
    
    # 2. Hard Disjunctive Constraint: No train movement and work crew on same section
    # model.AddNoOverlap([train_interval_j, maintenance_interval_b])
    
    # 3. Parameterized Safety Headway (Delta_clear from policy):
    # min_clearance = policy_config.get("min_passenger_clearance_min", 15)
    # model.Add(passenger_start_time >= block_end_time + min_clearance)
    
    # 4. Parameterized Co-Location Earthing Buffer (ACTM Vol II Reference):
    # earthing_buffer = policy_config.get("ohe_earthing_buffer_min", 10)
    # restore_buffer = policy_config.get("ohe_restoration_buffer_min", 10)
    # model.Add(civil_start >= ohe_start + earthing_buffer)
    # model.Add(civil_end <= ohe_end - restore_buffer)
    
    return model
```

### 3.2 Optimization Objective
$$\min Z = \alpha \sum_{b \in \mathcal{B}} \text{Duration}(b) + \beta \sum_{t \in \mathcal{T}} \Delta_{t}^{\text{delay}} + \gamma \sum_{d \in \mathcal{D}_{\text{deferred}}} \text{Risk}(d) - \delta \sum_{d_1, d_2 \in \text{Bundled}} \text{Synergy}(d_1, d_2)$$

---

## 🔄 4. Multi-Horizon Rolling Planning Framework `[Grounded Core]`

IRIS AI operates across three grounded rolling horizons parameterized by prediction horizon $H$ and control step $\Delta t$:

| Horizon Tier | Scope ($H$) | Freeze Step ($\Delta t$) | Operational Invariants |
| :--- | :--- | :--- | :--- |
| **Tactical 24h** | 24 Hours | 1 Hour | Immediate night-lull slotting ($01:30\text{--}04:30\text{ AM}$), emergency P1 USFD IMR repairs, live Kavach TSR broadcast. |
| **Operational 7D** | 7 Days | 24 Hours | Multi-department joint shadow bundling (Civil + OHE + S&T), CSM tamping gang and Tower Wagon routing. |
| **Strategic 30D** | 30 Days (26W) | 1 Week | Master Rolling Block Programme (GR 15.02), heavy machine fleet overhauls (BCM), long-term TGI recovery. |

---

## 🛡️ 5. Safety Actuation, Kavach TSR & Interlocking Dispatch

### 5.1 Kavach Wireless TSRMS Injection Adapter (`RDSO/SPN/196/2020`)
```typescript
export interface KavachTsrPacket {
  tsrId: string;
  trackCircuitId: string;
  chainageStartKm: number;
  chainageEndKm: number;
  permittedSpeedKmh: number; // Configurable (default: 30 km/h)
  activationTimestamp: string;
  expirationTimestamp: string;
  broadcastStatus: 'ARMED' | 'BROADCASTING' | 'CLEARED';
  policyVersion: string;
}
```

### 5.2 Dynamic Emergency Braking Distance (EBD) Calculation
$$D_{\text{stop}} = \frac{V^2}{2g(\mu + G_s)} + V \cdot t_{\text{reaction}} + d_{\text{buffer}}$$
* Friction $\mu$: Standard Dry $0.134$, Monsoon Rain $0.095$, Winter Fog $0.115$.
* $t_{\text{reaction}} = 1.2\text{s}$ autonomous, $2.5\text{s}$ advisory. $d_{\text{buffer}} = 100\text{m}$.

### 5.3 Electronic Interlocking Lockout Adapter (Form S&T/T-351)
* Clamps entrance signals (`S-12`, `S-14`) to danger (`RED`) in electronic interlocking relay logic.
* Padlocks motorized switch points (`SW-04`) to prevent conflicting route clearance into the active maintenance block.
