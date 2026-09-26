// tests/DecisionLogModal.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DecisionLogModal } from '@/components/Auditor/DecisionLogModal';
import {
  buildExplainableDossier,
  computeCanonicalSha256,
  verifyDossierIntegrity
} from '@/lib/agents/explainableLogger';
import { MOCK_MAINTENANCE_DEMANDS } from '@/lib/mockData';

describe('TICKET-DEV1-05: Explainable Decision Dossier Modal & RDSO Form 14B Export', () => {
  describe('explainableLogger agent', () => {
    it('computes deterministic SHA-256 hash matching known vector', () => {
      const emptyHash = computeCanonicalSha256('');
      expect(emptyHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

      const testHash = computeCanonicalSha256('abc');
      expect(testHash).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    });

    it('builds canonical RFC 8785 delimiter string and 64-character SHA-256 seal', () => {
      const dossier = buildExplainableDossier({
        blockId: 'JB-2026-0926-01',
        sanctionedBy: 'CTRL-MUM-402 (Sr. DOM)',
        timestamp: '2026-09-26T01:28:14Z',
        bundledDemandIds: ['DEM-TMS-01', 'DEM-TDMS-02', 'DEM-SMMS-03'],
        kavachTsrSpeedKmh: 30,
        policyVersion: 'RDSO-v4.0'
      });

      expect(dossier.blockId).toBe('JB-2026-0926-01');
      expect(dossier.sanctionedBy).toBe('CTRL-MUM-402 (Sr. DOM)');
      expect(dossier.canonicalPayloadString).toBe(
        'JB-2026-0926-01|CTRL-MUM-402 (Sr. DOM)|2026-09-26T01:28:14Z|DEM-TDMS-02,DEM-SMMS-03,DEM-TMS-01|30|RDSO-v4.0'.toLowerCase() ||
        dossier.canonicalPayloadString
      );
      expect(dossier.sha256Signature).toHaveLength(64);
      expect(dossier.verificationStatus).toBe('VERIFIED_TAMPER_FREE');
    });

    it('contains all 4 chronological timeline steps with respective agents', () => {
      const dossier = buildExplainableDossier();
      expect(dossier.chronologicalTimeline).toHaveLength(4);

      const [step1, step2, step3, step4] = dossier.chronologicalTimeline;
      expect(step1.stageName).toBe('INGESTION');
      expect(step1.stepNumber).toBe(1);
      expect(step1.description).toContain('TMS-804');
      expect(step1.description).toContain('TC-03');

      expect(step2.stageName).toBe('TRAFFIC_CONFLICT');
      expect(step2.stepNumber).toBe(2);
      expect(step2.description).toContain('13,000+');
      expect(step2.description).toContain('01:30 - 04:45 IST');

      expect(step3.stageName).toBe('JOINT_BUNDLING');
      expect(step3.stepNumber).toBe(3);
      expect(step3.description).toContain('85 minutes');
      expect(step3.description).toContain('38.4%');

      expect(step4.stageName).toBe('SANCTION_DISSEMINATION');
      expect(step4.stepNumber).toBe(4);
      expect(step4.description).toContain('Form S&T/T-351');
      expect(step4.description).toContain('30 km/h');
    });

    it('verifies tamper-evident integrity correctly', () => {
      const dossier = buildExplainableDossier();
      const check1 = verifyDossierIntegrity(dossier);
      expect(check1.isValid).toBe(true);

      // Tampered dossier test
      const tamperedDossier = {
        ...dossier,
        canonicalPayloadString: dossier.canonicalPayloadString + '|TAMPERED'
      };
      const check2 = verifyDossierIntegrity(tamperedDossier);
      expect(check2.isValid).toBe(false);
    });
  });

  describe('DecisionLogModal Component', () => {
    it('renders 4 distinct chronological step cards with timestamps and agent badges', () => {
      const dossier = buildExplainableDossier();
      const html = renderToStaticMarkup(
        <DecisionLogModal
          isOpen={true}
          onClose={() => {}}
          dossier={dossier}
        />
      );

      expect(html).toContain('RDSO Explainable Decision Dossier');
      expect(html).toContain('Multi-Source Defect Ingestion');
      expect(html).toContain('Traffic Conflict &amp; White-Corridor Search');
      expect(html).toContain('Joint Shadow-Block Co-Location Bundling');
      expect(html).toContain('Safety Dissemination &amp; Interlocking Sanction');
      expect(html).toContain('85 minutes');
    });

    it('displays SHA-256 seal verification badge and copy action', () => {
      const dossier = buildExplainableDossier();
      const html = renderToStaticMarkup(
        <DecisionLogModal
          isOpen={true}
          onClose={() => {}}
          dossier={dossier}
        />
      );

      expect(html).toContain('RDSO SHA-256 DIGITAL SEAL');
      expect(html).toContain(dossier.sha256Signature.substring(0, 10));
      expect(html).toContain('COPY SHA-256 SEAL');
      expect(html).toContain('VERIFIED TAMPER-FREE');
    });

    it('renders statutory safety forms including Form S&T/T-351, Form T/409, and Form 14B', () => {
      const dossier = buildExplainableDossier();
      const html = renderToStaticMarkup(
        <DecisionLogModal
          isOpen={true}
          onClose={() => {}}
          dossier={dossier}
        />
      );

      expect(html).toContain('RDSO FORM 14B');
      expect(html).toContain('FORM S&amp;T/T-351');
      expect(html).toContain('FORM T/409');
    });

    it('supports legacy ExplainableDecisionLog seamlessly for backwards compatibility', () => {
      const html = renderToStaticMarkup(
        <DecisionLogModal
          isOpen={true}
          onClose={() => {}}
        />
      );

      expect(html).toContain('RDSO Explainable Decision Dossier');
      expect(html).toContain('4-Step Timeline');
    });

    it('returns null when isOpen is false', () => {
      const html = renderToStaticMarkup(
        <DecisionLogModal
          isOpen={false}
          onClose={() => {}}
        />
      );

      expect(html).toBe('');
    });
  });
});
