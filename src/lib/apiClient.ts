// src/lib/apiClient.ts
// Dual-Mode HTTP Client & Resilient Offline Simulation Engine for RailSuraksha AI

import {
  JointBlockSchedule,
  MaintenanceDemand,
  CorridorKpiMetrics,
  TrackCircuitState,
  ExplainableDecisionDossier,
  TrackInterlockingState,
  IncidentRecord,
  EbdCalculationResult,
  PlatformHoldState,
  ExplainableDecisionLog,
  DeploymentMode
} from '@/types/apiContracts';
import {
  MOCK_JOINT_BLOCKS,
  MOCK_DEMANDS,
  MOCK_CORRIDOR_KPIS,
  MOCK_CIRCUITS,
  MOCK_DECISION_DOSSIER,
  MOCK_INTERLOCKING_STATE,
  MOCK_INCIDENTS,
  MOCK_PLATFORM_HOLD_STATE
} from '@/lib/mockData';
import { calculateKavachEbd } from '@/lib/agents/kavachBrakingAgent';
import { buildExplainableDecisionLog } from '@/lib/agents/explainableLogger';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'https://railsuraksha-ai.onrender.com/api/v1';

export interface BackendStatus {
  online: boolean;
  message: string;
  latencyMs?: number;
}

/**
 * Core Timeout-Guarded Fetch Helper with Immutable Fallback
 */
export async function fetchWithTimeout<T>(
  url: string,
  fallbackData: T,
  timeoutMs = 1500
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(`HTTP status: ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[IRIS AI API] Offline / Timeout on ${url}. Using local fallback.`, err);
    }
    return structuredClone(fallbackData);
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =========================================================================
   1. AUTO-BDMS SIH 26027 OPTIMIZER ENDPOINTS
   ========================================================================= */

/**
 * Fetch active joint block schedules for corridor
 */
export async function fetchCorridorSchedule(
  divisionId = 'CR-BB-01'
): Promise<JointBlockSchedule[]> {
  return fetchWithTimeout<JointBlockSchedule[]>(
    `${API_BASE_URL}/optimizer/schedules/active?divisionId=${divisionId}`,
    MOCK_JOINT_BLOCKS
  );
}

/**
 * Fetch prioritized multi-department maintenance demands
 */
export async function fetchMaintenanceDemands(
  department = 'ALL'
): Promise<MaintenanceDemand[]> {
  return fetchWithTimeout<MaintenanceDemand[]>(
    `${API_BASE_URL}/demands?department=${department}`,
    MOCK_DEMANDS
  );
}

/**
 * Fetch corridor KPIs and capacity metrics
 */
export async function fetchCorridorKpis(): Promise<CorridorKpiMetrics> {
  return fetchWithTimeout<CorridorKpiMetrics>(
    `${API_BASE_URL}/kpis`,
    MOCK_CORRIDOR_KPIS
  );
}

/**
 * Fetch live track circuit states (Auto-BDMS SIH 26027)
 */
export async function fetchInterlockingCircuits(): Promise<TrackCircuitState[]> {
  return fetchWithTimeout<TrackCircuitState[]>(
    `${API_BASE_URL}/interlocking/circuits`,
    MOCK_CIRCUITS
  );
}

/**
 * Submit block sanction request with explainable dossier generation
 */
export async function sanctionBlockRequest(
  blockId: string,
  controllerId = 'CTRL-402'
): Promise<ExplainableDecisionDossier> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(`${API_BASE_URL}/optimizer/sanction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockId,
        controllerId,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Sanction failed: ${res.status}`);
    }

    return (await res.json()) as ExplainableDecisionDossier;
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[IRIS AI API] Fallback sanction generated locally.', err);
    }
    return structuredClone(MOCK_DECISION_DOSSIER);
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =========================================================================
   2. BACKWARD-COMPATIBLE TACTICAL ENDPOINTS
   ========================================================================= */

/**
 * Health & Status Check
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    let res: Response | null = await fetch(`${API_BASE_URL}/system/status`, {
      signal: controller.signal,
    }).catch(() => null);

    if (!res || !res.ok) {
      const healthUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/health';
      res = await fetch(healthUrl, {
        signal: controller.signal,
      }).catch(() => null);
    }

    if (res && res.ok) {
      return {
        online: true,
        message: 'FastAPI Backend Connected',
        latencyMs: Date.now() - startTime,
      };
    }
    return { online: false, message: 'Offline / Connecting' };
  } catch {
    return { online: false, message: 'Offline (Using Local TS Simulation)' };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Track Interlocking GIS Map (Tactical visualizer)
 */
export async function fetchInterlockingState(): Promise<TrackInterlockingState> {
  return fetchWithTimeout<TrackInterlockingState>(
    `${API_BASE_URL}/dispatch/interlocking-map`,
    MOCK_INTERLOCKING_STATE,
    2000
  );
}

/**
 * AI Triage Incident Queue
 */
export async function fetchIncidentQueue(
  status = 'all',
  severity = 'all'
): Promise<IncidentRecord[]> {
  return fetchWithTimeout<IncidentRecord[]>(
    `${API_BASE_URL}/triage/queue?status=${status}&severity=${severity}`,
    MOCK_INCIDENTS,
    2000
  );
}

