// tests/railsuraksha.test.ts
import { describe, it, expect } from 'vitest';
import { calculateKavachEbd } from '@/lib/agents/kavachBrakingAgent';
import { classifyIncidentSeverity } from '@/lib/agents/triageAgent';
import { calculatePlatformHoldState } from '@/lib/agents/sectionDispatchAgent';
import { buildExplainableDecisionLog } from '@/lib/agents/explainableLogger';
import { SCENARIOS } from '@/components/LocoCameraFeed';
import { MOCK_INCIDENTS, MOCK_INTERLOCKING_STATE } from '@/lib/mockData';

describe('1. Kavach RDSO Emergency Braking Distance (EBD) Engine', () => {
  it('Scenario 1 (1.2m Boulder @ 340m, 110 km/h) -> flags collision deficit and emergency solenoid actuation', () => {
    const result = calculateKavachEbd({
      trainId: '12345 (Vande Bharat)',
      velocityKmh: 110,
      obstacleDistanceMeters: 340,
      frictionCoefficient: 0.134,
      gradientPercent: 0.002,
      reactionTimeSeconds: 1.96
    });

    expect(result.calculatedStoppingDistanceMeters).toBe(410);
    expect(result.marginDistanceMeters).toBe(-70);
    expect(result.isCollisionRisk).toBe(true);
    expect(result.brakeState).toBe('EMERGENCY_SOLENOID_ACTUATED');
    expect(result.requiredDecelerationMs2).toBeGreaterThan(1.0);
  });

  it('Scenario 2 (Stray Cattle @ 680m, 110 km/h) -> maintains safe margin (+270m) and clear brake state', () => {
    const result = calculateKavachEbd({
      trainId: '22691 (Rajdhani Exp)',
      velocityKmh: 110,
      obstacleDistanceMeters: 680,
      frictionCoefficient: 0.134,
      gradientPercent: 0.002,
      reactionTimeSeconds: 1.96
    });

    expect(result.calculatedStoppingDistanceMeters).toBe(410);
    expect(result.marginDistanceMeters).toBe(270);
    expect(result.isCollisionRisk).toBe(false);
    expect(result.brakeState).toBe('CLEAR');
  });

  it('Scenario 3 (Rail Fracture @ 210m, 90 km/h) -> calculates 283m stopping distance and actuates solenoid', () => {
    const result = calculateKavachEbd({
      trainId: '12137 (Punjab Mail)',
      velocityKmh: 90,
      obstacleDistanceMeters: 210,
      frictionCoefficient: 0.134,
      gradientPercent: 0.002,
      reactionTimeSeconds: 1.96
    });

    expect(result.calculatedStoppingDistanceMeters).toBe(283);
    expect(result.marginDistanceMeters).toBe(-73);
    expect(result.isCollisionRisk).toBe(true);
    expect(result.brakeState).toBe('EMERGENCY_SOLENOID_ACTUATED');
  });
});

describe('2. AI Triage Severity Classifier', () => {
  it('classifies high-confidence Boulder on track as CRITICAL severity', () => {
    const assessment = classifyIncidentSeverity('BOULDER', 0.982, 340);
    expect(assessment.severityCategory).toBe('CRITICAL');
    expect(assessment.severityScore).toBeGreaterThanOrEqual(0.85);
  });

  it('classifies Crowd Surge bottleneck (75% conf) as MODERATE severity', () => {
    const assessment = classifyIncidentSeverity('CROWD_SURGE', 0.75, 15);
    expect(assessment.severityCategory).toBe('MODERATE');
  });

  it('classifies distant Cattle at lower confidence as LOW severity', () => {
    const assessment = classifyIncidentSeverity('CATTLE', 0.65, 680);
    expect(assessment.severityCategory).toBe('LOW');
  });
});

describe('3. Section Dispatch Platform Hold & Crowd Density Agent', () => {
  it('calculates critical platform density (482 PAX) and sets HOLD_ACTIVE state', () => {
    const holdState = calculatePlatformHoldState('CSMT', 'PLATFORM_18', 'PLATFORM_17', 482, 252);
    expect(holdState.gatewayOccupancyIndex).toBe(0.88);
    expect(holdState.isMlExtensionActive).toBe(true);
    expect(holdState.status).toBe('HOLD_ACTIVE');
    expect(holdState.remainingHoldSeconds).toBe(252);
  });

  it('transitions hold status to CLEARING when remaining seconds < 60s', () => {
    const holdState = calculatePlatformHoldState('CSMT', 'PLATFORM_18', 'PLATFORM_17', 200, 45);
    expect(holdState.status).toBe('CLEARING');
  });

  it('transitions hold status to RELEASED when countdown reaches 0s', () => {
    const holdState = calculatePlatformHoldState('CSMT', 'PLATFORM_18', 'PLATFORM_17', 100, 0);
    expect(holdState.status).toBe('RELEASED');
  });
});

describe('4. Explainable Decision Log Timeline Builder', () => {
  it('builds immutable 4-step decision log in Advisory deployment mode', () => {
    const log = buildExplainableDecisionLog(
      'RS-2048',
      '12345 (Vande Bharat Express)',
      'Section 14B — Up Main Line',
      'ADVISORY',
      'BOULDER',
      340,
      410
    );

    expect(log.incidentId).toBe('RS-2048');
    expect(log.deploymentMode).toBe('ADVISORY');
    expect(log.steps).toHaveLength(4);
    expect(log.steps[0].stepNumber).toBe(1);
    expect(log.steps[1].stepNumber).toBe(2);
    expect(log.steps[2].stepNumber).toBe(3);
    expect(log.steps[3].stepNumber).toBe(4);
    expect(log.steps[3].detailText).toContain('Advisory Mode');
  });

  it('builds immutable 4-step decision log in Autonomous deployment mode', () => {
    const log = buildExplainableDecisionLog(
      'RS-2048',
      '12345 (Vande Bharat Express)',
      'Section 14B — Up Main Line',
      'AUTONOMOUS',
      'BOULDER',
      340,
      410
    );

    expect(log.deploymentMode).toBe('AUTONOMOUS');
    expect(log.steps[3].detailText).toContain('Autonomous Mode');
  });
});

describe('5. Tactical Scenario & Interlocking Contracts', () => {
  it('verifies all 3 tactical scenarios have correct parameters and geometry', () => {
    expect(Object.keys(SCENARIOS)).toHaveLength(3);
    expect(SCENARIOS.BOULDER_CRITICAL.distanceMeters).toBe(340);
    expect(SCENARIOS.CATTLE_WARNING.distanceMeters).toBe(680);
    expect(SCENARIOS.FRACTURE_CRITICAL.distanceMeters).toBe(210);
  });

  it('verifies mock interlocking circuits and signals datasets', () => {
    expect(MOCK_INTERLOCKING_STATE.circuits.length).toBeGreaterThanOrEqual(5);
    expect(MOCK_INTERLOCKING_STATE.signals.length).toBeGreaterThanOrEqual(4);
    expect(MOCK_INCIDENTS.length).toBeGreaterThanOrEqual(3);
  });
});
