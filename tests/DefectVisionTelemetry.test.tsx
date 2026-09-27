// tests/DefectVisionTelemetry.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DefectVisionTelemetry, MAINTENANCE_SCENARIOS } from '@/components/Vision/DefectVisionTelemetry';

describe('Screen 3: DefectVisionTelemetry Dynamic Component', () => {
  it('renders all 4 maintenance scenarios in the selector bar', () => {
    const html = renderToStaticMarkup(<DefectVisionTelemetry />);

    MAINTENANCE_SCENARIOS.forEach((scenario) => {
      expect(html).toContain(scenario.name);
    });
  });

  it('renders live photographic feeds, USFD confidence badge, and defect standards', () => {
    const html = renderToStaticMarkup(<DefectVisionTelemetry />);

    expect(html).toContain('CONFIDENCE: 98.2%');
    expect(html).toContain('IMR FLAW #804');
    expect(html).toContain('IRPWM Chapter 5');
    expect(html).toContain('CSM Tamper #98');
  });

  it('renders Kavach TCAS Speedometer with RDSO physics and TSR target', () => {
    const html = renderToStaticMarkup(<DefectVisionTelemetry />);

    expect(html).toContain('Current Speed');
    expect(html).toContain('Target TSR Limit');
    expect(html).toContain('Calculated RDSO EBD Stopping Distance');
    expect(html).toContain('450 MHz UHF Locked');
  });

  it('renders TDMS Pantograph Cam and RDSO Cab Alarm Web Audio Synthesizer', () => {
    const html = renderToStaticMarkup(<DefectVisionTelemetry />);

    expect(html).toContain('TDMS Pantograph Cam');
    expect(html).toContain('OHE TOWER WAGON #60515 ACTIVE');
    expect(html).toContain('1200 Hz Caution Chime');
    expect(html).toContain('800 Hz Dual Alarm');
  });
});
