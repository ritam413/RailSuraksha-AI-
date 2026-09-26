import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  fetchWithTimeout,
  fetchCorridorSchedule,
  fetchMaintenanceDemands,
  fetchCorridorKpis,
  fetchInterlockingCircuits,
  sanctionBlockRequest,
  checkBackendHealth,
  fetchInterlockingState,
  calculateEbd,
  fetchPlatformHoldState,
  overridePlatformHold,
  fetchAuditLog
} from '../src/lib/apiClient';
import {
  MOCK_JOINT_BLOCKS,
  MOCK_DEMANDS,
  MOCK_CORRIDOR_KPIS,
  MOCK_CIRCUITS,
  MOCK_DECISION_DOSSIER,
  MOCK_INTERLOCKING_STATE,
  MOCK_PLATFORM_HOLD_STATE
} from '../src/lib/mockData';

describe('Dual-Mode API Client & Offline Fallback Architecture', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('fetchWithTimeout core helper', () => {
    it('returns remote data when server responds within timeout', async () => {
      const mockPayload = [{ id: 'TEST-123' }];
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockPayload
      } as Response);

      const result = await fetchWithTimeout('http://localhost:8000/api/v1/test', { fallback: true }, 1500);
      expect(result).toEqual(mockPayload);
    });

    it('returns deep-cloned fallback data when server returns HTTP error status', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500
      } as Response);

      const fallback = [{ id: 'FALLBACK' }];
      const result = await fetchWithTimeout('http://localhost:8000/api/v1/test', fallback, 1500);
      expect(result).toEqual(fallback);
      expect(result).not.toBe(fallback); // Guaranteed immutable clone
    });

    it('returns fallback data when network throws or times out', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const fallback = { status: 'offline' };
      const result = await fetchWithTimeout('http://localhost:8000/api/v1/test', fallback, 100);
      expect(result).toEqual(fallback);
    });
  });

  describe('Auto-BDMS SIH 26027 Endpoints', () => {
    it('fetchCorridorSchedule falls back to MOCK_JOINT_BLOCKS on failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Backend offline'));
      const data = await fetchCorridorSchedule('CR-BB-01');
      expect(data).toHaveLength(MOCK_JOINT_BLOCKS.length);
      expect(data[0].blockId).toBe(MOCK_JOINT_BLOCKS[0].blockId);
    });

    it('fetchMaintenanceDemands falls back to MOCK_DEMANDS on failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Backend offline'));
      const data = await fetchMaintenanceDemands('ALL');
      expect(data).toHaveLength(MOCK_DEMANDS.length);
      expect(data[0].demandId).toBe(MOCK_DEMANDS[0].demandId);
    });

    it('fetchCorridorKpis falls back to MOCK_CORRIDOR_KPIS on failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Backend offline'));
      const data = await fetchCorridorKpis();
      expect(data.activeBlocksCount).toBe(MOCK_CORRIDOR_KPIS.activeBlocksCount);
      expect(data.corridorDowntimeSavedPct).toBe(MOCK_CORRIDOR_KPIS.corridorDowntimeSavedPct);
    });

    it('fetchInterlockingCircuits falls back to MOCK_CIRCUITS on failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Backend offline'));
      const data = await fetchInterlockingCircuits();
      expect(data).toHaveLength(MOCK_CIRCUITS.length);
      expect(data[0].circuitId).toBe(MOCK_CIRCUITS[0].circuitId);
    });

    it('sanctionBlockRequest falls back to MOCK_DECISION_DOSSIER gracefully on failure', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Connection refused'));
      const data = await sanctionBlockRequest('BLK-CR-01', 'CTRL-402');
      expect(data.dossierId).toBe(MOCK_DECISION_DOSSIER.dossierId);
      expect(data.sanctionedBy).toBe(MOCK_DECISION_DOSSIER.sanctionedBy);
    });

    it('sanctionBlockRequest returns backend response on success', async () => {
      const mockDossier = { ...MOCK_DECISION_DOSSIER, dossierId: 'DOSSIER-LIVE-999' };
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockDossier
      } as Response);

      const data = await sanctionBlockRequest('BLK-CR-01', 'CTRL-402');
      expect(data.dossierId).toBe('DOSSIER-LIVE-999');
    });
  });

  describe('Backward Compatibility for Tactical Endpoints', () => {
    it('preserves checkBackendHealth function', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Offline'));
      const status = await checkBackendHealth();
      expect(status.online).toBe(false);
    });

    it('preserves fetchInterlockingState topology data on fallback', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Offline'));
      const state = await fetchInterlockingState();
      expect(state.circuits).toBeDefined();
      expect(state.circuits.length).toBe(MOCK_INTERLOCKING_STATE.circuits.length);
    });

    it('preserves fetchPlatformHoldState on fallback', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Offline'));
      const hold = await fetchPlatformHoldState('PLATFORM_18');
      expect(hold.heldPlatformId).toBe('PLATFORM_18');
    });

    it('preserves overridePlatformHold on fallback', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Offline'));
      const released = await overridePlatformHold('PLATFORM_18', 'RELEASE');
      expect(released.remainingHoldSeconds).toBe(0);
      expect(released.status).toBe('RELEASED');
    });
  });
});
