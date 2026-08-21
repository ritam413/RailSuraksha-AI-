// tests/advanced_features.test.ts
// Comprehensive Test Suite for Multi-Angle Feeds, Weather Physics, Audio Alerts & Auditor Dossiers

import { describe, it, expect } from 'vitest';
import { calculateKavachEbd, getWeatherFrictionParams } from '../src/lib/agents/kavachBrakingAgent';
import { isAudioMuted, toggleAudioMute, subscribeAudioMute } from '../src/lib/audioAlerts';
import { buildExplainableDecisionLog } from '../src/lib/agents/explainableLogger';
import { SCENARIOS } from '../src/components/LocoCameraFeed';

describe('Advanced Features: Weather Friction & Kavach EBD Dynamic Physics', () => {
  it('should return correct friction and reaction multipliers for all weather conditions', () => {
    const dry = getWeatherFrictionParams('DRY');
    expect(dry.frictionCoefficient).toBe(0.134);
    expect(dry.reactionTimeMultiplier).toBe(1.0);

    const monsoon = getWeatherFrictionParams('WET_MONSOON');
    expect(monsoon.frictionCoefficient).toBe(0.095);
    expect(monsoon.reactionTimeMultiplier).toBeGreaterThan(1.0);

    const fog = getWeatherFrictionParams('DENSE_FOG');
    expect(fog.frictionCoefficient).toBe(0.115);
    expect(fog.reactionTimeMultiplier).toBe(1.4);

    const night = getWeatherFrictionParams('NIGHT_IR');
    expect(night.frictionCoefficient).toBe(0.130);
  });

  it('should expand stopping distance under Wet Monsoon conditions compared to Dry', () => {
    const dryResult = calculateKavachEbd({
      trainId: '12345 (Vande Bharat)',
      velocityKmh: 110,
      obstacleDistanceMeters: 500,
      weatherCondition: 'DRY',
    });

    const monsoonResult = calculateKavachEbd({
      trainId: '12345 (Vande Bharat)',
      velocityKmh: 110,
      obstacleDistanceMeters: 500,
      weatherCondition: 'WET_MONSOON',
    });

    expect(monsoonResult.calculatedStoppingDistanceMeters).toBeGreaterThan(dryResult.calculatedStoppingDistanceMeters);
    expect(monsoonResult.marginDistanceMeters).toBeLessThan(dryResult.marginDistanceMeters);
  });

  it('should correctly flag collision risk when stopping distance exceeds obstacle distance', () => {
    const result = calculateKavachEbd({
      trainId: '12345 (Vande Bharat)',
      velocityKmh: 110,
      obstacleDistanceMeters: 340, // Boulder at 340m
      weatherCondition: 'DRY',
    });

    // 110 km/h on steel rail requires ~410m to stop
    expect(result.calculatedStoppingDistanceMeters).toBeGreaterThan(340);
    expect(result.isCollisionRisk).toBe(true);
    expect(result.brakeState).toBe('EMERGENCY_SOLENOID_ACTUATED');
  });
});

describe('Advanced Features: RDSO Web Audio Alert Synthesizer State', () => {
  it('should toggle mute state and notify subscribers', () => {
    const initialState = isAudioMuted();
    let notificationReceived = false;

    const unsubscribe = subscribeAudioMute((muted) => {
      notificationReceived = true;
      expect(muted).toBe(!initialState);
    });

    const newState = toggleAudioMute();
    expect(newState).toBe(!initialState);
    expect(notificationReceived).toBe(true);

    unsubscribe();

    // Toggle back
    toggleAudioMute(false);
    expect(isAudioMuted()).toBe(false);
  });
});

describe('Advanced Features: Multi-Incident Decision Log & Auditor Archive', () => {
  it('should generate compliant 4-step decision logs for different incident classes', () => {
    const boulderLog = buildExplainableDecisionLog(
      'RS-2048',
      '12345 (Vande Bharat)',
      'Section 14B Up Main Line',
      'ADVISORY',
      'BOULDER',
      340,
      410
    );

    expect(boulderLog.incidentId).toBe('RS-2048');
    expect(boulderLog.steps).toHaveLength(4);
    expect(boulderLog.steps[0].agentName).toBe('Vision Hazard Detector (YOLOv11)');
    expect(boulderLog.steps[1].agentName).toBe('Telemetry Aggregator');
    expect(boulderLog.steps[2].agentName).toBe('Kavach Braking Agent (RDSO Physics)');
    expect(boulderLog.steps[3].agentName).toBe('Dispatcher Review & Auto-Actuator');
    expect(boulderLog.steps[3].detailText).toContain('Advisory Mode');

    const autoLog = buildExplainableDecisionLog(
      'RS-2049',
      '12137 (Punjab Mail)',
      'CSMT Platform 17/18 Bottleneck',
      'AUTONOMOUS',
      'CROWD_SURGE',
      15,
      0
    );

    expect(autoLog.incidentId).toBe('RS-2049');
    expect(autoLog.deploymentMode).toBe('AUTONOMOUS');
    expect(autoLog.steps[3].detailText).toContain('Autonomous Mode');
  });

  it('should validate tactical scenarios data integrity', () => {
    expect(SCENARIOS.BOULDER_CRITICAL.hazardClass).toBe('BOULDER');
    expect(SCENARIOS.CATTLE_WARNING.hazardClass).toBe('CATTLE');
    expect(SCENARIOS.FRACTURE_CRITICAL.hazardClass).toBe('RAIL_FRACTURE');
  });
});
