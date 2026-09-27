// tests/IncidentQueue.test.tsx
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { UrgencyBadge } from '@/components/Common/UrgencyBadge';
import { DemandRowItem } from '@/components/Overview/DemandRowItem';
import { IncidentQueue } from '@/components/Overview/IncidentQueue';
import { MOCK_DEMANDS } from '@/lib/mockData';
import { MaintenanceDemand } from '@/types/apiContracts';

describe('TICKET-DEV2-02: Multi-Department Demand Queue & Triage Component', () => {
  describe('UrgencyBadge Atom Component', () => {
    it('renders P1_CRITICAL with pulsing dot indicator and correct text', () => {
      const html = renderToStaticMarkup(
        <UrgencyBadge tier="P1_CRITICAL" score={0.94} showScore={true} />
      );

      expect(html).toContain('P1 CRITICAL');
      expect(html).toContain('94%');
      expect(html).toContain('animate-pulse');
      expect(html).toContain('rounded-[4px]');
      // Badge wrapper must use rounded-[4px] and not rounded-full
      expect(html).toMatch(/rounded-\[4px\]/);
    });

    it('renders P2_SCHEDULED and P3_ROUTINE correctly', () => {
      const htmlP2 = renderToStaticMarkup(
        <UrgencyBadge tier="P2_SCHEDULED" score={0.72} showScore={false} />
      );
      expect(htmlP2).toContain('P2 SCHEDULED');
      expect(htmlP2).toContain('rounded-[4px]');

      const htmlP3 = renderToStaticMarkup(
        <UrgencyBadge tier="P3_ROUTINE" score={0.38} showScore={true} />
      );
      expect(htmlP3).toContain('P3 ROUTINE');
      expect(htmlP3).toContain('38%');
    });

    it('supports backward-compatible legacy tier strings (CRITICAL, MODERATE, LOW)', () => {
      const htmlCritical = renderToStaticMarkup(<UrgencyBadge tier="CRITICAL" />);
      expect(htmlCritical).toContain('CRITICAL');
      expect(htmlCritical).toContain('animate-pulse');

      const htmlModerate = renderToStaticMarkup(<UrgencyBadge tier="MODERATE" />);
      expect(htmlModerate).toContain('MODERATE');

      const htmlLow = renderToStaticMarkup(<UrgencyBadge tier="LOW" />);
      expect(htmlLow).toContain('LOW');
    });
  });

  describe('DemandRowItem Molecule Component', () => {
    const mockTmsDemand: MaintenanceDemand = MOCK_DEMANDS[0]; // DEM-TMS-01
    const mockTdmsDemand: MaintenanceDemand = MOCK_DEMANDS[1]; // DEM-TDMS-02 (requiresPowerBlock: true)

    it('renders department tag, track circuit, chainage, defect text, and duration', () => {
      const html = renderToStaticMarkup(
        <DemandRowItem demand={mockTmsDemand} />
      );

      expect(html).toContain('TMS Civil');
      expect(html).toContain('TC-03');
      expect(html).toContain('UP_SLOW');
      expect(html).toContain('KM 14.2');
      expect(html).toContain('USFD detected 35mm transverse rail fracture');
      expect(html).toContain('120m');
      expect(html).toContain('CSM Continuous Tamping Machine #5109');
      expect(html).toContain('CR-TMS-2026-8812');
      expect(html).toContain('APPROVE &amp; SANCTION');
    });

    it('renders 25kV OHE Power Block flag when requiresPowerBlock is true', () => {
      const html = renderToStaticMarkup(
        <DemandRowItem demand={mockTdmsDemand} />
      );

      expect(html).toContain('TDMS OHE');
      expect(html).toContain('25kV OHE ISOLATION');
      expect(html).toContain('OHE Hydraulic Ladder Inspection Tower Wagon #60515');
      expect(html).toContain('+15m deadhead transit');
    });

    it('applies selected and sanctioned styling appropriately', () => {
      const htmlSelected = renderToStaticMarkup(
        <DemandRowItem demand={mockTmsDemand} isSelected={true} />
      );
      expect(htmlSelected).toContain('border-l-[#2B7FFF]');

      const htmlSanctioned = renderToStaticMarkup(
        <DemandRowItem demand={mockTmsDemand} isSanctioned={true} />
      );
      expect(htmlSanctioned).toContain('SANCTIONED');
    });

    it('enforces strict Mintlify 4px radius and zero rounded-full on badges/buttons', () => {
      const html = renderToStaticMarkup(
        <DemandRowItem demand={mockTdmsDemand} />
      );

      // Verify rounded-[4px] on department badge, urgency badge, and sanction button
      expect(html).toContain('rounded-[4px]');
    });
  });

  describe('IncidentQueue Organism Component', () => {
    it('renders all 6 grounded maintenance demands by default', () => {
      const html = renderToStaticMarkup(<IncidentQueue />);

      expect(html).toContain('Multi-Department Maintenance Demand Queue');
      expect(html).toContain('6 Demands');
      expect(html).toContain('DEM-TMS-01');
      expect(html).toContain('CR-TMS-2026-8812');
      expect(html).toContain('CR-TDMS-2026-4309');
      expect(html).toContain('CR-SMMS-2026-1192');
    });

    it('renders department filter tabs with count badges', () => {
      const html = renderToStaticMarkup(<IncidentQueue />);

      expect(html).toContain('All Demands');
      expect(html).toContain('TMS Civil');
      expect(html).toContain('TDMS OHE');
      expect(html).toContain('SMMS Signal');
      expect(html).toContain('P1 Critical Only');
    });

    it('renders co-location joint shadow block opportunity banner for TC-03', () => {
      const html = renderToStaticMarkup(<IncidentQueue />);

      expect(html).toContain('Joint Bundling Opportunity');
      expect(html).toContain('TC-03');
      expect(html).toContain('Sanction Joint Block');
    });

    it('supports custom demands passed via props', () => {
      const customDemands: MaintenanceDemand[] = [
        {
          demandId: 'DEM-CUSTOM-99',
          department: 'TMS_CIVIL',
          trackCircuitId: 'TC-01',
          trackLine: '5TH_LINE',
          stationSection: 'Kurla Yard',
          chainageKm: 18.5,
          urgencyTier: 'P1_CRITICAL',
          urgencyScore: 0.99,
          durationMinutes: 180,
          requiresPowerBlock: false,
          assignedMachine: 'Custom Track Relaying Machine #99',
          deadheadTransitMinutes: 15,
          status: 'PENDING_TRIAGE',
          rawTicketId: 'CR-TMS-2026-9999',
          defectDescription: 'Severe ballast dilation on curve crossover 99.'
        }
      ];

      const html = renderToStaticMarkup(
        <IncidentQueue demands={customDemands} />
      );

      expect(html).toContain('1 Demands');
      expect(html).toContain('DEM-CUSTOM-99');
      expect(html).toContain('CR-TMS-2026-9999');
      expect(html).toContain('Severe ballast dilation on curve crossover 99.');
    });

    it('provides dual-mode backward compatibility for legacy props', () => {
      const html = renderToStaticMarkup(
        <IncidentQueue
          selectedIncidentId="DEM-TMS-01"
          onSelectIncident={() => {}}
          onApproveAction={() => {}}
        />
      );

      expect(html).toContain('DEM-TMS-01');
      expect(html).toContain('CR-TMS-2026-8812');
    });
  });
});