/**
 * Approve / Review Incident
 */
export async function reviewIncidentAction(
  incidentId: string,
  action: 'APPROVE' | 'REJECT',
  operatorId = 'OP-402'
): Promise<{ success: boolean; newStatus: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(
      `${API_BASE_URL}/triage/incidents/${incidentId}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, operatorId }),
        signal: controller.signal,
      }
    );
    if (res.ok) {
      const data = await res.json();
      return { success: true, newStatus: data.newStatus || 'RESOLVED' };
    }
  } catch {
    // Fallback
  } finally {
    clearTimeout(timeoutId);
  }
  return { success: true, newStatus: action === 'APPROVE' ? 'RESOLVED' : 'REJECTED' };
}

/**
 * Kavach EBD Calculation
 */
export async function calculateEbd(params: {
  trainId: string;
  velocityKmh: number;
  obstacleDistanceMeters: number;
  massTonnes?: number;
  coefficientFriction?: number;
  trackGradientPercent?: number;
  reactionTimeSeconds?: number;
}): Promise<EbdCalculationResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const payload = {
      trainId: params.trainId,
      locoId: 'WAP-7-30245',
      velocityKmh: params.velocityKmh,
      massTonnes: params.massTonnes ?? 1400,
      coefficientFriction: params.coefficientFriction ?? 0.35,
      trackGradientPercent: params.trackGradientPercent ?? 0.2,
      reactionTimeSeconds: params.reactionTimeSeconds ?? 1.2,
      obstacleDistanceMeters: params.obstacleDistanceMeters,
    };

    const res = await fetch(`${API_BASE_URL}/braking/calculate-ebd`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (res.ok) {
      const data = await res.json();
      return {
        trainId: data.trainId,
        velocityKmh: data.velocityKmh,
        obstacleDistanceMeters: data.obstacleDistanceMeters,
        calculatedStoppingDistanceMeters: data.calculatedStoppingDistanceMeters,
        marginDistanceMeters: data.marginDistanceMeters,
        isCollisionRisk: data.isCollisionRisk,
        requiredDecelerationMs2: data.requiredDecelerationMs2,
        brakeState: data.isCollisionRisk ? 'EMERGENCY_SOLENOID_ACTUATED' : 'CLEAR',
      };
    }
  } catch {
    // Fallback
  } finally {
    clearTimeout(timeoutId);
  }

  return calculateKavachEbd({
    trainId: params.trainId,
    velocityKmh: params.velocityKmh,
    obstacleDistanceMeters: params.obstacleDistanceMeters,
    frictionCoefficient: params.coefficientFriction ?? 0.134,
    gradientPercent: params.trackGradientPercent ?? 0.002,
    reactionTimeSeconds: params.reactionTimeSeconds ?? 1.96,
  });
}

/**
 * Platform Hold State
 */
export async function fetchPlatformHoldState(
  platformId = 'PLATFORM_18'
): Promise<PlatformHoldState> {
  return fetchWithTimeout<PlatformHoldState>(
    `${API_BASE_URL}/dispatch/hold-timer/${platformId}`,
    MOCK_PLATFORM_HOLD_STATE,
    2000
  );
}

/**
 * Platform Hold Override
 */
export async function overridePlatformHold(
  platformId: string,
  action: 'RELEASE' | 'EXTEND_3M'
): Promise<PlatformHoldState> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(`${API_BASE_URL}/dispatch/override-hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platformId,
        action,
        operatorId: 'OP-402',
      }),
      signal: controller.signal,
    });
    if (res.ok) {
      const data = await res.json();
      return {
        stationCode: data.stationCode || 'CSMT',
        heldPlatformId: data.heldPlatformId || platformId,
        adjacentPlatformId: data.adjacentPlatformId || 'PLATFORM_17',
        gatewayOccupancyIndex: data.gatewayOccupancyIndex ?? 0.5,
        gatewayCrowdCount: data.gatewayCrowdCount ?? 300,
        remainingHoldSeconds: data.remainingHoldSeconds ?? 0,
        isMlExtensionActive: data.isMlExtensionActive ?? false,
        status: data.remainingHoldSeconds === 0 ? 'RELEASED' : 'HOLD_ACTIVE',
      };
    }
  } catch {
    // Fallback
  } finally {
    clearTimeout(timeoutId);
  }

  return {
    ...structuredClone(MOCK_PLATFORM_HOLD_STATE),
    remainingHoldSeconds: action === 'RELEASE' ? 0 : MOCK_PLATFORM_HOLD_STATE.remainingHoldSeconds + 180,
    status: action === 'RELEASE' ? 'RELEASED' : 'HOLD_ACTIVE',
  };
}

/**
 * Audit Log Retrieval
 */
export async function fetchAuditLog(
  incidentId: string,
  deploymentMode: DeploymentMode = 'ADVISORY'
): Promise<ExplainableDecisionLog> {
  return fetchWithTimeout<ExplainableDecisionLog>(
    `${API_BASE_URL}/audit/logs/${incidentId}`,
    buildExplainableDecisionLog(
      incidentId,
      '12345 (Vande Bharat)',
      'Section 14B Up Main Line',
      deploymentMode,
      'BOULDER',
      340,
      410
    ),
    2000
  );
}
