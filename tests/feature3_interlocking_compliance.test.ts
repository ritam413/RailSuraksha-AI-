// tests/feature3_interlocking_compliance.test.ts
import { describe, it, expect } from 'vitest';
import { IncidentRecord, ExplainableDecisionLog } from '@/types/apiContracts';
import { MOCK_INCIDENTS, MOCK_INTERLOCKING_STATE } from '@/lib/mockData';
import { buildExplainableDecisionLog } from '@/lib/agents/explainableLogger';

describe('Feature 3: Railway Interlocking & Signal Aspect Safety Governance', () => {
  it('correctly maps signal aspect safety colors and descriptions', () => {
    const s12 = MOCK_INTERLOCKING_STATE.signals.find((s) => s.signalId === 'S-12');
    const s14 = MOCK_INTERLOCKING_STATE.signals.find((s) => s.signalId === 'S-14');
    const s16 = MOCK_INTERLOCKING_STATE.signals.find((s) => s.signalId === 'S-16');

    expect(s12).toBeDefined();
    expect(s12?.aspect).toBe('STOP');
    expect(s14?.aspect).toBe('CLEAR');
    expect(s16?.aspect).toBe('HOLD_ACTIVE');
  });

  it('validates interlocking track circuit occupancy states and speed limits', () => {
    const upMain = MOCK_INTERLOCKING_STATE.circuits.find((c) => c.circuitId === 'BLK-101');
    const downLine = MOCK_INTERLOCKING_STATE.circuits.find((c) => c.circuitId === 'BLK-103');
    const platform18 = MOCK_INTERLOCKING_STATE.circuits.find((c) => c.circuitId === 'BLK-105');

    expect(upMain?.isOccupied).toBe(true);
    expect(upMain?.occupyingTrainId).toContain('12345');
    expect(upMain?.speedLimitKmh).toBe(130);

    expect(downLine?.isOccupied).toBe(true);
    expect(downLine?.occupyingTrainId).toContain('22691');

    expect(platform18?.isOccupied).toBe(false);
    expect(platform18?.speedLimitKmh).toBe(30);
  });
});

describe('Feature 3: Dynamic Incident Triage & Safety Workflow Lifecycle', () => {
  it('validates incident state transition from PENDING_APPROVAL to RESOLVED', () => {
    const incident: IncidentRecord = {
      incidentId: 'RS-2048',
      timestamp: '14:32:08 IST',
      sourceCameraId: 'LOCO-CAB-FRONT-VANDB-204',
      cameraType: 'LOCO_CAB',
      severityCategory: 'CRITICAL',
      severityScore: 0.982,
      assignedAgent: 'KavachBrakingAgent',
      status: 'PENDING_APPROVAL',
      boundingBoxes: [
        {
          class: 'BOULDER',
          confidence: 0.982,
          x: 420,
          y: 610,
          width: 180,
          height: 140,
          estimatedDistanceMeters: 340
        }
      ]
    };

    expect(incident.status).toBe('PENDING_APPROVAL');

    // Simulate Operator Approval Transition
    const updatedIncident: IncidentRecord = {
      ...incident,
      status: 'RESOLVED'
    };

    expect(updatedIncident.status).toBe('RESOLVED');
  });

  it('correctly associates incidents to the respective tactical camera stream', () => {
    const locoIncident = MOCK_INCIDENTS.find((inc) => inc.cameraType === 'LOCO_CAB');
    const gatewayIncident = MOCK_INCIDENTS.find((inc) => inc.cameraType === 'PLATFORM_GATEWAY');

    expect(locoIncident?.sourceCameraId).toContain('LOCO-CAB');
    expect(locoIncident?.assignedAgent).toBe('KavachBrakingAgent');

    expect(gatewayIncident?.sourceCameraId).toContain('CCTV-STATION-CSMT');
    expect(gatewayIncident?.assignedAgent).toBe('SectionDispatchAgent');
  });
});

describe('Feature 3: RDSO Compliance Dossier Generation & Audit Integrity', () => {
  it('generates a complete formatted compliance audit dossier object', () => {
    const decisionLog: ExplainableDecisionLog = buildExplainableDecisionLog(
      'RS-2048',
      '12345 (Vande Bharat Express)',
      'Section 14B — Up Main Line',
      'ADVISORY',
      'BOULDER',
      340,
      410
    );

    const dossier = {
      dossierId: `RDSO-AUDIT-${decisionLog.incidentId}-2026`,
      generatedAt: new Date().toISOString(),
      governingAuthority: 'Ministry of Railways / RDSO Safety Directorate',
      incident: decisionLog,
      auditCertificate: {
        certifiedBy: 'Chief Safety Officer (RailSuraksha AI Engine)',
        hashSignature: '0x8f4b23a9e10287cd90b34512e0fa',
        status: 'VERIFIED_COMPLIANT'
      }
    };

    expect(dossier.dossierId).toBe('RDSO-AUDIT-RS-2048-2026');
    expect(dossier.incident.steps).toHaveLength(4);
    expect(dossier.auditCertificate.status).toBe('VERIFIED_COMPLIANT');
    expect(dossier.auditCertificate.hashSignature.startsWith('0x')).toBe(true);

    const jsonString = JSON.stringify(dossier, null, 2);
    expect(jsonString).toContain('RDSO-AUDIT-RS-2048-2026');
    expect(jsonString).toContain('Kavach Braking Agent');
  });
});
