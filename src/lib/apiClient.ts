// src/lib/apiClient.ts
// Centralized API Client with Graceful Fallback to Local TypeScript Simulation

import {
  TrackInterlockingState,
  IncidentRecord,
  EbdCalculationResult,
  PlatformHoldState,
  ExplainableDecisionLog,
  DeploymentMode,
} from '@/types/apiContracts';
import {
  MOCK_INTERLOCKING_STATE,
  MOCK_INCIDENTS,
  MOCK_EBD_CALCULATION,
  MOCK_PLATFORM_HOLD_STATE,
  MOCK_DECISION_LOG,
} from '@/lib/mockData';
import { calculateKavachEbd } from '@/lib/agents/kavachBrakingAgent';
import { buildExplainableDecisionLog } from '@/lib/agents/explainableLogger';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://railsuraksha-ai.onrender.com/api/v1';

export interface BackendStatus {
  online: boolean;
  message: string;
  latencyMs?: number;
}

/**
 * 1. Health & Status Check
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const healthUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '') + '/health';
    const res = await fetch(healthUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      return {
        online: true,
        message: 'FastAPI Backend Connected',
        latencyMs: Date.now() - startTime,
      };
    }
    return { online: false, message: `HTTP Error: ${res.status}` };
  } catch {
    return { online: false, message: 'Offline (Using Local TS Simulation)' };
  }
}

/**
 * 2. Track Interlocking GIS Map
 */
export async function fetchInterlockingState(): Promise<TrackInterlockingState> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/dispatch/interlocking-map`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return data as TrackInterlockingState;
    }
  } catch {
    // Graceful fallback to mock data
  }
  return MOCK_INTERLOCKING_STATE;
}

/**
 * 3. AI Triage Incident Queue
 */
export async function fetchIncidentQueue(
  status = 'all',
  severity = 'all'
): Promise<IncidentRecord[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(
      `${API_BASE_URL}/triage/queue?status=${status}&severity=${severity}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data as IncidentRecord[];
      }
    }
  } catch {
    // Graceful fallback
  }
  return MOCK_INCIDENTS;
}

/**
 * 4. Approve / Review Incident
 */
export async function reviewIncidentAction(
  incidentId: string,
  action: 'APPROVE' | 'REJECT',
  operatorId = 'OP-402'
): Promise<{ success: boolean; newStatus: string }> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/triage/incidents/${incidentId}/review`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, operatorId }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return { success: true, newStatus: data.newStatus || 'RESOLVED' };
    }
  } catch {
    // Fallback to local mutation
  }
  return { success: true, newStatus: action === 'APPROVE' ? 'RESOLVED' : 'REJECTED' };
}

/**
 * 5. Kavach EBD Calculation
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
    // Fallback to local pure TS agent
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
 * 6. Platform Hold State
 */
export async function fetchPlatformHoldState(
  platformId = 'PLATFORM_18'
): Promise<PlatformHoldState> {
  try {
    const res = await fetch(`${API_BASE_URL}/dispatch/hold-timer/${platformId}`);
    if (res.ok) {
      const data = await res.json();
      return {
        stationCode: data.stationCode || 'CSMT',
        heldPlatformId: data.heldPlatformId || platformId,
        adjacentPlatformId: data.adjacentPlatformId || 'PLATFORM_17',
        gatewayOccupancyIndex: data.gatewayOccupancyIndex ?? 0.88,
        gatewayCrowdCount: data.gatewayCrowdCount ?? 482,
        remainingHoldSeconds: data.remainingHoldSeconds ?? 252,
        isMlExtensionActive: data.isMlExtensionActive ?? true,
        status: (data.status as 'HOLD_ACTIVE' | 'CLEARING' | 'RELEASED') || 'HOLD_ACTIVE',
      };
    }
  } catch {
    // Fallback
  }
  return MOCK_PLATFORM_HOLD_STATE;
}

/**
 * 7. Platform Hold Override
 */
export async function overridePlatformHold(
  platformId: string,
  action: 'RELEASE' | 'EXTEND_3M'
): Promise<PlatformHoldState> {
  try {
    const res = await fetch(`${API_BASE_URL}/dispatch/override-hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platformId,
        action,
        operatorId: 'OP-402',
      }),
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
  }

  return {
    ...MOCK_PLATFORM_HOLD_STATE,
    remainingHoldSeconds: action === 'RELEASE' ? 0 : MOCK_PLATFORM_HOLD_STATE.remainingHoldSeconds + 180,
    status: action === 'RELEASE' ? 'RELEASED' : 'HOLD_ACTIVE',
  };
}

/**
 * 8. Audit Log Retrieval
 */
export async function fetchAuditLog(
  incidentId: string,
  deploymentMode: DeploymentMode = 'ADVISORY'
): Promise<ExplainableDecisionLog> {
  try {
    const res = await fetch(`${API_BASE_URL}/audit/logs/${incidentId}`);
    if (res.ok) {
      const data = await res.json();
      return data as ExplainableDecisionLog;
    }
  } catch {
    // Fallback
  }
  return buildExplainableDecisionLog(
    incidentId,
    '12345 (Vande Bharat)',
    'Section 14B Up Main Line',
    deploymentMode,
    'BOULDER',
    340,
    410
  );
}
