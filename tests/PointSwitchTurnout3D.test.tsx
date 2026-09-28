import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PointSwitchTurnout3D } from '@/components/Three/PointSwitchTurnout3D';

describe('TICKET-02: 3D Yard Point Switch Turnout & 4-Aspect Signal Twin', () => {
  it('renders switch header telemetry with DADAR JUNCTION SW-04 and 115mm stroke', () => {
    const html = renderToStaticMarkup(
      <PointSwitchTurnout3D
        switchId="SW-04"
        switchRoute="MAINLINE"
      />
    );

    expect(html).toContain('data-testid="3d-point-switch-turnout"');
    expect(html).toContain('DADAR JUNCTION SW-04');
    expect(html).toContain('115mm MECHANICAL STROKE');
  });

  it('renders signal aspect indicator for CLEAR (Green) and CAUTION/DANGER states', () => {
    const htmlClear = renderToStaticMarkup(
      <PointSwitchTurnout3D
        switchId="SW-04"
        signalAspect="CLEAR"
        switchRoute="MAINLINE"
      />
    );
    expect(htmlClear).toContain('SIGNAL ASPECT: CLEAR');

    const htmlDanger = renderToStaticMarkup(
      <PointSwitchTurnout3D
        switchId="SW-04"
        signalAspect="DANGER"
        switchRoute="TURNOUT"
        isLockedOut={true}
      />
    );
    expect(htmlDanger).toContain('SIGNAL ASPECT: DANGER');
    expect(htmlDanger).toContain('Lockout Active');
  });

  it('renders interactive route buttons for Mainline (Normal) and Platform 18 (Reverse)', () => {
    const html = renderToStaticMarkup(
      <PointSwitchTurnout3D
        switchId="SW-04"
        switchRoute="MAINLINE"
      />
    );

    expect(html).toContain('MAINLINE (NORMAL)');
    expect(html).toContain('PLATFORM 18 (REVERSE)');
    expect(html).toContain('Simulate Train Passing');
  });
});
