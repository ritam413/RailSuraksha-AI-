// tests/InterlockingMap.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SignalHead } from '@/components/Common/SignalHead';
import { InterlockingMap } from '@/components/Overview/InterlockingMap';
import { MOCK_TRACK_CIRCUITS } from '@/lib/mockData';

describe('TICKET-DEV1-04: Section Interlocking & Track Circuit Schematic', () => {
  describe('SignalHead Component', () => {
    it('renders 4-aspect signal head with RED aspect illuminated', () => {
      const html = renderToStaticMarkup(
        <SignalHead
          signalId="S-12"
          aspect="RED"
          isClamped={false}
        />
      );

      expect(html).toContain('S-12');
      expect(html).toContain('aspect-red-active');
      expect(html).toContain('bg-red-500');
    });

    it('renders DOUBLE_YELLOW aspect with both caution lamps lit', () => {
      const html = renderToStaticMarkup(
        <SignalHead
          signalId="S-18"
          aspect="DOUBLE_YELLOW"
          isClamped={false}
        />
      );

      expect(html).toContain('S-18');
      expect(html).toContain('aspect-yellow-top-active');
      expect(html).toContain('aspect-yellow-bottom-active');
    });

    it('renders padlock icon and lockout badge when signal is clamped', () => {
      const html = renderToStaticMarkup(
        <SignalHead
          signalId="S-12"
          aspect="RED"
          isClamped={true}
        />
      );

      expect(html).toContain('S&amp;T LOCKOUT');
      expect(html).toContain('lucide-lock');
    });
  });

  describe('InterlockingMap Component', () => {
    it('renders all 6 CSMT-Kalyan track circuits (TC-01 through TC-06)', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedCircuitId="TC-03"
          onTrackSelect={() => {}}
        />
      );

      expect(html).toContain('TC-01');
      expect(html).toContain('TC-02');
      expect(html).toContain('TC-03');
      expect(html).toContain('TC-04');
      expect(html).toContain('TC-05');
      expect(html).toContain('TC-06');
      expect(html).toContain('CSMT');
      expect(html).toContain('Dadar');
      expect(html).toContain('Kalyan');
    });

    it('normalizes legacy BLK-101 ID gracefully', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedTrackId="BLK-101"
        />
      );

      expect(html).toContain('TC-01');
      expect(html).toContain('CSMT');
    });

    it('renders safe fallback when circuits array is completely empty', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap circuits={[]} />
      );

      expect(html).toContain('TC-03');
      expect(html).toContain('Section Interlocking');
    });

    it('renders Form S&T/T-351 statutory lockout warning for clamped circuits', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedCircuitId="TC-03"
          onTrackSelect={() => {}}
        />
      );

      expect(html).toContain('FORM S&amp;T/T-351 STATUTORY LOCKOUT');
      expect(html).toContain('Automatic Train Stop Engaged');
      expect(html).toContain('Signal Clamped Danger at S-12');
    });

    it('renders OHE 25kV power isolation badge and speed restriction indicators', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedCircuitId="TC-03"
          onTrackSelect={() => {}}
        />
      );

      expect(html).toContain('25kV ISOLATED');
      expect(html).toContain('30 km/h TSR');
    });

    it('renders switch SW-04 route state and interlocking controls', () => {
      const html = renderToStaticMarkup(
        <InterlockingMap
          circuits={MOCK_TRACK_CIRCUITS}
          selectedCircuitId="TC-01"
          onTrackSelect={() => {}}
        />
      );

      expect(html).toContain('SWITCH SW-04:');
      expect(html).toContain('NORMAL ROUTE');
      expect(html).toContain('AXLE COUNTER DUAL-DETECTION');
    });
  });
});
