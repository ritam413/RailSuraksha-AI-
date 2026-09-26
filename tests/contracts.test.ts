import { describe, it, expect } from 'vitest';
import {
  MOCK_POLICY_PROFILE,
  MOCK_DEMANDS,
  MOCK_JOINT_BLOCKS,
  MOCK_CORRIDOR_KPIS,
  MOCK_TRACK_CIRCUITS,
  MOCK_TRAIN_SCHEDULES,
  MOCK_DECISION_DOSSIERS,
  MOCK_INTERLOCKING_STATE,
  MOCK_INCIDENTS
} from '@/lib/mockData';
import type {
  DivisionalPolicyProfile,
  MaintenanceDemand,
  JointBlockSchedule,
  CorridorKpiMetrics,
  TrackCircuitState,
  TrainScheduleSlot,
  ExplainableDecisionDossier,
  TrackLineCode
} from '@/types/apiContracts';

describe('TICKET-DEV1-01: IRIS AI Core Data Contracts & Grounded Mock Data', () => {
  describe('1. DivisionalPolicyProfile Contract Invariants', () => {
    it('should adhere to reference safety and earthing buffers', () => {
      const policy: DivisionalPolicyProfile = MOCK_POLICY_PROFILE;
      expect(policy.divisionId).toBe('BB-CR');
      expect(policy.divisionName).toBe('Mumbai Central Railway Division');
      expect(policy.safetyHeadwayBufferMinutes).toBe(15);
      expect(policy.oheEarthingBufferMinutes).toBe(10);
      expect(policy.oheRestorationBufferMinutes).toBe(10);
      expect(policy.defaultTsrSpeedKmh).toBe(30);
    });

    it('should have normalized urgency scoring weights summing to 1.0', () => {
      const policy = MOCK_POLICY_PROFILE;
      const sumWeights = policy.weightSafetyRisk + policy.weightDegradationRate + policy.weightTrafficDensity;
      expect(sumWeights).toBeCloseTo(1.0, 5);
      expect(policy.weightSafetyRisk).toBe(0.40);
      expect(policy.weightDegradationRate).toBe(0.35);
      expect(policy.weightTrafficDensity).toBe(0.25);
    });
  });

  describe('2. MaintenanceDemand Multi-Department & Line Ingestion', () => {
    it('should contain demands from all three CRIS engineering departments', () => {
      const departments = new Set(MOCK_DEMANDS.map((d: MaintenanceDemand) => d.department));
      expect(departments.has('TMS_CIVIL')).toBe(true);
      expect(departments.has('TDMS_ELECTRICAL')).toBe(true);
      expect(departments.has('SMMS_SIGNAL')).toBe(true);
      expect(MOCK_DEMANDS.length).toBeGreaterThanOrEqual(6);
    });

    it('should assign valid track circuit IDs and line codes', () => {
      const validCircuits = new Set(['TC-01', 'TC-02', 'TC-03', 'TC-04', 'TC-05', 'TC-06']);
      const validLines: TrackLineCode[] = ['UP_SLOW', 'DOWN_SLOW', 'UP_FAST', 'DOWN_FAST', '5TH_LINE', '6TH_LINE'];
      
      MOCK_DEMANDS.forEach((demand: MaintenanceDemand) => {
        expect(validCircuits.has(demand.trackCircuitId)).toBe(true);
        expect(validLines).toContain(demand.trackLine);
        expect(demand.urgencyScore).toBeGreaterThanOrEqual(0);
        expect(demand.urgencyScore).toBeLessThanOrEqual(1.0);
        expect(demand.durationMinutes).toBeGreaterThan(0);
      });
    });

    it('should properly flag power block requirement for TDMS Electrical demands', () => {
      const tdmsDemands = MOCK_DEMANDS.filter((d: MaintenanceDemand) => d.department === 'TDMS_ELECTRICAL');
      expect(tdmsDemands.length).toBeGreaterThan(0);
      tdmsDemands.forEach((d: MaintenanceDemand) => {
        expect(d.requiresPowerBlock).toBe(true);
      });
    });
  });

  describe('3. JointBlockSchedule Zero Delay & Rollover Invariants', () => {
    it('should enforce zero passenger delays and high downtime recovery', () => {
      expect(MOCK_JOINT_BLOCKS.length).toBeGreaterThan(0);
      const primaryBlock: JointBlockSchedule = MOCK_JOINT_BLOCKS[0];
      
      expect(primaryBlock.blockId).toBe('JB-2026-0926-01');
      expect(primaryBlock.trackLine).toBe('UP_SLOW');
      expect(primaryBlock.passengerDelaysMinutes).toBe(0);
      expect(primaryBlock.downtimeSavedMinutes).toBe(85);
      expect(primaryBlock.corridorDowntimeSavedPct).toBe(38.4);
      expect(primaryBlock.durationMinutes).toBe(195);
      expect(primaryBlock.startTimeMinutes).toBe(90);  // 01:30 IST
      expect(primaryBlock.endTimeMinutes).toBe(285);   // 04:45 IST
      expect(primaryBlock.kavachTsrSpeedKmh).toBe(30);
      expect(primaryBlock.bundledDemandIds.length).toBeGreaterThanOrEqual(2);
    });

    it('should accurately calculate duration without negative rollover errors', () => {
      MOCK_JOINT_BLOCKS.forEach((block: JointBlockSchedule) => {
        expect(block.durationMinutes).toBeGreaterThan(0);
        const expectedDuration = block.endTimeMinutes >= block.startTimeMinutes
          ? block.endTimeMinutes - block.startTimeMinutes
          : (block.endTimeMinutes - block.startTimeMinutes + 1440);
        expect(block.durationMinutes).toBe(expectedDuration);
      });
    });
  });

  describe('4. CorridorKpiMetrics Operational Health', () => {
    it('should export realistic grounded Central Railway corridor metrics', () => {
      const kpi: CorridorKpiMetrics = MOCK_CORRIDOR_KPIS;
      expect(kpi.corridorDowntimeSavedPct).toBe(38.4);
      expect(kpi.assetAvailabilityIndexPct).toBe(96.2);
      expect(kpi.whiteCorridorHeadwayMinutes).toBe(195);
      expect(kpi.activeBlocksCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('5. TrackCircuitState and Interlocking Schematic', () => {
    it('should map all 6 CSMT-Kalyan section circuits continuously with trackLine attributes', () => {
      expect(MOCK_TRACK_CIRCUITS.length).toBe(6);
      expect(MOCK_TRACK_CIRCUITS[0].circuitId).toBe('TC-01');
      expect(MOCK_TRACK_CIRCUITS[5].circuitId).toBe('TC-06');
      
      // Verify contiguous kilometer chainage and line codes
      for (let i = 0; i < MOCK_TRACK_CIRCUITS.length - 1; i++) {
        expect(MOCK_TRACK_CIRCUITS[i].kmEnd).toBe(MOCK_TRACK_CIRCUITS[i + 1].kmStart);
        expect(MOCK_TRACK_CIRCUITS[i].trackLine).toBeDefined();
      }
    });
  });

  describe('6. TrainScheduleSlot Timetable Trajectories', () => {
    it('should contain nocturnal and daytime passenger and freight paths', () => {
      expect(MOCK_TRAIN_SCHEDULES.length).toBeGreaterThanOrEqual(4);
      const vb = MOCK_TRAIN_SCHEDULES.find((t: TrainScheduleSlot) => t.trainNumber === '12345');
      expect(vb).toBeDefined();
      expect(vb?.trainName).toContain('Vande Bharat');
      expect(vb?.trajectoryPoints.length).toBeGreaterThan(1);
    });
  });

  describe('7. ExplainableDecisionDossier Deterministic Cryptographic Seal', () => {
    it('should contain a valid 4-step chronological audit timeline and sorted SHA-256 seal', () => {
      expect(MOCK_DECISION_DOSSIERS.length).toBeGreaterThan(0);
      const dossier: ExplainableDecisionDossier = MOCK_DECISION_DOSSIERS[0];
      
      expect(dossier.chronologicalTimeline.length).toBe(4);
      expect(dossier.chronologicalTimeline[0].stepNumber).toBe(1);
      expect(dossier.chronologicalTimeline[3].stepNumber).toBe(4);
      expect(dossier.sha256Signature).toMatch(/^[a-f0-9]{64}$/i);
      expect(dossier.canonicalPayloadString).toContain('DEM-SMMS-03,DEM-TDMS-02,DEM-TMS-01'); // Alphabetically sorted
      expect(dossier.statutoryForms.rdsoForm14BCertificateHash).toBeDefined();
      expect(dossier.verificationStatus).toBe('VERIFIED_TAMPER_FREE');
    });
  });

  describe('8. Backward Compatibility with Existing UI Subsystems', () => {
    it('should preserve legacy mock datasets for existing views', () => {
      expect(MOCK_INTERLOCKING_STATE).toBeDefined();
      expect(MOCK_INTERLOCKING_STATE.circuits.length).toBeGreaterThan(0);
      expect(MOCK_INCIDENTS).toBeDefined();
      expect(MOCK_INCIDENTS.length).toBeGreaterThan(0);
    });
  });
});
