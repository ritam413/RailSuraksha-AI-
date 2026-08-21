// tests/backend_api_engine.test.ts
// Vitest Suite for RailSuraksha AI FastAPI Backend Engine & API Client Integration

import { describe, it, expect } from 'vitest';
import {
  checkBackendHealth,
  fetchInterlockingState,
  fetchIncidentQueue,
  reviewIncidentAction,
  calculateEbd,
  fetchPlatformHoldState,
  overridePlatformHold,
  fetchAuditLog
} from '@/lib/apiClient';

describe('RailSuraksha AI — FastAPI Backend Engine & API Client Suite', () => {
  describe('1. Health Probe & Server Status', () => {
    it('successfully connects to the live FastAPI backend health endpoint', async () => {
      const health = await checkBackendHealth();
      expect(health.online).toBe(true);
      expect(health.message).toContain('FastAPI Backend Connected');
      expect(typeof health.latencyMs).toBe('number');
      expect(health.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('2. Railway Interlocking Telemetry Engine', () => {
    it('retrieves track circuits, signals, and switches from backend dispatch engine', async () => {
      const state = await fetchInterlockingState();
      expect(state).toBeDefined();
      expect(Array.isArray(state.circuits)).toBe(true);
      expect(state.circuits.length).toBeGreaterThan(0);
      expect(Array.isArray(state.signals)).toBe(true);
      expect(state.signals.length).toBeGreaterThan(0);
      expect(Array.isArray(state.switches)).toBe(true);

      // Verify specific circuit block structure
      const circuit = state.circuits.find((c) => c.circuitId === 'BLK-101');
      expect(circuit).toBeDefined();
      expect(circuit?.lineName).toBe('Up Main 1A');
    });
  });

  describe('3. AI Triage Incident Queue Engine', () => {
    it('fetches prioritized incident queue from AI triage router', async () => {
      const queue = await fetchIncidentQueue('all', 'all');
      expect(Array.isArray(queue)).toBe(true);
      expect(queue.length).toBeGreaterThan(0);

      const firstIncident = queue[0];
      expect(firstIncident.incidentId).toBeDefined();
      expect(firstIncident.severityCategory).toBeDefined();
      expect(firstIncident.severityScore).toBeGreaterThan(0);
      expect(Array.isArray(firstIncident.boundingBoxes)).toBe(true);
    });

    it('submits a Section Controller incident approval action to backend', async () => {
      const response = await reviewIncidentAction('INC-2026-0821-001', 'APPROVE', 'OP-402');
      expect(response.success).toBe(true);
      expect(['EXECUTING', 'RESOLVED']).toContain(response.newStatus);
    });
  });

  describe('4. Kavach Emergency Braking Distance (EBD) Physics API', () => {
    it('calculates deterministic RDSO EBD physics stopping distance via backend POST request', async () => {
      const ebd = await calculateEbd({
        trainId: '12345 (Vande Bharat)',
        velocityKmh: 110,
        obstacleDistanceMeters: 340,
        massTonnes: 1400,
        coefficientFriction: 0.35,
        trackGradientPercent: 0.2,
        reactionTimeSeconds: 1.2
      });

      expect(ebd.trainId).toBe('12345 (Vande Bharat)');
      expect(ebd.velocityKmh).toBe(110);
      expect(ebd.obstacleDistanceMeters).toBe(340);
      expect(ebd.calculatedStoppingDistanceMeters).toBeGreaterThan(0);
      expect(ebd.requiredDecelerationMs2).toBeGreaterThan(0);
      expect(typeof ebd.isCollisionRisk).toBe('boolean');
      expect(['CLEAR', 'EMERGENCY_SOLENOID_ACTUATED']).toContain(ebd.brakeState);
    });
  });

  describe('5. Platform Gateway Crowd & Hold Timer Dispatch', () => {
    it('fetches platform 18 deterministic hold state from dispatch engine', async () => {
      const holdState = await fetchPlatformHoldState('PLATFORM_18');
      expect(holdState.stationCode).toBe('CSMT');
      expect(holdState.heldPlatformId).toBe('PLATFORM_18');
      expect(holdState.gatewayOccupancyIndex).toBeGreaterThan(0);
      expect(holdState.gatewayCrowdCount).toBeGreaterThan(0);
      expect(typeof holdState.remainingHoldSeconds).toBe('number');
      expect(typeof holdState.isMlExtensionActive).toBe('boolean');
    });

    it('successfully executes Station Master RELEASE and EXTEND_3M overrides', async () => {
      // Test EXTEND_3M
      const extendedState = await overridePlatformHold('PLATFORM_18', 'EXTEND_3M');
      expect(extendedState.remainingHoldSeconds).toBeGreaterThanOrEqual(180);
      expect(extendedState.isMlExtensionActive).toBe(true);

      // Test RELEASE
      const releasedState = await overridePlatformHold('PLATFORM_18', 'RELEASE');
      expect(releasedState.remainingHoldSeconds).toBe(0);
    });
  });

  describe('6. Explainable Decision Audit Trail Engine', () => {
    it('retrieves 4-step explainable audit decision log from audit engine', async () => {
      const auditLog = await fetchAuditLog('INC-2026-0821-001', 'ADVISORY');
      expect(auditLog).toBeDefined();
      expect(auditLog.incidentId).toBeDefined();
      expect(Array.isArray(auditLog.steps)).toBe(true);
      expect(auditLog.steps.length).toBe(4);

      // Verify 4-step sequence
      expect(auditLog.steps[0].stepNumber).toBe(1);
      expect(auditLog.steps[1].stepNumber).toBe(2);
      expect(auditLog.steps[2].stepNumber).toBe(3);
      expect(auditLog.steps[3].stepNumber).toBe(4);
    });
  });
});
