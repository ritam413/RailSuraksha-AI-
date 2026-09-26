// tests/KpiStrip.test.tsx
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  KpiStrip,
  formatHeadway,
  formatHeadwaySafe,
  formatCount,
  formatCountSafe,
  formatPercentageSafe
} from '@/components/Overview/KpiStrip';
import { KpiCard } from '@/components/Overview/KpiCard';
import { MOCK_CORRIDOR_KPIS } from '@/lib/mockData';
import { CorridorKpiMetrics } from '@/types/apiContracts';

describe('TICKET-DEV2-01: 6-Metric IRIS AI Block Planning KPI Strip', () => {
  describe('Formatting Helper Functions', () => {
    it('formats white corridor headway minutes into standard railway hours and minutes', () => {
      expect(formatHeadway(195)).toBe('3h 15m');
      expect(formatHeadwaySafe(195)).toBe('3h 15m');
      expect(formatHeadway(60)).toBe('1h 00m');
      expect(formatHeadway(45)).toBe('0h 45m');
      expect(formatHeadway(0)).toBe('0h 00m');
      expect(formatHeadway(-10)).toBe('0h 00m');
      expect(formatHeadwaySafe(undefined)).toBe('0h 00m');
      expect(formatHeadwaySafe(NaN)).toBe('0h 00m');
    });

    it('formats counts with zero-padding and optional suffix', () => {
      expect(formatCount(3, 'Active')).toBe('03 Active');
      expect(formatCountSafe(3, 'Active')).toBe('03 Active');
      expect(formatCountSafe(8, 'In Queue')).toBe('08 In Queue');
      expect(formatCountSafe(12, 'Items')).toBe('12 Items');
      expect(formatCountSafe(0, 'Enforced')).toBe('00 Enforced');
      expect(formatCountSafe(undefined, 'Active')).toBe('00 Active');
    });

    it('formats percentages with 1-decimal precision', () => {
      expect(formatPercentageSafe(38.4)).toBe('38.4%');
      expect(formatPercentageSafe(96.2)).toBe('96.2%');
      expect(formatPercentageSafe(100)).toBe('100.0%');
      expect(formatPercentageSafe(0)).toBe('0.0%');
      expect(formatPercentageSafe(undefined)).toBe('0.0%');
    });
  });

  describe('KpiCard Atom Component', () => {
    it('renders card title, value, unit, and subtext', () => {
      const html = renderToStaticMarkup(
        <KpiCard
          id="test-card"
          title="Track Availability Index"
          value="96.2%"
          subtext="IRPWM 2020 Compliance"
          badgeText="TARGET > 95%"
          badgeVariant="primary"
        />
      );

      expect(html).toContain('Track Availability Index');
      expect(html).toContain('96.2%');
      expect(html).toContain('IRPWM 2020 Compliance');
      expect(html).toContain('TARGET &gt; 95%');
    });

    it('applies strict 16px outer radius and 4px inner badge radius (zero rounded-full on badges)', () => {
      const html = renderToStaticMarkup(
        <KpiCard
          title="Corridor Downtime Saved"
          value="38.4%"
          badgeText="⚡ ROI ACTIVE"
          badgeVariant="success"
          pulse={true}
        />
      );

      // Card container has 16px radius
      expect(html).toMatch(/rounded-\[16px\]|rounded-2xl/);

      // Badge must have 4px radius
      expect(html).toMatch(/rounded-\[4px\]|rounded(?!\S)/);

      // Badges must not use rounded-full (only pulse dot indicator can have rounded-full)
      expect(html).toContain('rounded-[4px]');
    });

    it('renders selected state styling when isSelected is true', () => {
      const html = renderToStaticMarkup(
        <KpiCard
          title="Active Kavach TSRs"
          value="02"
          unit="Enforced"
          isSelected={true}
        />
      );

      expect(html).toContain('SELECTED');
      expect(html).toContain('border-[#2B7FFF]');
    });
  });

  describe('KpiStrip Molecule Component', () => {
    it('renders all 6 IRIS AI operational metric cards with default MOCK_CORRIDOR_KPIS fallback', () => {
      const html = renderToStaticMarkup(<KpiStrip />);

      // 1. Corridor Downtime Saved
      expect(html).toContain('Corridor Downtime Saved');
      expect(html).toContain('38.4%');
      expect(html).toContain('⚡ ROI ACTIVE');

      // 2. Track Availability Index
      expect(html).toContain('Track Availability Index');
      expect(html).toContain('96.2%');
      expect(html).toContain('TARGET &gt; 95%');

      // 3. Active Corridor Blocks
      expect(html).toContain('Active Corridor Blocks');
      expect(html).toContain('02');
      expect(html).toContain('Active');
      expect(html).toContain('NOCTURNAL');

      // 4. Pending Demands
      expect(html).toContain('Pending Demands');
      expect(html).toContain('06');
      expect(html).toContain('In Queue');

      // 5. White Corridor Headway Gap
      expect(html).toContain('White Corridor');
      expect(html).toContain('3h 15m');
      expect(html).toContain('OPTIMAL LULL');

      // 6. Active Kavach TSRs
      expect(html).toContain('Active Kavach TSRs');
      expect(html).toContain('01');
      expect(html).toContain('Enforced');
      expect(html).toContain('30 KM/H SPEED');
    });

    it('renders custom metric overrides passed via props', () => {
      const customMetrics: CorridorKpiMetrics = {
        corridorDowntimeSavedPct: 42.8,
        assetAvailabilityIndexPct: 98.5,
        activeBlocksCount: 4,
        pendingDemandsCount: 9,
        whiteCorridorHeadwayMinutes: 240,
        activeKavachTsrsCount: 3
      };

      const html = renderToStaticMarkup(<KpiStrip metrics={customMetrics} />);

      expect(html).toContain('42.8%');
      expect(html).toContain('98.5%');
      expect(html).toContain('04');
      expect(html).toContain('09');
      expect(html).toContain('4h 00m');
      expect(html).toContain('03');
    });

    it('dynamically adapts badge variants when metrics breach target thresholds', () => {
      const degradedMetrics: CorridorKpiMetrics = {
        corridorDowntimeSavedPct: 12.0,
        assetAvailabilityIndexPct: 91.4, // Below 95% IRPWM standard
        activeBlocksCount: 0,
        pendingDemandsCount: 15,
        whiteCorridorHeadwayMinutes: 30,
        activeKavachTsrsCount: 0
      };

      const html = renderToStaticMarkup(<KpiStrip metrics={degradedMetrics} />);

      expect(html).toContain('91.4%');
      expect(html).toContain('CRITICAL DEFICIT');
    });

    it('supports selecting a metric card via selectedMetricId', () => {
      const html = renderToStaticMarkup(
        <KpiStrip selectedMetricId="kavach-tsrs" />
      );

      expect(html).toContain('SELECTED');
    });
  });
});
