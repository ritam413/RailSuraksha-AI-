import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RailFlawHologram3D } from '@/components/Three/RailFlawHologram3D';
import { KavachCabRun3D } from '@/components/Three/KavachCabRun3D';

describe('TICKET-03: Defect Vision & Kavach Cab 3D Viewports', () => {
  it('renders RailFlawHologram3D with authentic UIC-60 rail header and defect badge', () => {
    const html = renderToStaticMarkup(
      <RailFlawHologram3D
        defectClassification="Transverse Fracture (IMR Flaw)"
        remediationMachine="CSM Tamper #98 + Rail Joint Clamp"
      />
    );

    expect(html).toContain('data-testid="3d-usfd-hologram"');
    expect(html).toContain('3D USFD VOLUMETRIC X-RAY (UIC-60)');
    expect(html).toContain('Transverse Fracture (IMR Flaw)');
    expect(html).toContain('Disseminate to P-Way');
  });

  it('renders KavachCabRun3D with speed telemetry and braking button', () => {
    const html = renderToStaticMarkup(
      <KavachCabRun3D
        currentSpeed={68}
        targetTsrSpeed={30}
      />
    );

    expect(html).toContain('data-testid="3d-kavach-run"');
    expect(html).toContain('3D FORWARD KAVACH TCAS RUN');
    expect(html).toContain('TSR CLAMP: 30 KM/H');
    expect(html).toContain('450 MHz UHF Locked');
    expect(html).toContain('Simulate Kavach Braking');
  });
});
