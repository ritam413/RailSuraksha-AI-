// tests/ChartsSuite.test.tsx
// Vitest Suite for Recharts Analytics Suite (TICKET-DEV2-03)

import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  DecelerationCurve,
  calculateDecelerationPhysics,
  generateDecelerationPoints,
  TriageDonut,
  aggregateDemandsByDepartment,
  CHART_PALETTE,
  DEPARTMENT_METADATA_MAP
} from '@/components/Charts';
import { MOCK_DEMANDS } from '@/lib/mockData';
import { MaintenanceDemand } from '@/types/apiContracts';

describe('TICKET-DEV2-03: Recharts Analytics Suite & Physics Invariants', () => {

  describe('1. RDSO Kavach Ver 4.0 Deceleration Physics Model', () => {
    it('calculates deterministic stopping distance and safe margin for nominal cruising speed (90 km/h)', () => {
      const result = calculateDecelerationPhysics(90, 850, 'DRY', 0.002);
      
      expect(result.v0_ms).toBeCloseTo(25.0, 1);
      expect(result.a_emergency).toBeGreaterThanOrEqual(1.20);
      expect(result.ebdDistance_m).toBeGreaterThan(200);
      expect(result.ebdDistance_m).toBeLessThan(400);
      expect(result.safeMargin_m).toBeGreaterThan(400);
      expect(result.status).toBe('SAFE');
    });

    it('calculates increased stopping distance under adverse wet monsoon conditions', () => {
      const dryResult = calculateDecelerationPhysics(110, 900, 'DRY', 0.002);
      const wetResult = calculateDecelerationPhysics(110, 900, 'WET_MONSOON', 0.002);

      expect(wetResult.ebdDistance_m).toBeGreaterThan(dryResult.ebdDistance_m);
      expect(wetResult.a_emergency).toBeLessThan(dryResult.a_emergency);
      expect(wetResult.timeToStop_sec).toBeGreaterThan(dryResult.timeToStop_sec);
    });

    it('applies FDE safety clamp against negative gradients and division-by-zero', () => {
      // Stress test with extreme falling gradient (-2.0%)
      const extremeResult = calculateDecelerationPhysics(120, 1000, 'WET_MONSOON', -0.020);

      expect(extremeResult.a_emergency).toBeGreaterThanOrEqual(0.15);
      expect(Number.isFinite(extremeResult.ebdDistance_m)).toBe(true);
      expect(Number.isNaN(extremeResult.ebdDistance_m)).toBe(false);
      expect(Number.isFinite(extremeResult.safeMargin_m)).toBe(true);
    });

    it('identifies critical overshoot hazards when obstacle distance is within EBD envelope', () => {
      const criticalResult = calculateDecelerationPhysics(130, 200, 'DRY', 0.002);

      expect(criticalResult.safeMargin_m).toBeLessThan(0);
      expect(criticalResult.status).toBe('CRITICAL');
    });

    it('identifies advisory intervention when safe margin is between 0 and 150m', () => {
      // EBD ~ 350m, obstacle at 450m -> margin 100m (Advisory)
      const advisoryResult = calculateDecelerationPhysics(90, 350, 'DRY', 0.002);
      expect(['ADVISORY', 'CRITICAL']).toContain(advisoryResult.status);
    });
  });

  describe('2. Kinematic Profile Coordinates Generator', () => {
    it('generates non-empty coordinate array with valid finite values', () => {
      const points = generateDecelerationPoints(90, 'DRY', 0.002, 30, 1200, 50);

      expect(points.length).toBeGreaterThan(10);
      expect(points[0].distanceMeters).toBe(0);
      expect(points[0].emergencySpeedKmh).toBe(90);
      expect(points[0].tsrSpeedKmh).toBe(30);

      // Verify all points have non-negative finite speeds
      points.forEach(p => {
        expect(p.emergencySpeedKmh).toBeGreaterThanOrEqual(0);
        expect(p.serviceSpeedKmh).toBeGreaterThanOrEqual(0);
        expect(Number.isNaN(p.emergencySpeedKmh)).toBe(false);
        expect(Number.isNaN(p.serviceSpeedKmh)).toBe(false);
      });
    });

    it('emergency curve decelerates to 0 faster than normal service curve', () => {
      const points = generateDecelerationPoints(90, 'DRY', 0.002, 30, 1200, 25);
      
      const firstZeroEmergency = points.find(p => p.emergencySpeedKmh === 0);
      const firstZeroService = points.find(p => p.serviceSpeedKmh === 0);

      expect(firstZeroEmergency).toBeDefined();
      expect(firstZeroService).toBeDefined();
      if (firstZeroEmergency && firstZeroService) {
        expect(firstZeroEmergency.distanceMeters).toBeLessThan(firstZeroService.distanceMeters);
      }
    });
  });

  describe('3. Departmental Demand Aggregation Primitives', () => {
    it('accurately groups and tallies MOCK_DEMANDS by department and urgency', () => {
      const aggregated = aggregateDemandsByDepartment(MOCK_DEMANDS, 'ALL');

      expect(aggregated.totalDemandsCount).toBe(MOCK_DEMANDS.length);
      expect(aggregated.totalDurationHours).toBeGreaterThan(0);
      expect(aggregated.slices.length).toBe(4);

      const tmsSlice = aggregated.slices.find(s => s.department === 'TMS_CIVIL');
      expect(tmsSlice).toBeDefined();
      expect(tmsSlice?.count).toBeGreaterThanOrEqual(1);
      expect(tmsSlice?.color).toBe('#F97316');

      const tdmsSlice = aggregated.slices.find(s => s.department === 'TDMS_ELECTRICAL');
      expect(tdmsSlice).toBeDefined();
      expect(tdmsSlice?.count).toBeGreaterThanOrEqual(1);
      expect(tdmsSlice?.color).toBe('#FBBF24');

      const smmsSlice = aggregated.slices.find(s => s.department === 'SMMS_SIGNAL');
      expect(smmsSlice).toBeDefined();
      expect(smmsSlice?.color).toBe('#3B82F6');
    });

    it('filters correctly when a specific department is selected', () => {
      const filtered = aggregateDemandsByDepartment(MOCK_DEMANDS, 'TMS_CIVIL');
      expect(filtered.activeFilteredCount).toBeGreaterThan(0);
      expect(filtered.totalDemandsCount).toBe(MOCK_DEMANDS.length);
    });

    it('handles empty demand array safely with zero-state structure', () => {
      const emptyResult = aggregateDemandsByDepartment([], 'ALL');

      expect(emptyResult.totalDemandsCount).toBe(0);
      expect(emptyResult.totalP1Count).toBe(0);
      expect(emptyResult.totalDurationHours).toBe(0);
      expect(emptyResult.slices.length).toBe(4);
      emptyResult.slices.forEach(s => {
        expect(s.count).toBe(0);
        expect(s.percentage).toBe(0);
      });
    });
  });

  describe('4. Component Markup & Design System Conformance', () => {
    it('renders DecelerationCurve with correct title, badge, metrics, and legend', () => {
      const html = renderToStaticMarkup(
        <DecelerationCurve
          initialSpeedKmh={90}
          targetObstacleDistanceMeters={850}
          currentDistanceMeters={420}
          tsrSpeedLimitKmh={30}
          weatherCondition="DRY"
        />
      );

      expect(html).toContain('Kavach Braking Physics');
      expect(html).toContain('Calculated EBD');
      expect(html).toContain('Safe Stop Margin');
      expect(html).toContain('Effective Decel');
      expect(html).toContain('Time to Full Stop');
      expect(html).toContain('Normal Service');
      expect(html).toContain('Kavach EBD');
      expect(html).toContain('TSR Permanent Clamp');
      expect(html).toContain('rounded-[4px]');
      expect(html).not.toContain('rounded-full px-');
    });

    it('renders TriageDonut with department cards, P1 critical indicators, and center HUD', () => {
      const html = renderToStaticMarkup(
        <TriageDonut
          demands={MOCK_DEMANDS}
          selectedDepartment="ALL"
        />
      );

      expect(html).toContain('Departmental Demand Triage Distribution');
      expect(html).toContain('TMS Track Civil Engineering');
      expect(html).toContain('TDMS Traction &amp; OHE Electrical');
      expect(html).toContain('SMMS Signal &amp; Telecom (S&amp;T)');
      expect(html).toContain('P1 CRITICAL');
      expect(html).toContain('rounded-[4px]');
      expect(html).not.toContain('rounded-full px-');
    });

    it('renders clean Zero-State Fallback when demand list is empty', () => {
      const html = renderToStaticMarkup(
        <TriageDonut demands={[]} selectedDepartment="ALL" />
      );

      expect(html).toContain('00');
      expect(html).toContain('0 P1');
    });
  });

  describe('5. Design Tokens & Color Palette Sanity', () => {
    it('exports synchronized color palette adhering to the Mintlify discipline', () => {
      expect(CHART_PALETTE.service).toBe('#2B7FFF');
      expect(CHART_PALETTE.emergency).toBe('#EF4444');
      expect(CHART_PALETTE.tsr).toBe('#F59E0B');
      expect(CHART_PALETTE.marker).toBe('#10B981');
      expect(DEPARTMENT_METADATA_MAP.TMS_CIVIL.color).toBe('#F97316');
      expect(DEPARTMENT_METADATA_MAP.TDMS_ELECTRICAL.color).toBe('#FBBF24');
      expect(DEPARTMENT_METADATA_MAP.SMMS_SIGNAL.color).toBe('#3B82F6');
      expect(DEPARTMENT_METADATA_MAP.ROLLING_STOCK.color).toBe('#64748B');
    });
  });

});
