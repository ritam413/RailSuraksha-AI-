# 🥊 Adversarial Review (Red Team Report): IRIS AI Documentation Suite

**Target:** `docs/` Specification Suite (`01_PRD.md` through `15_rules.md`)  
**Date:** 2026-09-21  
**Verdict:** ✅ **CLEARED (P2 / Pass — Sealed Architecture & Hardened Defenses)**  
**Review Mandate:** Relentless anti-sycophantic red-team stress test to expose hidden assumptions, unhandled concurrency, race conditions, edge-case failure modes, and loose ends before production implementation.

---

## 💥 Executive Attack Summary

Adversarial stress-testing analyzed the entire `docs/` specification suite against **4 Attack Vectors** (Chaos/Hostile Inputs, Concurrency/Race Conditions, Scale/Exhaustion, and Hidden Assumptions/Boundary Violations). 

All identified loose ends and failure vectors have been **formally sealed and codified** across the architecture documentation:
1. **Dual Controller Sanction Race Condition** $\to$ Sealed via `version: INTEGER` optimistic concurrency token and PostgreSQL `pg_advisory_xact_lock(section_id)` in [`docs/09_api_design.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/09_api_design.md) & [`docs/10_database_schema.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/10_database_schema.md).
2. **Mid-Block Sudden P1 Emergency Flaw Injection** $\to$ Sealed via Invariant 9 Dynamic Loop Diversion & Immediate Kavach $15\text{ km/h}$ crawling speed cap in [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md).
3. **Machine Overrun & Siding Deadlock** $\to$ Sealed via Invariant 8 Assisted Machine Clearance SLA ($30\text{ min}$ threshold for shunting engine attachment) in [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md) & [`docs/07_feature_implementation.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/07_feature_implementation.md).
4. **Adapter Schema Desynchronization & Malformed Coordinates** $\to$ Sealed via Hexagonal `IIngestionAdapter`, `raw_payload: JSONB`, and `dead_letter_ingestion_queue` table in [`docs/10_database_schema.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/10_database_schema.md) & [`docs/11_schema.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/11_schema.md).
5. **WebSocket Disconnection State Divergence** $\to$ Sealed via monotonic sequence numbers (`seq_id`) and `GET /api/v1/sync/events` replay catch-up endpoint in [`docs/09_api_design.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/09_api_design.md).
6. **Statutory G&SR Reconnection Two-Phase Commit Timeout** $\to$ Sealed via G&SR Rule 15.06 10-Minute Timeout Fallback with Station Master Biometric Private Number (PN) emergency manual reconnection in [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md).

---

## 🎯 Exploit & Failure Scenarios & Mitigations

### 1. Concurrency: Dual Controller Sanction Race Condition
- **Severity:** **P0 (Critical)**
- **Vector:** Concurrency / State Inconsistency
- **Scenario:**
  ```text
  Step 1: Controller A (Main Line) and Controller B (Suburban Section) view overlapping boundary track circuit TC-03.
  Step 2: Both click [SANCTION BLOCK] at t = 00:00:00.100 for two different maintenance slots.
  Step 3: Database creates two JOINT_BLOCK_PLANS without row-level lock or version check.
  Step 4: Conflicting work gangs enter the same track section under conflicting speed profiles.
  ```
- **Location:** [`docs/09_api_design.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/09_api_design.md) (`POST /api/v1/blocks/:blockId/sanction`) & [`docs/10_database_schema.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/10_database_schema.md).
- **Remediation Implemented:** 
  * Added optimistic concurrency control (`version: INTEGER`) and PostgreSQL exclusive advisory lock (`pg_advisory_xact_lock(section_id)`) during sanction execution.

---

### 2. Boundary Violation: Mid-Block Sudden P1 Defect in Clearance Buffer ($\Delta_{\text{clear}}$)
- **Severity:** **P1 (High)**
- **Vector:** State Transition / Safety Boundary Violation
- **Scenario:**
  ```text
  Step 1: Block BLK-01 is active on TC-03, scheduled to end at 04:30 AM with train Express #12127 arriving at 04:45 AM (15-min headway).
  Step 2: At 04:20 AM, an ultrasonic probe detects an acute IMR rail fracture on TC-03.
  Step 3: Block cannot safely terminate at 04:30 AM, violating the zero passenger delay invariant.
  ```
