# Implementation Plan: TICKET-DEV1-06 Dual-Mode API Client & Offline Fallback Architecture

**Goal:** Implement a resilient, dual-mode TypeScript API client in `src/lib/apiClient.ts` with a 1500ms abort controller and automatic fallback to grounded mock datasets (`MOCK_JOINT_BLOCKS`, `MOCK_DEMANDS`, `MOCK_POLICY_PROFILE`, `MOCK_CIRCUITS`, `MOCK_CORRIDOR_KPIS`, `MOCK_DECISION_DOSSIER`), ensuring zero unhandled rejections and complete demo resilience.

- **Developer:** Developer 1 (Lead Integrator)
- **Status:** READY FOR IMPLEMENTATION
- **Estimated Duration:** ~15–20 minutes

---

## 1. Context7 & Serena Sliced Architecture Boundaries

### Relevant Symbols & Types (`src/types/apiContracts.ts`)
- `JointBlockSchedule`
- `MaintenanceDemand`
- `DivisionalPolicyProfile`
- `TrackCircuitState`
- `CorridorKpiMetrics`
- `ExplainableDecisionDossier`
- Existing tactical contracts: `TrackInterlockingState`, `IncidentRecord`, `EbdCalculationResult`, `PlatformHoldState`, `ExplainableDecisionLog`, `DeploymentMode`

### Sourced Grounded Mock Datasets (`src/lib/mockData.ts`)
- `MOCK_JOINT_BLOCKS`
- `MOCK_DEMANDS`
- `MOCK_POLICY_PROFILE`
- `MOCK_CIRCUITS`
- `MOCK_CORRIDOR_KPIS`
- `MOCK_DECISION_DOSSIER`
- Existing mocks: `MOCK_INTERLOCKING_STATE`, `MOCK_INCIDENTS`, `MOCK_PLATFORM_HOLD_STATE`

---

## 2. Target Function Signatures in `src/lib/apiClient.ts`

```typescript
// Core Timeout-Guarded Fetch Helper
export async function fetchWithTimeout<T>(url: string, fallbackData: T, timeoutMs = 1500): Promise<T>;

// Auto-BDMS API Endpoints
export async function fetchCorridorSchedule(divisionId?: string): Promise<JointBlockSchedule[]>;
export async function fetchMaintenanceDemands(department?: string): Promise<MaintenanceDemand[]>;
export async function fetchCorridorKpis(): Promise<CorridorKpiMetrics>;
export async function fetchInterlockingCircuits(): Promise<TrackCircuitState[]>;
export async function sanctionBlockRequest(blockId: string, controllerId: string): Promise<ExplainableDecisionDossier>;

// Backward-Compatible Tactical Endpoints
export async function checkBackendHealth(): Promise<BackendStatus>;
export async function fetchInterlockingState(): Promise<TrackInterlockingState>;
export async function fetchIncidentQueue(status?: string, severity?: string): Promise<IncidentRecord[]>;
export async function reviewIncidentAction(incidentId: string, action: 'APPROVE' | 'REJECT', operatorId?: string): Promise<{ success: boolean; newStatus: string }>;
export async function calculateEbd(params: EbdCalculationParams): Promise<EbdCalculationResult>;
export async function fetchPlatformHoldState(platformId?: string): Promise<PlatformHoldState>;
export async function overridePlatformHold(platformId: string, action: 'RELEASE' | 'EXTEND_3M'): Promise<PlatformHoldState>;
export async function fetchAuditLog(incidentId: string, deploymentMode?: DeploymentMode): Promise<ExplainableDecisionLog>;
```

---

## 3. Step-by-Step TDD Implementation Plan

### Step 1: Write Vitest Unit Tests (`tests/apiClient.test.ts`)
- Test 1: `fetchWithTimeout` returns remote data when backend responds within 1500ms.
- Test 2: `fetchWithTimeout` aborts and returns `fallbackData` when request exceeds timeout or network throws.
- Test 3: `fetchCorridorSchedule` returns `MOCK_JOINT_BLOCKS` when offline.
- Test 4: `fetchMaintenanceDemands` returns `MOCK_DEMANDS` when offline.
- Test 5: `fetchCorridorKpis` returns `MOCK_CORRIDOR_KPIS` when offline.
- Test 6: `fetchInterlockingCircuits` returns `MOCK_CIRCUITS` when offline.
- Test 7: `sanctionBlockRequest` returns `MOCK_DECISION_DOSSIER` gracefully on network failure.
- Test 8: Verify zero unhandled promise rejections across all API calls.

### Step 2: Implement `src/lib/apiClient.ts`
- Implement generic `fetchWithTimeout` with `AbortController` and fallback logger.
- Add Auto-BDMS endpoints (`fetchCorridorSchedule`, `fetchMaintenanceDemands`, `fetchCorridorKpis`, `fetchInterlockingCircuits`, `sanctionBlockRequest`).
- Preserve all existing tactical endpoints for backward compatibility.

### Step 3: Test Verification
- Run `npx vitest run tests/apiClient.test.ts`.
- Run full test suite `npm test` (verify all 67+ tests pass).
- Verify type check with `npx tsc --noEmit`.

### Step 4: Update Agent Memory Files
- Update `tracker.md` with new handoff entry.
- Update `features_implemented.md` marking Ticket DEV1-06 complete.
- Update `context.md` if client architecture rules changed.
