// tests/GroundCheckinPortal.test.tsx
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuthProvider } from '@/context/AuthContext';
import { GroundCheckinPortal } from '@/components/Field/GroundCheckinPortal';

describe('GroundCheckinPortal Component (Screen 5)', () => {
  it('renders multi-modal telemetry form with GPS geofence, YOLOv11 PPE, and 25kV OHE', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <GroundCheckinPortal />
      </AuthProvider>
    );

    expect(html).toContain('Screen 5 • Ground Execution Portal');
    expect(html).toContain('Anti-Ghost Block Verification Protocol');
    expect(html).toContain('1. GPS Geofence Radar');
    expect(html).toContain('2. YOLOv11 PPE Inspection');
    expect(html).toContain('3. 25kV OHE Discharge');
    expect(html).toContain('19.0178° N, 72.8478° E');
    expect(html).toContain('Earthing Rod Clamp Distance:');
    expect(html).toContain('Submit Check-In &amp; Claim Possession');
  });

  it('displays active persona and section selection options', () => {
    const html = renderToStaticMarkup(
      <AuthProvider>
        <GroundCheckinPortal />
      </AuthProvider>
    );

    expect(html).toContain('Dadar - Kurla (KM 14.2)');
    expect(html).toContain('TC-03 (UP Slow Line - Dadar)');
  });
});