- **Location:** [`docs/08_appflow.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/08_appflow.md) & [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md).
- **Remediation Implemented:**
  * Defined **Invariant 9: Mid-Block Emergency P1 Escalation Protocol**: The system instantly triggers a dynamic train loop diversion or regulates upstream signals to yellow/double-yellow while broadcasting an immediate Kavach $15\text{ km/h}$ crawling speed cap.

---

### 3. Machine Kinematics: Tamper Breakdown & Block Overrun
- **Severity:** **P1 (High)**
- **Vector:** Machine Physical Constraints / Starvation
- **Scenario:**
  ```text
  Step 1: CSM Tamper #98 is working at KM 110/4 inside a 180-min block.
  Step 2: At t = 160 min, the tamper engine fails or suffers a hydraulic line rupture.
  Step 3: Machine cannot clear the main line within the 15-min safety clearance buffer.
  ```
- **Location:** [`docs/07_feature_implementation.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/07_feature_implementation.md) & [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md).
- **Remediation Implemented:**
  * Formalized **Invariant 8: Assisted Machine Clearance SLA**: If a machine fails to report nominal transit velocity $30\text{ min}$ before block expiry, the system alerts the nearest locomotive shed for an emergency shunting locomotive attachment.

---

### 4. Input Robustness: Unparseable Spatial Coordinates & Adapter DLQ
- **Severity:** **P2 (Moderate)**
- **Vector:** Input Validation / Data Ingestion
- **Scenario:**
  ```text
  Step 1: Legacy TMS feed transmits a malformed chainage string (e.g. "KM 999/99 - NULL" or out-of-bounds coordinates).
  Step 2: Spatial Normalizer fails to resolve any Track Circuit ID.
  Step 3: Without a Dead-Letter Queue (DLQ), the ingestion pipeline either drops the defect silently or halts processing for valid defects.
  ```
- **Location:** [`docs/07_feature_implementation.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/07_feature_implementation.md), [`docs/09_api_design.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/09_api_design.md), [`docs/10_database_schema.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/10_database_schema.md).
- **Remediation Implemented:**
  * Added `dead_letter_ingestion_queue` table and unmapped triage status (`UNRESOLVED_SPATIAL_CHAINAGE`) prompting supervisor geo-tagging while isolating malformed payloads.

---

### 5. Telemetry Resilience: WebSocket Disconnect & Replay Sync
- **Severity:** **P2 (Moderate)**
- **Vector:** Network Resilience / Telemetry
- **Scenario:**
  ```text
  Step 1: Section Controller's browser loses WiFi connection for 12 seconds during block sanction.
  Step 2: The server broadcasts Kavach TSR and interlocking clamping events over WebSocket.
  Step 3: Upon reconnect, the client UI is desynchronized with physical field relay state.
  ```
- **Location:** [`docs/09_api_design.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/09_api_design.md) (`WS /ws/v1/corridor-telemetry`).
- **Remediation Implemented:**
  * Implemented monotonic sequence numbers (`seq_id`) and `GET /api/v1/sync/events?since_seq=N` catch-up delta endpoint upon socket reconnect.

---

### 6. Statutory Compliance: Incomplete 2PC Reconnection Timeout Fallback
- **Severity:** **P1 (High)**
- **Vector:** Distributed Transaction & Regulatory Invariant
- **Scenario:**
  ```text
  Step 1: Civil and S&T supervisors submit digital reconnection tokens via mobile app.
  Step 2: Electrical TRD supervisor's mobile battery dies before submitting the OHE restoration token.
  Step 3: The system remains in an indefinite 2PC deadlock; power is not re-energized, halting morning train traffic.
  ```
- **Location:** [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md) (Invariant 2).
- **Remediation Implemented:**
  * Codified explicit **10-Minute Timeout Fallback**: If a department token is missing $\ge 10\text{ minutes}$ past block end, the system enables Station Master biometric Private Number (PN) emergency manual reconnection per G&SR Rule 15.06.

---

## 🛡️ Hardening Verification Checklist

- [x] Concurrency race condition sealed with `version` locking and `pg_advisory_xact_lock` in [`docs/09_api_design.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/09_api_design.md) & [`docs/10_database_schema.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/10_database_schema.md).
- [x] Mid-block sudden P1 flaw escalation codified in [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md) (Invariant 9).
- [x] Heavy machine breakdown & assisted clearance SLA codified in [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md) (Invariant 8).
- [x] Corrupt third-party feed quarantine specified in `dead_letter_ingestion_queue` in [`docs/10_database_schema.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/10_database_schema.md).
- [x] Disconnected client state replay specified via `/api/v1/sync/events` in [`docs/09_api_design.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/09_api_design.md).
- [x] Statutory 2PC deadlock prevented with G&SR 15.06 10-Minute Timeout Fallback in [`docs/15_rules.md`](file:///d:/Games/Hckthons/IRIS_ai/docs/15_rules.md).
- [x] Full consistency established across all PRD versions (`docs/01_PRD.md`, `docs/prd.md`, `docs/three_developer_execution_plan.md`, `docs/api_endpoints_and_backend_schema.md`).
