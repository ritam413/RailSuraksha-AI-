// tests/ChartsSuite.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DecelerationCurve } from '@/components/Charts/DecelerationCurve';
import { TriageDonut, DEPARTMENT_THEMES } from '@/components/Charts/TriageDonut';
import { MOCK_DEMANDS } from '@/lib/mockData';
import { MaintenanceDemand } from '@/types/apiContracts';

describe('TICKET-DEV2-03: Recharts Analytics Suite', () => {
  describe('DecelerationCurve Component', () => {
    it('renders RDSO Kavach title and standard specification badge', () => {
      const html = renderToStaticMarkup(
        <DecelerationCurve
          initialSpeedKmh={110}
          obstacleDistanceMeters={450}
          initialWeather="DRY"
        />
      );

      expect(html).toContain('RDSO Kavach Kinematic Deceleration &amp; EBD Curve');
      expect(html).toContain('RDSO/SPN/196/2020');
      expect(html).toContain('Calculated D_stop');
    });

    it('renders speed presets and weather friction selection buttons', () => {
      const html = renderToStaticMarkup(
        <DecelerationCurve
          initialSpeedKmh={110}
          obstacleDistanceMeters={450}
        />
      );

      expect(html).toContain('75k');
      expect(html).toContain('90k');
      expect(html).toContain('110k');
      expect(html).toContain('130k');
      expect(html).toContain('160k');
      expect(html).toContain('Dry (0.134)');
      expect(html).toContain('Monsoon (0.095)');
      expect(html).toContain('Fog (0.115)');
      expect(html).toContain('Night (0.130)');
    });

    it('renders fail-safe margin secured badge when stopping distance is less than obstacle', () => {
      const html = renderToStaticMarkup(
        <DecelerationCurve
          initialSpeedKmh={90}
          obstacleDistanceMeters={600}
          initialWeather="DRY"
        />
      );

      expect(html).toContain('FAIL-SAFE MARGIN SECURED');
      expect(html).toContain('SAFE STOPPING GAP');
    });

    it('displays collision hazard warning when obstacle distance is shorter than stopping distance', () => {
      const html = renderToStaticMarkup(
        <DecelerationCurve
          initialSpeedKmh={160}
          obstacleDistanceMeters={250}
          initialWeather="WET_MONSOON"
        />
      );

      expect(html).toContain('CRITICAL COLLISION RISK');
      expect(html).toContain('COLLISION HAZARD');
      expect(html).toContain('ACTUATED');
    });

    it('renders deceleration physics stat telemetry cards', () => {
      const html = renderToStaticMarkup(
        <DecelerationCurve
          initialSpeedKmh={110}
          obstacleDistanceMeters={450}
          initialWeather="DRY"
        />
      );

      expect(html).toContain('Req. Deceleration');
      expect(html).toContain('Clearance Margin');
      expect(html).toContain('Kavach Solenoid');
      expect(html).toContain('Form T/409 Dispatched');
    });
  });

  describe('TriageDonut Component', () => {
    it('renders multi-department demand distribution with TMS, TDMS, and SMMS categories', () => {
      const html = renderToStaticMarkup(
        <TriageDonut
          demands={MOCK_DEMANDS}
        />
      );

      expect(html).toContain('Multi-Department Demand Triage Distribution');
      expect(html).toContain('TMS Civil Track');
      expect(html).toContain('TDMS OHE Traction');
      expect(html).toContain('SMMS Signaling &amp; Telecom');
      expect(html).toContain('TMS · TDMS · SMMS');
    });

    it('calculates total demands count and shadow bundled percentage accurately', () => {
      const html = renderToStaticMarkup(
        <TriageDonut
          demands={MOCK_DEMANDS}
        />
      );

      expect(html).toContain('SHADOW BUNDLED');
      expect(html).toContain('Demands');
      expect(html).toContain('Critical P1 Requisitions');
      expect(html).toContain('85 mins (38.4%)');
      expect(html).toContain('01:30 - 04:45 IST');
    });

    it('renders department items with P1 tags and duration metrics', () => {
      const html = renderToStaticMarkup(
        <TriageDonut
          demands={MOCK_DEMANDS}
        />
      );

      expect(html).toContain('P1');
      expect(html).toContain('Req. Duration:');
      expect(html).toContain('Power Block:');
    });

    it('correctly handles filtered or custom demand datasets', () => {
      const customDemands: MaintenanceDemand[] = [
        {
          demandId: 'DEM-CUSTOM-01',
          department: 'TMS_CIVIL',
          trackLine: 'UP_FAST',
          trackCircuitId: 'TC-03',
          stationSection: 'CSMT-Dadar',
          chainageKm: 9.1,
          urgencyTier: 'P1_CRITICAL',
          urgencyScore: 0.95,
          durationMinutes: 90,
          requiresPowerBlock: false,
          deadheadTransitMinutes: 10,
          status: 'PENDING_TRIAGE',
          rawTicketId: 'TKT-001',
          defectDescription: 'Emergency Thermit Weld Repair'
        },
        {
          demandId: 'DEM-CUSTOM-02',
          department: 'TDMS_ELECTRICAL',
          trackLine: 'DOWN_FAST',
          trackCircuitId: 'TC-04',
          stationSection: 'Kurla-Thane',
          chainageKm: 15.2,
          urgencyTier: 'P2_SCHEDULED',
          urgencyScore: 0.70,
          durationMinutes: 120,
          requiresPowerBlock: true,
          deadheadTransitMinutes: 15,
          status: 'PENDING_TRIAGE',
          rawTicketId: 'TKT-002',
          defectDescription: '25kV Catenary Isolator Inspection'
        }
      ];

      const html = renderToStaticMarkup(
        <TriageDonut
          demands={customDemands}
          selectedDepartment="TMS_CIVIL"
        />
      );

      expect(html).toContain('TMS Civil Track');
      expect(html).toContain('TDMS OHE Traction');
      expect(html).toContain('1 P1');
    });
  });
});
